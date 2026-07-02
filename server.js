const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const ADMIN_KEY = process.env.ADMIN_KEY || "tanabata2026";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODERATION_MODEL = process.env.OPENAI_MODERATION_MODEL || "omni-moderation-latest";
const MODERATION_TIMEOUT_MS = Number(process.env.MODERATION_TIMEOUT_MS || 5000);
const MAX_WISH_LINES = 2;
const MAX_WISH_LINE_LENGTH = 13;
const MIN_PROJECTION_DISPLAY_COUNT = 1;
const MAX_PROJECTION_DISPLAY_COUNT = 30;
const MAX_PROJECTION_SLOT_COUNT = 60;
const MIN_PROJECTION_TYPING_INTERVAL_MS = 60;
const MAX_PROJECTION_TYPING_INTERVAL_MS = 1000;
const MIN_PROJECTION_ROTATE_INTERVAL_MS = 5000;
const MAX_PROJECTION_ROTATE_INTERVAL_MS = 120000;
const MIN_PROJECTION_EFFECT_INTERVAL_MS = 60000;
const MAX_PROJECTION_EFFECT_INTERVAL_MS = 1800000;
const MIN_PROJECTION_MILKY_WAY_GAIN = 0.5;
const MAX_PROJECTION_MILKY_WAY_GAIN = 4;
const MIN_PROJECTION_PARALLAX_STRENGTH = 0;
const MAX_PROJECTION_PARALLAX_STRENGTH = 3;
const MIN_PROJECTION_PARALLAX_VANISHING_POINT = -1;
const MAX_PROJECTION_PARALLAX_VANISHING_POINT = 1;
const MIN_PROJECTION_CLOUD_COUNT = 0;
const MAX_PROJECTION_CLOUD_COUNT = 12;
const MIN_PROJECTION_CLOUD_ORIGIN_X = -80;
const MAX_PROJECTION_CLOUD_ORIGIN_X = 120;
const MIN_PROJECTION_CLOUD_ORIGIN_Y = -20;
const MAX_PROJECTION_CLOUD_ORIGIN_Y = 100;
const PROJECTION_PRESET_COUNT = 3;

const rootDir = __dirname;
const publicDir = path.join(rootDir, "public");
const dataDir = path.resolve(rootDir, process.env.DATA_DIR || "data");
const dataFile = path.join(dataDir, "wishes.json");
const backupDir = path.join(dataDir, "backups");
const settingsFile = path.join(dataDir, "settings.json");

const DEFAULT_SETTINGS = {
  moderationMode: "manual",
  projectionDisplayCount: 12,
  projectionSlotCount: 15,
  projectionMoveCount: 1,
  projectionTypingIntervalMs: 240,
  projectionRotateIntervalMs: 18000,
  projectionEffectAutoEnabled: false,
  projectionEffectIntervalMs: 300000,
  projectionMilkyWayGain: 1.75,
  projectionExperimentalParallaxEnabled: false,
  projectionParallaxStrength: 1,
  projectionParallaxVanishingPointX: 0,
  projectionParallaxVanishingPointY: 0,
  projectionCloudCount: 3,
  projectionCloudOriginX: -32,
  projectionCloudOriginY: 12,
  projectionCloudSeed: "tanabata-clouds",
  projectionPresets: Array.from({ length: PROJECTION_PRESET_COUNT }, () => null)
};
const MODERATION_MODES = new Set(["manual", "auto", "ai"]);
const CAUTION_RULES = [
  {
    reason: "連絡先らしき内容を含むため手動確認",
    patterns: [
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
      /(?:https?:\/\/|www\.)\S+/i,
      /(?:\+?81[-\s]?)?0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}/
    ]
  },
  {
    reason: "SNSや外部連絡先らしき内容を含むため手動確認",
    patterns: [
      /(?:line|instagram|insta|tiktok|twitter|x)\s*(?:id|アカウント|垢|:|：)/i,
      /(?:ライン|インスタ|ティックトック|ツイッター)\s*(?:id|アカウント|垢|:|：)?/i,
      /@[A-Za-z0-9_]{3,}/
    ]
  },
  {
    reason: "個人情報らしき内容を含むため手動確認",
    patterns: [
      /(?:住所|電話|連絡先|メール|メアド|本名|氏名|学籍番号|学生番号|クラス|部活|サークル)/
    ]
  },
  {
    reason: "名指し攻撃や強い表現の可能性があるため手動確認",
    patterns: [
      /(?:死ね|殺す|消えろ|晒す|嫌い|きもい|キモい|きも|キモ|きしょい|キショい|バカ|馬鹿|ばか|アホ|あほ|うざい|クズ)/,
      /(?:しね|タヒね|たひね|ﾀﾋね|しな|死な|shine|shiine|4ね)/
    ]
  },
  {
    reason: "悪戯や下品な表現の可能性があるため手動確認",
    patterns: [
      /(?:うんこ|うんち|おしっこ|くそ|クソ|糞|ちんこ|ちんちん|まんこ|おっぱい)/
    ]
  }
];
const REVIEW_SCORE_THRESHOLD = Number(process.env.MODERATION_REVIEW_SCORE_THRESHOLD || 0.25);

const MODERATION_STRIP_RE = /[\u0000-\u001f\u007f\s\u200b\u200c\u200d\u2060\u3000\p{P}\p{S}]+/gu;

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
let settingsWriteQueue = Promise.resolve();
const adminClients = new Set();
let latestProjectionEffect = null;
let lastProjectionEffectAt = 0;

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]\n", "utf8");
  }
}

function backupRevision() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function backupFileForRevision(revision) {
  const safeRevision = String(revision || "");
  if (!/^20\d{2}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/.test(safeRevision)) {
    return null;
  }
  return path.join(backupDir, `wishes-${safeRevision}.json`);
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

function normalizeBackupPayload(parsed, fallbackRevision = "") {
  const wishes = Array.isArray(parsed) ? parsed : parsed?.wishes;
  if (!Array.isArray(wishes)) {
    throw new Error("backup payload is invalid");
  }
  const createdAt = Array.isArray(parsed)
    ? fallbackRevision.replace(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
        "$1-$2-$3T$4:$5:$6.$7Z"
      )
    : parsed.createdAt;
  return {
    revision: Array.isArray(parsed) ? fallbackRevision : parsed.revision || fallbackRevision,
    createdAt: createdAt || null,
    reason: Array.isArray(parsed) ? "manual-file" : parsed.reason || "manual",
    wishes
  };
}

async function createWishBackup(reason = "manual") {
  await ensureStore();
  await fs.mkdir(backupDir, { recursive: true });
  const wishes = await readWishes();
  const revision = backupRevision();
  const payload = {
    revision,
    createdAt: new Date().toISOString(),
    reason,
    wishCount: wishes.length,
    byStatus: countByStatus(wishes),
    wishes
  };
  const backupFile = path.join(backupDir, `wishes-${revision}.json`);
  await fs.writeFile(backupFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return {
    revision,
    createdAt: payload.createdAt,
    reason,
    wishCount: payload.wishCount,
    byStatus: payload.byStatus
  };
}

async function readWishBackup(revision) {
  const backupFile = backupFileForRevision(revision);
  if (!backupFile) {
    throw new Error("backup revision is invalid");
  }
  const raw = await fs.readFile(backupFile, "utf8");
  return normalizeBackupPayload(JSON.parse(raw || "{}"), revision);
}

async function listWishBackups() {
  await ensureStore();
  await fs.mkdir(backupDir, { recursive: true });
  const entries = await fs.readdir(backupDir, { withFileTypes: true });
  const backups = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const match = entry.name.match(/^wishes-(20\d{2}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.json$/);
    if (!match) continue;
    try {
      const backup = await readWishBackup(match[1]);
      backups.push({
        revision: backup.revision,
        createdAt: backup.createdAt,
        reason: backup.reason,
        wishCount: backup.wishes.length,
        byStatus: countByStatus(backup.wishes)
      });
    } catch {
      backups.push({
        revision: match[1],
        createdAt: null,
        reason: "invalid",
        wishCount: 0,
        byStatus: {}
      });
    }
  }

  return backups.sort((a, b) => String(b.revision).localeCompare(String(a.revision)));
}

async function readSettings() {
  await ensureStore();
  try {
    const raw = await fs.readFile(settingsFile, "utf8");
    const parsed = JSON.parse(raw || "{}");
    const mode = MODERATION_MODES.has(parsed.moderationMode) ? parsed.moderationMode : DEFAULT_SETTINGS.moderationMode;
    const slotCount = normalizeInteger(
      parsed.projectionSlotCount,
      DEFAULT_SETTINGS.projectionSlotCount,
      MIN_PROJECTION_DISPLAY_COUNT,
      MAX_PROJECTION_SLOT_COUNT
    );
    const displayCount = normalizeInteger(
      parsed.projectionDisplayCount,
      Math.min(DEFAULT_SETTINGS.projectionDisplayCount, slotCount),
      MIN_PROJECTION_DISPLAY_COUNT,
      Math.min(MAX_PROJECTION_DISPLAY_COUNT, slotCount)
    );
    const moveCount = normalizeInteger(
      parsed.projectionMoveCount,
      DEFAULT_SETTINGS.projectionMoveCount,
      1,
      displayCount
    );
    const typingIntervalMs = normalizeInteger(
      parsed.projectionTypingIntervalMs,
      DEFAULT_SETTINGS.projectionTypingIntervalMs,
      MIN_PROJECTION_TYPING_INTERVAL_MS,
      MAX_PROJECTION_TYPING_INTERVAL_MS
    );
    const rotateIntervalMs = normalizeInteger(
      parsed.projectionRotateIntervalMs,
      DEFAULT_SETTINGS.projectionRotateIntervalMs,
      MIN_PROJECTION_ROTATE_INTERVAL_MS,
      MAX_PROJECTION_ROTATE_INTERVAL_MS
    );
    const effectIntervalMs = normalizeInteger(
      parsed.projectionEffectIntervalMs,
      DEFAULT_SETTINGS.projectionEffectIntervalMs,
      MIN_PROJECTION_EFFECT_INTERVAL_MS,
      MAX_PROJECTION_EFFECT_INTERVAL_MS
    );
    const milkyWayGain = normalizeNumber(
      parsed.projectionMilkyWayGain,
      DEFAULT_SETTINGS.projectionMilkyWayGain,
      MIN_PROJECTION_MILKY_WAY_GAIN,
      MAX_PROJECTION_MILKY_WAY_GAIN
    );
    const parallaxStrength = normalizeNumber(
      parsed.projectionParallaxStrength,
      DEFAULT_SETTINGS.projectionParallaxStrength,
      MIN_PROJECTION_PARALLAX_STRENGTH,
      MAX_PROJECTION_PARALLAX_STRENGTH
    );
    const parallaxVanishingPointX = normalizeNumber(
      parsed.projectionParallaxVanishingPointX,
      DEFAULT_SETTINGS.projectionParallaxVanishingPointX,
      MIN_PROJECTION_PARALLAX_VANISHING_POINT,
      MAX_PROJECTION_PARALLAX_VANISHING_POINT
    );
    const parallaxVanishingPointY = normalizeNumber(
      parsed.projectionParallaxVanishingPointY,
      DEFAULT_SETTINGS.projectionParallaxVanishingPointY,
      MIN_PROJECTION_PARALLAX_VANISHING_POINT,
      MAX_PROJECTION_PARALLAX_VANISHING_POINT
    );
    const cloudCount = normalizeInteger(
      parsed.projectionCloudCount,
      DEFAULT_SETTINGS.projectionCloudCount,
      MIN_PROJECTION_CLOUD_COUNT,
      MAX_PROJECTION_CLOUD_COUNT
    );
    const cloudOriginX = normalizeNumber(
      parsed.projectionCloudOriginX,
      DEFAULT_SETTINGS.projectionCloudOriginX,
      MIN_PROJECTION_CLOUD_ORIGIN_X,
      MAX_PROJECTION_CLOUD_ORIGIN_X
    );
    const cloudOriginY = normalizeNumber(
      parsed.projectionCloudOriginY,
      DEFAULT_SETTINGS.projectionCloudOriginY,
      MIN_PROJECTION_CLOUD_ORIGIN_Y,
      MAX_PROJECTION_CLOUD_ORIGIN_Y
    );
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      moderationMode: mode,
      projectionDisplayCount: displayCount,
      projectionSlotCount: slotCount,
      projectionMoveCount: moveCount,
      projectionTypingIntervalMs: typingIntervalMs,
      projectionRotateIntervalMs: rotateIntervalMs,
      projectionEffectAutoEnabled: parsed.projectionEffectAutoEnabled === true,
      projectionEffectIntervalMs: effectIntervalMs,
      projectionMilkyWayGain: milkyWayGain,
      projectionExperimentalParallaxEnabled: parsed.projectionExperimentalParallaxEnabled === true,
      projectionParallaxStrength: parallaxStrength,
      projectionParallaxVanishingPointX: parallaxVanishingPointX,
      projectionParallaxVanishingPointY: parallaxVanishingPointY,
      projectionCloudCount: cloudCount,
      projectionCloudOriginX: cloudOriginX,
      projectionCloudOriginY: cloudOriginY,
      projectionCloudSeed: String(parsed.projectionCloudSeed || DEFAULT_SETTINGS.projectionCloudSeed).slice(0, 80),
      projectionPresets: normalizeProjectionPresets(parsed.projectionPresets)
    };
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    return { ...DEFAULT_SETTINGS };
  }
}

function normalizeInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, number));
}

function normalizeNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, number));
}

function projectionPresetFromSettings(settings) {
  return {
    projectionDisplayCount: settings.projectionDisplayCount,
    projectionSlotCount: settings.projectionSlotCount,
    projectionMoveCount: settings.projectionMoveCount,
    projectionTypingIntervalMs: settings.projectionTypingIntervalMs,
    projectionRotateIntervalMs: settings.projectionRotateIntervalMs,
    projectionEffectAutoEnabled: settings.projectionEffectAutoEnabled === true,
    projectionEffectIntervalMs: settings.projectionEffectIntervalMs,
    projectionMilkyWayGain: settings.projectionMilkyWayGain,
    projectionExperimentalParallaxEnabled: settings.projectionExperimentalParallaxEnabled === true,
    projectionParallaxStrength: settings.projectionParallaxStrength,
    projectionParallaxVanishingPointX: settings.projectionParallaxVanishingPointX,
    projectionParallaxVanishingPointY: settings.projectionParallaxVanishingPointY,
    projectionCloudCount: settings.projectionCloudCount,
    projectionCloudOriginX: settings.projectionCloudOriginX,
    projectionCloudOriginY: settings.projectionCloudOriginY,
    projectionCloudSeed: settings.projectionCloudSeed
  };
}

function normalizeProjectionPreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== "object") return null;
  const source = rawPreset.settings && typeof rawPreset.settings === "object"
    ? rawPreset.settings
    : rawPreset;

  const slotCount = normalizeInteger(
    source.projectionSlotCount,
    DEFAULT_SETTINGS.projectionSlotCount,
    MIN_PROJECTION_DISPLAY_COUNT,
    MAX_PROJECTION_SLOT_COUNT
  );
  const displayCount = normalizeInteger(
    source.projectionDisplayCount,
    Math.min(DEFAULT_SETTINGS.projectionDisplayCount, slotCount),
    MIN_PROJECTION_DISPLAY_COUNT,
    Math.min(MAX_PROJECTION_DISPLAY_COUNT, slotCount)
  );
  return {
    name: String(rawPreset.name || "").slice(0, 40),
    savedAt: rawPreset.savedAt || null,
    settings: {
      projectionSlotCount: slotCount,
      projectionDisplayCount: displayCount,
      projectionMoveCount: normalizeInteger(
        source.projectionMoveCount,
        DEFAULT_SETTINGS.projectionMoveCount,
        1,
        displayCount
      ),
      projectionTypingIntervalMs: normalizeInteger(
        source.projectionTypingIntervalMs,
        DEFAULT_SETTINGS.projectionTypingIntervalMs,
        MIN_PROJECTION_TYPING_INTERVAL_MS,
        MAX_PROJECTION_TYPING_INTERVAL_MS
      ),
      projectionRotateIntervalMs: normalizeInteger(
        source.projectionRotateIntervalMs,
        DEFAULT_SETTINGS.projectionRotateIntervalMs,
        MIN_PROJECTION_ROTATE_INTERVAL_MS,
        MAX_PROJECTION_ROTATE_INTERVAL_MS
      ),
      projectionEffectAutoEnabled: source.projectionEffectAutoEnabled === true,
      projectionEffectIntervalMs: normalizeInteger(
        source.projectionEffectIntervalMs,
        DEFAULT_SETTINGS.projectionEffectIntervalMs,
        MIN_PROJECTION_EFFECT_INTERVAL_MS,
        MAX_PROJECTION_EFFECT_INTERVAL_MS
      ),
      projectionMilkyWayGain: normalizeNumber(
        source.projectionMilkyWayGain,
        DEFAULT_SETTINGS.projectionMilkyWayGain,
        MIN_PROJECTION_MILKY_WAY_GAIN,
        MAX_PROJECTION_MILKY_WAY_GAIN
      ),
      projectionExperimentalParallaxEnabled: source.projectionExperimentalParallaxEnabled === true,
      projectionParallaxStrength: normalizeNumber(
        source.projectionParallaxStrength,
        DEFAULT_SETTINGS.projectionParallaxStrength,
        MIN_PROJECTION_PARALLAX_STRENGTH,
        MAX_PROJECTION_PARALLAX_STRENGTH
      ),
      projectionParallaxVanishingPointX: normalizeNumber(
        source.projectionParallaxVanishingPointX,
        DEFAULT_SETTINGS.projectionParallaxVanishingPointX,
        MIN_PROJECTION_PARALLAX_VANISHING_POINT,
        MAX_PROJECTION_PARALLAX_VANISHING_POINT
      ),
      projectionParallaxVanishingPointY: normalizeNumber(
        source.projectionParallaxVanishingPointY,
        DEFAULT_SETTINGS.projectionParallaxVanishingPointY,
        MIN_PROJECTION_PARALLAX_VANISHING_POINT,
        MAX_PROJECTION_PARALLAX_VANISHING_POINT
      ),
      projectionCloudCount: normalizeInteger(
        source.projectionCloudCount,
        DEFAULT_SETTINGS.projectionCloudCount,
        MIN_PROJECTION_CLOUD_COUNT,
        MAX_PROJECTION_CLOUD_COUNT
      ),
      projectionCloudOriginX: normalizeNumber(
        source.projectionCloudOriginX,
        DEFAULT_SETTINGS.projectionCloudOriginX,
        MIN_PROJECTION_CLOUD_ORIGIN_X,
        MAX_PROJECTION_CLOUD_ORIGIN_X
      ),
      projectionCloudOriginY: normalizeNumber(
        source.projectionCloudOriginY,
        DEFAULT_SETTINGS.projectionCloudOriginY,
        MIN_PROJECTION_CLOUD_ORIGIN_Y,
        MAX_PROJECTION_CLOUD_ORIGIN_Y
      ),
      projectionCloudSeed: String(source.projectionCloudSeed || DEFAULT_SETTINGS.projectionCloudSeed).slice(0, 80)
    }
  };
}

function normalizeProjectionPresets(rawPresets) {
  return Array.from({ length: PROJECTION_PRESET_COUNT }, (_, index) => {
    return normalizeProjectionPreset(Array.isArray(rawPresets) ? rawPresets[index] : null);
  });
}

async function writeSettings(settings) {
  settingsWriteQueue = settingsWriteQueue.then(async () => {
    await ensureStore();
    const tmpFile = `${settingsFile}.${process.pid}.tmp`;
    await fs.writeFile(tmpFile, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
    await fs.rename(tmpFile, settingsFile);
  });
  return settingsWriteQueue;
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

function createProjectionEffect(type) {
  const now = Date.now();
  lastProjectionEffectAt = now;
  return {
    id: crypto.randomUUID(),
    type,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 30000).toISOString()
  };
}

function getLatestProjectionEffect(settings) {
  const now = Date.now();
  if (settings?.projectionEffectAutoEnabled && lastProjectionEffectAt === 0) {
    lastProjectionEffectAt = now;
  }

  if (
    settings?.projectionEffectAutoEnabled &&
    (!latestProjectionEffect || now > Date.parse(latestProjectionEffect.expiresAt)) &&
    now - lastProjectionEffectAt >= settings.projectionEffectIntervalMs
  ) {
    latestProjectionEffect = createProjectionEffect("meteor-shower");
  }

  if (!latestProjectionEffect) return null;
  if (Date.now() > Date.parse(latestProjectionEffect.expiresAt)) {
    latestProjectionEffect = null;
    return null;
  }
  return latestProjectionEffect;
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

function adminWish(wish) {
  return {
    ...publicWish(wish),
    rejectedAt: wish.rejectedAt || null,
    moderation: wish.moderation || null
  };
}

function publicSettings(settings) {
  return {
    moderationMode: settings.moderationMode,
    projectionDisplayCount: settings.projectionDisplayCount,
    projectionSlotCount: settings.projectionSlotCount,
    projectionMoveCount: settings.projectionMoveCount,
    projectionTypingIntervalMs: settings.projectionTypingIntervalMs,
    projectionRotateIntervalMs: settings.projectionRotateIntervalMs,
    projectionEffectAutoEnabled: settings.projectionEffectAutoEnabled,
    projectionEffectIntervalMs: settings.projectionEffectIntervalMs,
    projectionMilkyWayGain: settings.projectionMilkyWayGain,
    projectionExperimentalParallaxEnabled: settings.projectionExperimentalParallaxEnabled,
    projectionParallaxStrength: settings.projectionParallaxStrength,
    projectionParallaxVanishingPointX: settings.projectionParallaxVanishingPointX,
    projectionParallaxVanishingPointY: settings.projectionParallaxVanishingPointY,
    projectionCloudCount: settings.projectionCloudCount,
    projectionCloudOriginX: settings.projectionCloudOriginX,
    projectionCloudOriginY: settings.projectionCloudOriginY,
    projectionCloudSeed: settings.projectionCloudSeed,
    projectionPresets: normalizeProjectionPresets(settings.projectionPresets),
    projectionDisplayCountMax: MAX_PROJECTION_DISPLAY_COUNT,
    projectionSlotCountMax: MAX_PROJECTION_SLOT_COUNT,
    projectionTypingIntervalMsMin: MIN_PROJECTION_TYPING_INTERVAL_MS,
    projectionTypingIntervalMsMax: MAX_PROJECTION_TYPING_INTERVAL_MS,
    projectionRotateIntervalMsMin: MIN_PROJECTION_ROTATE_INTERVAL_MS,
    projectionRotateIntervalMsMax: MAX_PROJECTION_ROTATE_INTERVAL_MS,
    projectionEffectIntervalMsMin: MIN_PROJECTION_EFFECT_INTERVAL_MS,
    projectionEffectIntervalMsMax: MAX_PROJECTION_EFFECT_INTERVAL_MS,
    projectionMilkyWayGainMin: MIN_PROJECTION_MILKY_WAY_GAIN,
    projectionMilkyWayGainMax: MAX_PROJECTION_MILKY_WAY_GAIN,
    projectionParallaxStrengthMin: MIN_PROJECTION_PARALLAX_STRENGTH,
    projectionParallaxStrengthMax: MAX_PROJECTION_PARALLAX_STRENGTH,
    projectionParallaxVanishingPointMin: MIN_PROJECTION_PARALLAX_VANISHING_POINT,
    projectionParallaxVanishingPointMax: MAX_PROJECTION_PARALLAX_VANISHING_POINT,
    projectionCloudCountMin: MIN_PROJECTION_CLOUD_COUNT,
    projectionCloudCountMax: MAX_PROJECTION_CLOUD_COUNT,
    projectionCloudOriginXMin: MIN_PROJECTION_CLOUD_ORIGIN_X,
    projectionCloudOriginXMax: MAX_PROJECTION_CLOUD_ORIGIN_X,
    projectionCloudOriginYMin: MIN_PROJECTION_CLOUD_ORIGIN_Y,
    projectionCloudOriginYMax: MAX_PROJECTION_CLOUD_ORIGIN_Y,
    aiAvailable: Boolean(OPENAI_API_KEY)
  };
}

function countByStatus(wishes) {
  return wishes.reduce((counts, wish) => {
    const status = wish.status || "unknown";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
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

function normalizeForModeration(input) {
  return String(input || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(MODERATION_STRIP_RE, "");
}

function buildModerationInfo(mode, decision, reason) {
  return {
    mode,
    decision,
    reason,
    reviewedAt: new Date().toISOString()
  };
}

function findCautionReason(text) {
  const normalized = String(text || "").trim();
  const folded = normalizeForModeration(normalized);
  for (const rule of CAUTION_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized) || pattern.test(folded))) {
      return rule.reason;
    }
  }
  return "";
}

function hasElevatedModerationScore(categoryScores) {
  if (!categoryScores || typeof categoryScores !== "object") {
    return false;
  }
  return Object.values(categoryScores).some((score) => {
    return typeof score === "number" && score >= REVIEW_SCORE_THRESHOLD;
  });
}

async function classifyWithOpenAiModeration(text) {
  if (!OPENAI_API_KEY) {
    throw new Error("AI moderation is not configured.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MODERATION_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODERATION_MODEL,
        input: text
      })
    });

    if (!response.ok) {
      throw new Error("AI moderation request failed.");
    }

    const result = await response.json();
    const first = result?.results?.[0];
    if (!first || typeof first.flagged !== "boolean") {
      throw new Error("AI moderation response was invalid.");
    }

    return {
      flagged: first.flagged,
      reviewNeeded: hasElevatedModerationScore(first.category_scores)
    };
  } finally {
    clearTimeout(timer);
  }
}

async function applySubmissionModeration(wish, settings) {
  const now = new Date().toISOString();

  if (settings.moderationMode === "auto") {
    wish.status = "approved";
    wish.approvedAt = now;
    wish.rejectedAt = null;
    wish.moderation = buildModerationInfo("auto", "approved", "自動承認モード");
    return;
  }

  if (settings.moderationMode !== "ai") {
    wish.status = "pending";
    wish.moderation = buildModerationInfo("manual", "pending", "手動確認待ち");
    return;
  }

  const cautionReason = findCautionReason(wish.text);
  if (cautionReason) {
    wish.status = "pending";
    wish.moderation = buildModerationInfo("ai", "pending", cautionReason);
    return;
  }

  try {
    const result = await classifyWithOpenAiModeration(wish.text);
    if (result.flagged) {
      wish.status = "rejected";
      wish.approvedAt = null;
      wish.rejectedAt = now;
      wish.moderation = buildModerationInfo("ai", "rejected", "AI判定により非表示");
      return;
    }

    if (result.reviewNeeded) {
      wish.status = "pending";
      wish.approvedAt = null;
      wish.rejectedAt = null;
      wish.moderation = buildModerationInfo("ai", "pending", "AIスコアが高めのため手動確認");
      return;
    }

    wish.status = "approved";
    wish.approvedAt = now;
    wish.rejectedAt = null;
    wish.moderation = buildModerationInfo("ai", "approved", "AI判定により承認");
  } catch {
    wish.status = "pending";
    wish.moderation = buildModerationInfo("ai", "pending", "AI判定に失敗したため手動確認");
  }
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    const wishes = await readWishes();
    sendJson(res, 200, {
      ok: true,
      service: "tanabata-fes-2026",
      generatedAt: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      wishes: {
        total: wishes.length,
        byStatus: countByStatus(wishes)
      }
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/projection/effect") {
    const settings = await readSettings();
    sendJson(res, 200, { effect: getLatestProjectionEffect(settings) });
    return;
  }

  if (url.pathname === "/api/admin/settings" && ["GET", "PATCH"].includes(req.method)) {
    if (!isAdmin(req, url)) {
      sendError(res, 401, "管理キーが必要です。");
      return;
    }

    const settings = await readSettings();
    if (req.method === "GET") {
      sendJson(res, 200, { settings: publicSettings(settings) });
      return;
    }

    const body = await parseJsonBody(req);
    const nextSettings = { ...settings };

    if (Object.prototype.hasOwnProperty.call(body, "moderationMode")) {
      const nextMode = String(body.moderationMode || "");
      if (!MODERATION_MODES.has(nextMode)) {
        sendError(res, 400, "moderationMode は manual / auto / ai のいずれかです。");
        return;
      }
      if (nextMode === "ai" && !OPENAI_API_KEY) {
        sendError(res, 400, "AIモデレートにはサーバー側の API キー設定が必要です。");
        return;
      }
      nextSettings.moderationMode = nextMode;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionSlotCount")) {
      const slotCount = Number(body.projectionSlotCount);
      if (
        !Number.isInteger(slotCount) ||
        slotCount < MIN_PROJECTION_DISPLAY_COUNT ||
        slotCount > MAX_PROJECTION_SLOT_COUNT
      ) {
        sendError(res, 400, `総スロット数は${MIN_PROJECTION_DISPLAY_COUNT}から${MAX_PROJECTION_SLOT_COUNT}までです。`);
        return;
      }
      nextSettings.projectionSlotCount = slotCount;
      nextSettings.projectionDisplayCount = Math.min(nextSettings.projectionDisplayCount, slotCount);
      nextSettings.projectionMoveCount = Math.min(nextSettings.projectionMoveCount, nextSettings.projectionDisplayCount);
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionDisplayCount")) {
      const displayCount = Number(body.projectionDisplayCount);
      const displayMax = Math.min(MAX_PROJECTION_DISPLAY_COUNT, nextSettings.projectionSlotCount);
      if (
        !Number.isInteger(displayCount) ||
        displayCount < MIN_PROJECTION_DISPLAY_COUNT
      ) {
        sendError(res, 400, `表示数は${MIN_PROJECTION_DISPLAY_COUNT}以上です。`);
        return;
      }
      nextSettings.projectionDisplayCount = Math.min(displayCount, displayMax);
      nextSettings.projectionMoveCount = Math.min(nextSettings.projectionMoveCount, nextSettings.projectionDisplayCount);
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMoveCount")) {
      const moveCount = Number(body.projectionMoveCount);
      if (
        !Number.isInteger(moveCount) ||
        moveCount < 1
      ) {
        sendError(res, 400, "移動量は1以上です。");
        return;
      }
      nextSettings.projectionMoveCount = Math.min(moveCount, nextSettings.projectionDisplayCount);
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionTypingIntervalMs")) {
      const typingIntervalMs = Number(body.projectionTypingIntervalMs);
      if (
        !Number.isInteger(typingIntervalMs) ||
        typingIntervalMs < MIN_PROJECTION_TYPING_INTERVAL_MS ||
        typingIntervalMs > MAX_PROJECTION_TYPING_INTERVAL_MS
      ) {
        sendError(res, 400, `文字アニメーション速度は${MIN_PROJECTION_TYPING_INTERVAL_MS}から${MAX_PROJECTION_TYPING_INTERVAL_MS}までです。`);
        return;
      }
      nextSettings.projectionTypingIntervalMs = typingIntervalMs;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionRotateIntervalMs")) {
      const rotateIntervalMs = Number(body.projectionRotateIntervalMs);
      if (
        !Number.isInteger(rotateIntervalMs) ||
        rotateIntervalMs < MIN_PROJECTION_ROTATE_INTERVAL_MS ||
        rotateIntervalMs > MAX_PROJECTION_ROTATE_INTERVAL_MS
      ) {
        sendError(res, 400, `短冊ローテーション間隔は${MIN_PROJECTION_ROTATE_INTERVAL_MS}から${MAX_PROJECTION_ROTATE_INTERVAL_MS}までです。`);
        return;
      }
      nextSettings.projectionRotateIntervalMs = rotateIntervalMs;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionEffectAutoEnabled")) {
      nextSettings.projectionEffectAutoEnabled = body.projectionEffectAutoEnabled === true;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionEffectIntervalMs")) {
      const effectIntervalMs = Number(body.projectionEffectIntervalMs);
      if (
        !Number.isInteger(effectIntervalMs) ||
        effectIntervalMs < MIN_PROJECTION_EFFECT_INTERVAL_MS ||
        effectIntervalMs > MAX_PROJECTION_EFFECT_INTERVAL_MS
      ) {
        sendError(res, 400, `イベント間隔は${MIN_PROJECTION_EFFECT_INTERVAL_MS}から${MAX_PROJECTION_EFFECT_INTERVAL_MS}までです。`);
        return;
      }
      nextSettings.projectionEffectIntervalMs = effectIntervalMs;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWayGain")) {
      const milkyWayGain = Number(body.projectionMilkyWayGain);
      if (
        !Number.isFinite(milkyWayGain) ||
        milkyWayGain < MIN_PROJECTION_MILKY_WAY_GAIN ||
        milkyWayGain > MAX_PROJECTION_MILKY_WAY_GAIN
      ) {
        sendError(res, 400, `天の川明るさは${MIN_PROJECTION_MILKY_WAY_GAIN}から${MAX_PROJECTION_MILKY_WAY_GAIN}までです。`);
        return;
      }
      nextSettings.projectionMilkyWayGain = milkyWayGain;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionExperimentalParallaxEnabled")) {
      nextSettings.projectionExperimentalParallaxEnabled = body.projectionExperimentalParallaxEnabled === true;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxStrength")) {
      const parallaxStrength = Number(body.projectionParallaxStrength);
      if (
        !Number.isFinite(parallaxStrength) ||
        parallaxStrength < MIN_PROJECTION_PARALLAX_STRENGTH ||
        parallaxStrength > MAX_PROJECTION_PARALLAX_STRENGTH
      ) {
        sendError(res, 400, `視差強度は${MIN_PROJECTION_PARALLAX_STRENGTH}から${MAX_PROJECTION_PARALLAX_STRENGTH}までです。`);
        return;
      }
      nextSettings.projectionParallaxStrength = parallaxStrength;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxVanishingPointX")) {
      const vanishingPointX = Number(body.projectionParallaxVanishingPointX);
      if (
        !Number.isFinite(vanishingPointX) ||
        vanishingPointX < MIN_PROJECTION_PARALLAX_VANISHING_POINT ||
        vanishingPointX > MAX_PROJECTION_PARALLAX_VANISHING_POINT
      ) {
        sendError(res, 400, `視差消失点Xは${MIN_PROJECTION_PARALLAX_VANISHING_POINT}から${MAX_PROJECTION_PARALLAX_VANISHING_POINT}までです。`);
        return;
      }
      nextSettings.projectionParallaxVanishingPointX = vanishingPointX;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxVanishingPointY")) {
      const vanishingPointY = Number(body.projectionParallaxVanishingPointY);
      if (
        !Number.isFinite(vanishingPointY) ||
        vanishingPointY < MIN_PROJECTION_PARALLAX_VANISHING_POINT ||
        vanishingPointY > MAX_PROJECTION_PARALLAX_VANISHING_POINT
      ) {
        sendError(res, 400, `視差消失点Yは${MIN_PROJECTION_PARALLAX_VANISHING_POINT}から${MAX_PROJECTION_PARALLAX_VANISHING_POINT}までです。`);
        return;
      }
      nextSettings.projectionParallaxVanishingPointY = vanishingPointY;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionCloudCount")) {
      const cloudCount = Number(body.projectionCloudCount);
      if (
        !Number.isInteger(cloudCount) ||
        cloudCount < MIN_PROJECTION_CLOUD_COUNT ||
        cloudCount > MAX_PROJECTION_CLOUD_COUNT
      ) {
        sendError(res, 400, `雲の発生量は${MIN_PROJECTION_CLOUD_COUNT}から${MAX_PROJECTION_CLOUD_COUNT}までです。`);
        return;
      }
      nextSettings.projectionCloudCount = cloudCount;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionCloudOriginX")) {
      const cloudOriginX = Number(body.projectionCloudOriginX);
      if (
        !Number.isFinite(cloudOriginX) ||
        cloudOriginX < MIN_PROJECTION_CLOUD_ORIGIN_X ||
        cloudOriginX > MAX_PROJECTION_CLOUD_ORIGIN_X
      ) {
        sendError(res, 400, `雲の発生Xは${MIN_PROJECTION_CLOUD_ORIGIN_X}から${MAX_PROJECTION_CLOUD_ORIGIN_X}までです。`);
        return;
      }
      nextSettings.projectionCloudOriginX = cloudOriginX;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionCloudOriginY")) {
      const cloudOriginY = Number(body.projectionCloudOriginY);
      if (
        !Number.isFinite(cloudOriginY) ||
        cloudOriginY < MIN_PROJECTION_CLOUD_ORIGIN_Y ||
        cloudOriginY > MAX_PROJECTION_CLOUD_ORIGIN_Y
      ) {
        sendError(res, 400, `雲の発生Yは${MIN_PROJECTION_CLOUD_ORIGIN_Y}から${MAX_PROJECTION_CLOUD_ORIGIN_Y}までです。`);
        return;
      }
      nextSettings.projectionCloudOriginY = cloudOriginY;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionCloudSeed")) {
      nextSettings.projectionCloudSeed = String(body.projectionCloudSeed || DEFAULT_SETTINGS.projectionCloudSeed).slice(0, 80);
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionPresetAction")) {
      const action = String(body.projectionPresetAction || "");
      const presetIndex = Number(body.projectionPresetIndex);
      if (
        !["save", "load", "clear"].includes(action) ||
        !Number.isInteger(presetIndex) ||
        presetIndex < 0 ||
        presetIndex >= PROJECTION_PRESET_COUNT
      ) {
        sendError(res, 400, "プリセット操作が不正です。");
        return;
      }

      const presets = normalizeProjectionPresets(nextSettings.projectionPresets);
      if (action === "save") {
        presets[presetIndex] = {
          name: `プリセット${presetIndex + 1}`,
          savedAt: new Date().toISOString(),
          ...projectionPresetFromSettings(nextSettings)
        };
      }

      if (action === "load") {
        const preset = presets[presetIndex];
        if (!preset) {
          sendError(res, 404, "プリセットは未保存です。");
          return;
        }
        Object.assign(nextSettings, preset.settings);
      }

      if (action === "clear") {
        presets[presetIndex] = null;
      }

      nextSettings.projectionPresets = presets;
    }

    if (!settings.projectionEffectAutoEnabled && nextSettings.projectionEffectAutoEnabled) {
      lastProjectionEffectAt = Date.now();
    }

    await writeSettings(nextSettings);
    broadcastAdminUpdate();
    sendJson(res, 200, { settings: publicSettings(nextSettings) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/effects/meteor-shower") {
    if (!isAdmin(req, url)) {
      sendError(res, 401, "管理キーが必要です。");
      return;
    }

    latestProjectionEffect = createProjectionEffect("meteor-shower");
    broadcastAdminUpdate();
    sendJson(res, 200, { effect: latestProjectionEffect });
    return;
  }

  if (url.pathname === "/api/admin/backups" && ["GET", "POST"].includes(req.method)) {
    if (!isAdmin(req, url)) {
      sendError(res, 401, "管理キーが必要です。");
      return;
    }

    if (req.method === "GET") {
      sendJson(res, 200, { backups: await listWishBackups() });
      return;
    }

    const backup = await createWishBackup("manual");
    sendJson(res, 201, { backup, backups: await listWishBackups() });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/backups/restore") {
    if (!isAdmin(req, url)) {
      sendError(res, 401, "管理キーが必要です。");
      return;
    }

    const body = await parseJsonBody(req);
    const revision = String(body.revision || "");
    let backup;
    try {
      backup = await readWishBackup(revision);
    } catch {
      sendError(res, 404, "バックアップが見つからないか、読み込めません。");
      return;
    }

    const beforeRestore = await createWishBackup("before-restore");
    await writeWishes(backup.wishes);
    broadcastAdminUpdate();
    sendJson(res, 200, {
      ok: true,
      restored: {
        revision: backup.revision,
        createdAt: backup.createdAt,
        wishCount: backup.wishes.length,
        byStatus: countByStatus(backup.wishes)
      },
      beforeRestore,
      backups: await listWishBackups()
    });
    return;
  }

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

    const settings = await readSettings();
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
    await applySubmissionModeration(wish, settings);
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
    sendJson(res, 200, { wishes: filtered.map(adminWish) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/approved") {
    const settings = await readSettings();
    const wishes = await readWishes();
    const approved = wishes
      .filter((wish) => wish.status === "approved")
      .sort((a, b) => String(b.approvedAt).localeCompare(String(a.approvedAt)));
    sendJson(res, 200, {
      wishes: approved.map(publicWish),
      settings: publicSettings(settings),
      generatedAt: new Date().toISOString()
    });
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
    wish.moderation = buildModerationInfo("manual", nextStatus, "管理者による変更");
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
