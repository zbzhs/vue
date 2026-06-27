import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "dering123654",
  database: process.env.DB_NAME || "jewelry_product_db",
  charset: "utf8mb4",
  decimalNumbers: true,
};

function normalizeText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  if (!text || text === "/") {
    return null;
  }

  return text;
}

function splitLines(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getProductImageKind(row) {
  const values = [row.object, row.image_url].map((value) => normalizeText(value))

  for (const value of values) {
    if (!value) {
      continue
    }

    const normalizedValue = value.replaceAll('\\', '/').toLowerCase()
    if (normalizedValue.startsWith('product1/') || normalizedValue.includes('/product1/')) {
      return 'product1'
    }

    if (normalizedValue.startsWith('product2/') || normalizedValue.includes('/product2/')) {
      return 'product2'
    }
  }

  return ''
}

async function fetchProductImagesMap(connection) {
  try {
    const [rows] = await connection.execute(`
      SELECT product_style_no, image_url, \`object\`, id
      FROM product_image
      WHERE image_url IS NOT NULL AND image_url <> ''
      ORDER BY product_style_no, id
    `);

    const imageMap = new Map();

    for (const row of rows) {
      const styleNo = normalizeText(row.product_style_no);
      const imageUrl = normalizeText(row.image_url);
      const imageKind = getProductImageKind(row);

      if (!styleNo || !imageUrl) {
        continue;
      }

      if (!imageMap.has(styleNo)) {
        imageMap.set(styleNo, {
          primary: '',
          alternate: '',
          gallery: [],
        });
      }

      const images = imageMap.get(styleNo);
      if (!images.gallery.includes(imageUrl)) {
        images.gallery.push(imageUrl);
      }

      if (imageKind === 'product1' && !images.primary) {
        images.primary = imageUrl;
      } else if (imageKind === 'product2' && !images.alternate) {
        images.alternate = imageUrl;
      }
    }

    return imageMap;
  } catch (error) {
    console.warn("Failed to load product images:", error);
    return new Map();
  }
}

function buildNote(row) {
  const parts = [];

  for (const key of ["metal_material", "stone_color", "stone_shape"]) {
    const value = normalizeText(row[key]);
    if (value && !parts.includes(value)) {
      parts.push(value);
    }
  }

  const stoneValue = normalizeText(row.main_stone) || normalizeText(row.side_stone);
  if (stoneValue) {
    parts.push(stoneValue);
  }

  return parts.join(" / ");
}

function buildSpecs(row) {
  const specs = [];

  const pushSpec = (label, value) => {
    const text = normalizeText(value);
    if (text) {
      specs.push({ label, value: text });
    }
  };

  pushSpec("品类", row.category);
  pushSpec("系列", row.pallet_series);
  pushSpec("金属材质", row.metal_material);

  if (row.total_weight !== null && row.total_weight !== undefined) {
    specs.push({ label: "总重", value: `${Number(row.total_weight).toFixed(2)}g` });
  }

  pushSpec("石颜色", row.stone_color);
  pushSpec("石形状", row.stone_shape);
  pushSpec("主石", row.main_stone);
  pushSpec("副石", row.side_stone);
  pushSpec("尺寸说明", row.size_desc);

  if (row.real_total_stock !== null && row.real_total_stock !== undefined) {
    specs.push({ label: "实时库存", value: String(row.real_total_stock) });
  }

  if (row.live_price !== null && row.live_price !== undefined) {
    specs.push({ label: "达播价", value: `${Number(row.live_price).toFixed(0)} 元` });
  }

  if (row.max_label_price !== null && row.max_label_price !== undefined) {
    specs.push({ label: "标签价", value: `${Number(row.max_label_price).toFixed(0)} 元` });
  }

  if (row.commission !== null && row.commission !== undefined) {
    specs.push({ label: "佣金", value: `${Number(row.commission).toFixed(2)}%` });
  }

  if (row.unshipped_qty !== null && row.unshipped_qty !== undefined) {
    specs.push({ label: "未出货数", value: String(row.unshipped_qty) });
  }

  return specs;
}

function mapRow(row, productImagesMap) {
  const guaranteeInfo = normalizeText(row.guarantee_info);
  const remark = normalizeText(row.remark);
  const sellingPoint = normalizeText(row.selling_point);
  const styleNo = String(row.style_no);
  const productImages = productImagesMap.get(styleNo) || {};
  const image = normalizeText(productImages.primary);
  const alternateImage = normalizeText(productImages.alternate);
  const detailImages = Array.isArray(productImages.gallery) ? productImages.gallery : [];
  const displayPrice =
    row.max_label_price === null || row.max_label_price === undefined
      ? row.live_price === null || row.live_price === undefined
        ? null
        : Number(row.live_price)
      : Number(row.max_label_price);

  return {
    code: styleNo,
    styleNo,
    series: normalizeText(row.pallet_series) || "未分类系列",
    name: normalizeText(row.product_name) || styleNo,
    type: normalizeText(row.category) || "未分类",
    material: normalizeText(row.metal_material),
    price: displayPrice,
    labelPrice:
      row.max_label_price === null || row.max_label_price === undefined ? null : Number(row.max_label_price),
    inventory: row.real_total_stock,
    unshippedQty: row.unshipped_qty,
    commission: row.commission === null || row.commission === undefined ? null : Number(row.commission),
    note: buildNote(row),
    image: image || alternateImage || "/images/products-hero-earring.png",
    alternateImage,
    imageDisplayScale: 1,
    detailImages,
    brand: "DERING",
    sellingPoint,
    guaranteeInfo,
    guaranteeLines: splitLines(guaranteeInfo),
    remark,
    specs: buildSpecs(row),
  };
}

export async function getProductsPayload() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.execute(`
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
    `);

    const productImagesMap = await fetchProductImagesMap(connection);
    const products = rows.map((row) => mapRow(row, productImagesMap));
    return {
      count: products.length,
      products,
    };
  } finally {
    await connection.end();
  }
}

export async function getProductByStyleNo(styleNo) {
  const payload = await getProductsPayload();
  return payload.products.find((item) => item.styleNo === styleNo) || null;
}
