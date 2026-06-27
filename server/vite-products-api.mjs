import fs from "node:fs";
import path from "node:path";

import {
  getProductByStyleNo,
  getProductsPayload,
  resolveDetailImagePath,
  resolveProductImagePath,
} from "./product-service.mjs";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

  res.statusCode = 200;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  fs.createReadStream(filePath).pipe(res);
}

async function handleProductsApi(req, res) {
  if (!req.url) {
    return false;
  }

  const url = new URL(req.url, "http://localhost");

  if (req.method !== "GET") {
    return false;
  }

  if (url.pathname === "/api/products") {
    const payload = await getProductsPayload();
    sendJson(res, 200, payload);
    return true;
  }

  if (url.pathname.startsWith("/api/products/")) {
    const styleNo = decodeURIComponent(url.pathname.replace("/api/products/", ""));
    const product = await getProductByStyleNo(styleNo);

    if (!product) {
      sendJson(res, 404, { message: "Product not found" });
      return true;
    }

    sendJson(res, 200, product);
    return true;
  }

  if (url.pathname.startsWith("/api/product-detail-images/")) {
    const [, encodedStyleNo, encodedFileName] =
      url.pathname.match(/^\/api\/product-detail-images\/([^/]+)\/([^/]+)$/) || [];
    const styleNo = encodedStyleNo ? decodeURIComponent(encodedStyleNo) : "";
    const fileName = encodedFileName ? decodeURIComponent(encodedFileName) : "";
    const imagePath = resolveDetailImagePath(styleNo, fileName);

    if (!imagePath) {
      sendJson(res, 404, { message: "Detail image not found" });
      return true;
    }

    sendFile(res, imagePath);
    return true;
  }

  if (url.pathname.startsWith("/api/product-images/")) {
    const [, encodedImageKind, encodedFileName] =
      url.pathname.match(/^\/api\/product-images\/([^/]+)\/([^/]+)$/) || [];
    const imageKind = encodedImageKind ? decodeURIComponent(encodedImageKind) : "";
    const fileName = encodedFileName ? decodeURIComponent(encodedFileName) : "";
    const imagePath = resolveProductImagePath(imageKind, fileName);

    if (!imagePath) {
      sendJson(res, 404, { message: "Product image not found" });
      return true;
    }

    sendFile(res, imagePath);
    return true;
  }

  if (url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true });
    return true;
  }

  return false;
}

function createMiddleware() {
  return async (req, res, next) => {
    try {
      const handled = await handleProductsApi(req, res);
      if (!handled) {
        next();
      }
    } catch (error) {
      console.error("Products API error:", error);
      sendJson(res, 500, {
        message: "Failed to load products from database",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
}

export function productsApiPlugin() {
  return {
    name: "products-api-plugin",
    configureServer(server) {
      server.middlewares.use(createMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMiddleware());
    },
  };
}
