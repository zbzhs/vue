import { getProductByStyleNo, getProductsPayload } from "./product-service.mjs";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
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
