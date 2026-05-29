from __future__ import annotations

import json
import shutil
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path

import pymysql
from pymysql.cursors import DictCursor


DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "123456",
    "database": "jewelry_product_db",
    "charset": "utf8mb4",
    "cursorclass": DictCursor,
}

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public"
DATA_DIR = PUBLIC_DIR / "data"
SOURCE_IMAGE_DIR = PUBLIC_DIR / "images" / "products one"
TARGET_IMAGE_DIR = PUBLIC_DIR / "images" / "products"
OUTPUT_JSON = DATA_DIR / "products.json"


@dataclass
class ProductImage:
    public_path: str
    source_path: Path | None


def decimal_to_number(value: Decimal | None) -> float | None:
    if value is None:
        return None
    return float(value)


def normalize_text(value: object) -> str | None:
    if value in (None, "", "/"):
        return None
    return str(value).strip()


def split_lines(value: str | None) -> list[str]:
    if not value:
        return []
    return [line.strip() for line in value.splitlines() if line.strip()]


def resolve_image(style_no: str) -> ProductImage:
    exact_match = SOURCE_IMAGE_DIR / f"{style_no}.png"
    if exact_match.exists():
        return ProductImage(public_path=f"/images/products/{style_no}.png", source_path=exact_match)

    fallback_matches = sorted(SOURCE_IMAGE_DIR.glob(f"{style_no}-*.png"))
    if fallback_matches:
        return ProductImage(public_path=f"/images/products/{style_no}.png", source_path=fallback_matches[0])

    return ProductImage(public_path="/images/products-hero-earring.png", source_path=None)


def build_note(row: dict[str, object]) -> str:
    parts: list[str] = []

    for key in ("metal_material", "stone_color", "stone_shape"):
        value = normalize_text(row.get(key))
        if value and value not in parts:
            parts.append(value)

    stone_value = normalize_text(row.get("main_stone")) or normalize_text(row.get("side_stone"))
    if stone_value:
        parts.append(stone_value)

    return " / ".join(parts)


def build_specs(row: dict[str, object]) -> list[dict[str, str]]:
    specs: list[dict[str, str]] = []

    def add_spec(label: str, value: object) -> None:
        text = normalize_text(value)
        if text:
            specs.append({"label": label, "value": text})

    add_spec("品类", row.get("category"))
    add_spec("系列", row.get("pallet_series"))
    add_spec("金属材质", row.get("metal_material"))

    total_weight = row.get("total_weight")
    if total_weight is not None:
        specs.append({"label": "总重", "value": f"{decimal_to_number(total_weight):.2f}g"})

    add_spec("石颜色", row.get("stone_color"))
    add_spec("石形状", row.get("stone_shape"))
    add_spec("主石", row.get("main_stone"))
    add_spec("副石", row.get("side_stone"))
    add_spec("尺寸说明", row.get("size_desc"))

    stock = row.get("real_total_stock")
    if stock is not None:
        specs.append({"label": "实时库存", "value": str(stock)})

    live_price = row.get("live_price")
    if live_price is not None:
        specs.append({"label": "达播价", "value": f"{decimal_to_number(live_price):.0f} 元"})

    label_price = row.get("max_label_price")
    if label_price is not None:
        specs.append({"label": "标签价", "value": f"{decimal_to_number(label_price):.0f} 元"})

    commission = row.get("commission")
    if commission is not None:
        specs.append({"label": "佣金", "value": f"{decimal_to_number(commission):.2f}%"})

    unshipped_qty = row.get("unshipped_qty")
    if unshipped_qty is not None:
        specs.append({"label": "未出货数", "value": str(unshipped_qty)})

    return specs


def fetch_products() -> list[dict[str, object]]:
    sql = """
        SELECT
            style_no,
            pallet_series,
            product_name,
            category,
            metal_material,
            total_weight,
            stone_color,
            stone_shape,
            main_stone,
            side_stone,
            size_desc,
            real_total_stock,
            max_label_price,
            unshipped_qty,
            live_price,
            commission,
            selling_point,
            guarantee_info,
            remark
        FROM product
        ORDER BY style_no
    """

    connection = pymysql.connect(**DB_CONFIG)
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            return list(cursor.fetchall())
    finally:
        connection.close()


def ensure_product_images(products: list[dict[str, object]]) -> dict[str, str]:
    TARGET_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    image_map: dict[str, str] = {}

    for product in products:
        style_no = str(product["style_no"])
        image = resolve_image(style_no)
        image_map[style_no] = image.public_path

        if image.source_path is None:
            continue

        target_path = TARGET_IMAGE_DIR / f"{style_no}.png"
        if not target_path.exists() or target_path.read_bytes() != image.source_path.read_bytes():
            shutil.copy2(image.source_path, target_path)

    return image_map


def build_payload(products: list[dict[str, object]], image_map: dict[str, str]) -> dict[str, object]:
    payload = []

    for row in products:
        style_no = str(row["style_no"])
        guarantee_text = normalize_text(row.get("guarantee_info"))
        remark_text = normalize_text(row.get("remark"))
        selling_point_text = normalize_text(row.get("selling_point"))

        payload.append(
            {
                "code": style_no,
                "styleNo": style_no,
                "series": normalize_text(row.get("pallet_series")) or "未分类系列",
                "name": normalize_text(row.get("product_name")) or style_no,
                "type": normalize_text(row.get("category")) or "未分类",
                "material": normalize_text(row.get("metal_material")),
                "price": decimal_to_number(row.get("live_price")),
                "labelPrice": decimal_to_number(row.get("max_label_price")),
                "inventory": row.get("real_total_stock"),
                "unshippedQty": row.get("unshipped_qty"),
                "commission": decimal_to_number(row.get("commission")),
                "note": build_note(row),
                "image": image_map[style_no],
                "brand": "DERING",
                "sellingPoint": selling_point_text,
                "guaranteeInfo": guarantee_text,
                "guaranteeLines": split_lines(guarantee_text),
                "remark": remark_text,
                "specs": build_specs(row),
            }
        )

    return {
        "count": len(payload),
        "products": payload,
    }


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    products = fetch_products()
    image_map = ensure_product_images(products)
    payload = build_payload(products, image_map)
    OUTPUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {payload['count']} products to {OUTPUT_JSON}")


if __name__ == "__main__":
    main()
