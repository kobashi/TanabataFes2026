const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const ADMIN_KEY = process.env.ADMIN_KEY || "tanabata2026";
const MAX_WISH_LINES = 2;
const MAX_WISH_LINE_LENGTH = 13;

const rootDir = __dirname;
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const dataFile = path.join(dataDir, "wishes.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

let writeQueue = Promise.resolve();
const adminClients = new Set();

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]\n", "utf8");
  }
}

async function readWishes() {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");
  const parsed = JSON.parse(raw || "[]");
  return Array.isArray(parsed) ? parsed : [];
}

async function writeWishes(wishes) {
  writeQueue = writeQueue.then(async () => {
    await ensureStore();
    const tmpFile = `${dataFile}.${process.pid}.tmp`;
    await fs.writeFile(tmpFile, `${JSON.stringify(wishes, null, 2)}\n`, "utf8");
    await fs.rename(tmpFile, dataFile);
  });
  return writeQueue;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function broadcastAdminUpdate() {
  const payload = `event: update\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`;
  for (const client of adminClients) {
    client.write(payload);
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 16_384) {
        reject(new Error("request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("invalid json"));
      }
    });
    req.on("error", reject);
  });
}

function isAdmin(req, url) {
  const headerKey = req.headers["x-admin-key"];
  const queryKey = url.searchParams.get("adminKey");
  return headerKey === ADMIN_KEY || queryKey === ADMIN_KEY;
}

function publicWish(wish) {
  return {
    id: wish.id,
    text: wish.text,
    status: wish.status,
    createdAt: wish.createdAt,
    approvedAt: wish.approvedAt || null
  };
}

function sanitizeWishText(input) {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeWishLines(body) {
  const rawLines = Array.isArray(body?.lines)
    ? body.lines
    : sanitizeWishText(body?.text).split("\n");

  return rawLines
    .map((line) => sanitizeWishText(line).replace(/\n+/g, "").trim())
    .filter((line) => line.length > 0);
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/admin/events") {
    if (!isAdmin(req, url)) {
      sendError(res, 401, "管理キーが必要です。");
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);
    adminClients.add(res);

    const keepAlive = setInterval(() => {
      res.write(`event: ping\ndata: ${Date.now()}\n\n`);
    }, 25000);

    req.on("close", () => {
      clearInterval(keepAlive);
      adminClients.delete(res);
    });

    return;
  }

  if (req.method === "POST" && url.pathname === "/api/wishes") {
    const body = await parseJsonBody(req);
    const lines = normalizeWishLines(body);
    if (!lines.length) {
      sendError(res, 400, "願い事を入力してください。");
      return;
    }

    if (lines.length > MAX_WISH_LINES) {
      sendError(res, 400, `願い事は${MAX_WISH_LINES}行までです。`);
      return;
    }

    const tooLong = lines.find((line) => [...line].length > MAX_WISH_LINE_LENGTH);
    if (tooLong) {
      sendError(res, 400, `1行は${MAX_WISH_LINE_LENGTH}文字以内で入力してください。`);
      return;
    }

    const wishes = await readWishes();
    const now = new Date().toISOString();
    const wish = {
      id: crypto.randomUUID(),
      text: lines.join("\n"),
      status: "pending",
      createdAt: now,
      approvedAt: null,
      rejectedAt: null
    };
    wishes.unshift(wish);
    await writeWishes(wishes);
    broadcastAdminUpdate();
    sendJson(res, 201, { wish: publicWish(wish) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/wishes") {
    if (!isAdmin(req, url)) {
      sendError(res, 401, "管理キーが必要です。");
      return;
    }
    const status = url.searchParams.get("status");
    const wishes = await readWishes();
    const filtered = status ? wishes.filter((wish) => wish.status === status) : wishes;
    sendJson(res, 200, { wishes: filtered.map(publicWish) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/approved") {
    const wishes = await readWishes();
    const approved = wishes
      .filter((wish) => wish.status === "approved")
      .sort((a, b) => String(b.approvedAt).localeCompare(String(a.approvedAt)));
    sendJson(res, 200, { wishes: approved.map(publicWish), generatedAt: new Date().toISOString() });
    return;
  }

  const match = url.pathname.match(/^\/api\/wishes\/([^/]+)$/);
  if (match && ["PATCH", "DELETE"].includes(req.method)) {
    if (!isAdmin(req, url)) {
      sendError(res, 401, "管理キーが必要です。");
      return;
    }

    const id = decodeURIComponent(match[1]);
    const wishes = await readWishes();
    const wish = wishes.find((item) => item.id === id);
    if (!wish) {
      sendError(res, 404, "願い事が見つかりません。");
      return;
    }

    if (req.method === "DELETE") {
      await writeWishes(wishes.filter((item) => item.id !== id));
      broadcastAdminUpdate();
      sendJson(res, 200, { ok: true });
      return;
    }

    const body = await parseJsonBody(req);
    const nextStatus = String(body.status || "");
    if (!["pending", "approved", "rejected"].includes(nextStatus)) {
      sendError(res, 400, "status は pending / approved / rejected のいずれかです。");
      return;
    }
    const now = new Date().toISOString();
    wish.status = nextStatus;
    wish.approvedAt = nextStatus === "approved" ? now : wish.approvedAt;
    wish.rejectedAt = nextStatus === "rejected" ? now : wish.rejectedAt;
    await writeWishes(wishes);
    broadcastAdminUpdate();
    sendJson(res, 200, { wish: publicWish(wish) });
    return;
  }

  sendError(res, 404, "API endpoint not found.");
}

async function serveStatic(req, res, url) {
  const routes = {
    "/": "index.html",
    "/admin": "admin.html",
    "/projection": "projection.html"
  };
  const requested = routes[url.pathname] || decodeURIComponent(url.pathname.slice(1));
  const normalized = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, normalized);
  if (!filePath.startsWith(publicDir)) {
    sendError(res, 403, "Forbidden");
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sendError(res, 404, "Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const body = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store"
    });
    res.end(body);
  } catch {
    sendError(res, 404, "Not found");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendError(res, 500, error.message || "Internal server error");
  }
});

ensureStore()
  .then(() => {
    server.listen(PORT, HOST, () => {
      console.log(`Tanabata server: http://localhost:${PORT}`);
      console.log(`Projection:       http://localhost:${PORT}/projection`);
      console.log(`Admin:            http://localhost:${PORT}/admin`);
      console.log(`Admin key:        ${ADMIN_KEY}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
