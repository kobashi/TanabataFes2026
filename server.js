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
const MIN_PROJECTION_MILKY_WAY_TWINKLE = 0;
const MAX_PROJECTION_MILKY_WAY_TWINKLE = 2.5;
const MIN_PROJECTION_MILKY_WAY_SPARKLE = 0;
const MAX_PROJECTION_MILKY_WAY_SPARKLE = 2.5;
const MIN_PROJECTION_MILKY_WAY_SPEED = 0.2;
const MAX_PROJECTION_MILKY_WAY_SPEED = 2.5;
const MIN_PROJECTION_MILKY_WAY_PARTICLE_COUNT = 80;
const MAX_PROJECTION_MILKY_WAY_PARTICLE_COUNT = 720;
const MIN_PROJECTION_MILKY_WAY_SPARKLE_RATIO = 0;
const MAX_PROJECTION_MILKY_WAY_SPARKLE_RATIO = 0.25;
const MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE = 0;
const MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE = 2.5;
const MIN_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE = 0;
const MAX_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE = 2.5;
const MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS = 0.5;
const MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS = 8;
const MIN_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO = 0.03;
const MAX_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO = 0.8;
const MIN_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY = 0;
const MAX_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY = 3;
const MIN_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG = 0;
const MAX_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG = 360;
const MIN_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS = 8;
const MAX_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS = 90;
const MIN_PROJECTION_TANZAKU_SWAY_STRENGTH = 0;
const MAX_PROJECTION_TANZAKU_SWAY_STRENGTH = 3;
const MIN_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH = 0;
const MAX_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH = 3;
const MIN_PROJECTION_WIND_GUST_STRENGTH = 0;
const MAX_PROJECTION_WIND_GUST_STRENGTH = 3;
const MIN_PROJECTION_WIND_GUST_CYCLE_SECONDS = 3;
const MAX_PROJECTION_WIND_GUST_CYCLE_SECONDS = 60;
const MIN_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS = 0;
const MAX_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS = 60;
const MIN_PROJECTION_PARALLAX_STRENGTH = 0;
const MAX_PROJECTION_PARALLAX_STRENGTH = 3;
const MIN_PROJECTION_PARALLAX_VANISHING_POINT_X = -1;
const MAX_PROJECTION_PARALLAX_VANISHING_POINT_X = 1;
const MIN_PROJECTION_PARALLAX_VANISHING_POINT_Y = -1;
const MAX_PROJECTION_PARALLAX_VANISHING_POINT_Y = 5;
const MIN_PROJECTION_PARALLAX_POPOUT_STRENGTH = 0;
const MAX_PROJECTION_PARALLAX_POPOUT_STRENGTH = 3;
const MIN_PROJECTION_PARALLAX_DEPTH_MULTIPLIER = 0;
const MAX_PROJECTION_PARALLAX_DEPTH_MULTIPLIER = 3;
const MIN_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX = 1;
const MAX_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX = 60;
const MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_X = -8;
const MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_X = 8;
const MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_Y = -8;
const MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_Y = 16;
const MIN_PROJECTION_PARALLAX_VIEWER_DISTANCE = 0.5;
const MAX_PROJECTION_PARALLAX_VIEWER_DISTANCE = 32;
const MIN_PROJECTION_VIEWPORT_MARGIN = 0;
const MAX_PROJECTION_VIEWPORT_MARGIN = 24;
const PROJECTION_PARALLAX_MOTION_MODES = new Set(["display", "mapping", "camera", "camera-display"]);
const MIN_PROJECTION_CLOUD_COUNT = 0;
const MAX_PROJECTION_CLOUD_COUNT = 12;
const MIN_PROJECTION_CLOUD_ORIGIN_Y = -1;
const MAX_PROJECTION_CLOUD_ORIGIN_Y = 1;
const PROJECTION_PRESET_COUNT = 3;
const PROJECTION_TANZAKU_FONT_IDS = new Set(["mincho", "gothic", "maru", "kyokasho", "brush"]);

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
  projectionTanzakuFontId: "mincho",
  projectionColorEmojiFontEnabled: false,
  projectionMilkyWayGain: 1.75,
  projectionMilkyWayTwinkle: 1,
  projectionMilkyWaySparkle: 1,
  projectionMilkyWaySpeed: 1,
  projectionMilkyWayParticleCount: 340,
  projectionMilkyWaySparkleRatio: 0.045,
  projectionMilkyWaySparklePeriodVariance: 1,
  projectionMilkyWaySparkleIntensityVariance: 1,
  projectionMilkyWaySparklePeriodSeconds: 2.2,
  projectionMilkyWaySparkleDutyRatio: 0.16,
  projectionMilkyWaySeed: "tanabata-milky-way",
  projectionTanabataStarResponseIntensity: 1,
  projectionTanabataStarResponsePhaseDeg: 166,
  projectionTanabataStarResponsePeriodSeconds: 35,
  projectionTanzakuSwayStrength: 1,
  projectionTanzakuAmbientSwayStrength: 0,
  projectionWindGustStrength: 1,
  projectionWindGustCycleMs: 30000,
  projectionWindGustCycleJitterSeconds: 0,
  projectionExperimentalParallaxEnabled: false,
  projectionParallaxStrength: 1,
  projectionParallaxVanishingPointX: 0,
  projectionParallaxVanishingPointY: 0,
  projectionParallaxMarkerEnabled: false,
  projectionParallaxPopoutStrength: 0,
  projectionParallaxDepthMultiplier: 1,
  projectionParallaxDepthReferenceIndex: 1,
  projectionParallaxMotionMode: "mapping",
  projectionParallaxViewerOffsetX: 0,
  projectionParallaxViewerOffsetY: 0,
  projectionParallaxViewerDistance: 2.5,
  projectionViewportMargin: 0,
  projectionCloudCount: 3,
  projectionCloudOriginY: 0,
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
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

let writeQueue = Promise.resolve();
let settingsWriteQueue = Promise.resolve();
const adminClients = new Set();
const projectionClients = new Set();
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
    const milkyWayTwinkle = normalizeNumber(
      parsed.projectionMilkyWayTwinkle,
      DEFAULT_SETTINGS.projectionMilkyWayTwinkle,
      MIN_PROJECTION_MILKY_WAY_TWINKLE,
      MAX_PROJECTION_MILKY_WAY_TWINKLE
    );
    const milkyWaySparkle = normalizeNumber(
      parsed.projectionMilkyWaySparkle,
      DEFAULT_SETTINGS.projectionMilkyWaySparkle,
      MIN_PROJECTION_MILKY_WAY_SPARKLE,
      MAX_PROJECTION_MILKY_WAY_SPARKLE
    );
    const milkyWaySpeed = normalizeNumber(
      parsed.projectionMilkyWaySpeed,
      DEFAULT_SETTINGS.projectionMilkyWaySpeed,
      MIN_PROJECTION_MILKY_WAY_SPEED,
      MAX_PROJECTION_MILKY_WAY_SPEED
    );
    const milkyWayParticleCount = normalizeInteger(
      parsed.projectionMilkyWayParticleCount,
      DEFAULT_SETTINGS.projectionMilkyWayParticleCount,
      MIN_PROJECTION_MILKY_WAY_PARTICLE_COUNT,
      MAX_PROJECTION_MILKY_WAY_PARTICLE_COUNT
    );
    const milkyWaySparkleRatio = normalizeNumber(
      parsed.projectionMilkyWaySparkleRatio,
      DEFAULT_SETTINGS.projectionMilkyWaySparkleRatio,
      MIN_PROJECTION_MILKY_WAY_SPARKLE_RATIO,
      MAX_PROJECTION_MILKY_WAY_SPARKLE_RATIO
    );
    const milkyWaySparklePeriodVariance = normalizeNumber(
      parsed.projectionMilkyWaySparklePeriodVariance,
      DEFAULT_SETTINGS.projectionMilkyWaySparklePeriodVariance,
      MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE,
      MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE
    );
    const milkyWaySparkleIntensityVariance = normalizeNumber(
      parsed.projectionMilkyWaySparkleIntensityVariance,
      DEFAULT_SETTINGS.projectionMilkyWaySparkleIntensityVariance,
      MIN_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE,
      MAX_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE
    );
    const milkyWaySparklePeriodSeconds = normalizeNumber(
      parsed.projectionMilkyWaySparklePeriodSeconds,
      DEFAULT_SETTINGS.projectionMilkyWaySparklePeriodSeconds,
      MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS,
      MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS
    );
    const milkyWaySparkleDutyRatio = normalizeNumber(
      parsed.projectionMilkyWaySparkleDutyRatio,
      DEFAULT_SETTINGS.projectionMilkyWaySparkleDutyRatio,
      MIN_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO,
      MAX_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO
    );
    const tanabataStarResponseIntensity = normalizeNumber(
      parsed.projectionTanabataStarResponseIntensity,
      DEFAULT_SETTINGS.projectionTanabataStarResponseIntensity,
      MIN_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY,
      MAX_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY
    );
    const tanabataStarResponsePhaseDeg = normalizeNumber(
      parsed.projectionTanabataStarResponsePhaseDeg,
      DEFAULT_SETTINGS.projectionTanabataStarResponsePhaseDeg,
      MIN_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG,
      MAX_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG
    );
    const tanabataStarResponsePeriodSeconds = normalizeNumber(
      parsed.projectionTanabataStarResponsePeriodSeconds,
      DEFAULT_SETTINGS.projectionTanabataStarResponsePeriodSeconds,
      MIN_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS,
      MAX_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS
    );
    const tanzakuSwayStrength = normalizeNumber(
      parsed.projectionTanzakuSwayStrength,
      DEFAULT_SETTINGS.projectionTanzakuSwayStrength,
      MIN_PROJECTION_TANZAKU_SWAY_STRENGTH,
      MAX_PROJECTION_TANZAKU_SWAY_STRENGTH
    );
    const tanzakuAmbientSwayStrength = normalizeNumber(
      parsed.projectionTanzakuAmbientSwayStrength,
      DEFAULT_SETTINGS.projectionTanzakuAmbientSwayStrength,
      MIN_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH,
      MAX_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH
    );
    const windGustStrength = normalizeNumber(
      parsed.projectionWindGustStrength,
      DEFAULT_SETTINGS.projectionWindGustStrength,
      MIN_PROJECTION_WIND_GUST_STRENGTH,
      MAX_PROJECTION_WIND_GUST_STRENGTH
    );
    const windGustCycleMs = normalizeInteger(
      parsed.projectionWindGustCycleMs,
      DEFAULT_SETTINGS.projectionWindGustCycleMs,
      MIN_PROJECTION_WIND_GUST_CYCLE_SECONDS * 1000,
      MAX_PROJECTION_WIND_GUST_CYCLE_SECONDS * 1000
    );
    const windGustCycleJitterSeconds = normalizeInteger(
      parsed.projectionWindGustCycleJitterSeconds,
      DEFAULT_SETTINGS.projectionWindGustCycleJitterSeconds,
      MIN_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS,
      MAX_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS
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
      MIN_PROJECTION_PARALLAX_VANISHING_POINT_X,
      MAX_PROJECTION_PARALLAX_VANISHING_POINT_X
    );
    const parallaxVanishingPointY = normalizeNumber(
      parsed.projectionParallaxVanishingPointY,
      DEFAULT_SETTINGS.projectionParallaxVanishingPointY,
      MIN_PROJECTION_PARALLAX_VANISHING_POINT_Y,
      MAX_PROJECTION_PARALLAX_VANISHING_POINT_Y
    );
    const parallaxPopoutStrength = normalizeNumber(
      parsed.projectionParallaxPopoutStrength,
      DEFAULT_SETTINGS.projectionParallaxPopoutStrength,
      MIN_PROJECTION_PARALLAX_POPOUT_STRENGTH,
      MAX_PROJECTION_PARALLAX_POPOUT_STRENGTH
    );
    const parallaxDepthMultiplier = normalizeNumber(
      parsed.projectionParallaxDepthMultiplier,
      DEFAULT_SETTINGS.projectionParallaxDepthMultiplier,
      MIN_PROJECTION_PARALLAX_DEPTH_MULTIPLIER,
      MAX_PROJECTION_PARALLAX_DEPTH_MULTIPLIER
    );
    const parallaxDepthReferenceIndex = normalizeInteger(
      parsed.projectionParallaxDepthReferenceIndex,
      DEFAULT_SETTINGS.projectionParallaxDepthReferenceIndex,
      MIN_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX,
      MAX_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX
    );
    const parallaxViewerOffsetX = normalizeNumber(
      parsed.projectionParallaxViewerOffsetX,
      DEFAULT_SETTINGS.projectionParallaxViewerOffsetX,
      MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_X,
      MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_X
    );
    const parallaxViewerOffsetY = normalizeNumber(
      parsed.projectionParallaxViewerOffsetY,
      DEFAULT_SETTINGS.projectionParallaxViewerOffsetY,
      MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_Y,
      MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_Y
    );
    const parallaxViewerDistance = normalizeNumber(
      parsed.projectionParallaxViewerDistance,
      DEFAULT_SETTINGS.projectionParallaxViewerDistance,
      MIN_PROJECTION_PARALLAX_VIEWER_DISTANCE,
      MAX_PROJECTION_PARALLAX_VIEWER_DISTANCE
    );
    const viewportMargin = normalizeNumber(
      parsed.projectionViewportMargin,
      DEFAULT_SETTINGS.projectionViewportMargin,
      MIN_PROJECTION_VIEWPORT_MARGIN,
      MAX_PROJECTION_VIEWPORT_MARGIN
    );
    const parallaxMotionMode = PROJECTION_PARALLAX_MOTION_MODES.has(parsed.projectionParallaxMotionMode)
      ? parsed.projectionParallaxMotionMode
      : DEFAULT_SETTINGS.projectionParallaxMotionMode;
    const tanzakuFontId = PROJECTION_TANZAKU_FONT_IDS.has(parsed.projectionTanzakuFontId)
      ? parsed.projectionTanzakuFontId
      : DEFAULT_SETTINGS.projectionTanzakuFontId;
    const cloudCount = normalizeInteger(
      parsed.projectionCloudCount,
      DEFAULT_SETTINGS.projectionCloudCount,
      MIN_PROJECTION_CLOUD_COUNT,
      MAX_PROJECTION_CLOUD_COUNT
    );
    const cloudOriginY = normalizeRelativeNumber(
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
      projectionTanzakuFontId: tanzakuFontId,
      projectionColorEmojiFontEnabled: parsed.projectionColorEmojiFontEnabled === true,
      projectionMilkyWayGain: milkyWayGain,
      projectionMilkyWayTwinkle: milkyWayTwinkle,
      projectionMilkyWaySparkle: milkyWaySparkle,
      projectionMilkyWaySpeed: milkyWaySpeed,
      projectionMilkyWayParticleCount: milkyWayParticleCount,
      projectionMilkyWaySparkleRatio: milkyWaySparkleRatio,
      projectionMilkyWaySparklePeriodVariance: milkyWaySparklePeriodVariance,
      projectionMilkyWaySparkleIntensityVariance: milkyWaySparkleIntensityVariance,
      projectionMilkyWaySparklePeriodSeconds: milkyWaySparklePeriodSeconds,
      projectionMilkyWaySparkleDutyRatio: milkyWaySparkleDutyRatio,
      projectionMilkyWaySeed: String(parsed.projectionMilkyWaySeed || DEFAULT_SETTINGS.projectionMilkyWaySeed).slice(0, 80),
      projectionTanabataStarResponseIntensity: tanabataStarResponseIntensity,
      projectionTanabataStarResponsePhaseDeg: tanabataStarResponsePhaseDeg,
      projectionTanabataStarResponsePeriodSeconds: tanabataStarResponsePeriodSeconds,
      projectionTanzakuSwayStrength: tanzakuSwayStrength,
      projectionTanzakuAmbientSwayStrength: tanzakuAmbientSwayStrength,
      projectionWindGustStrength: windGustStrength,
      projectionWindGustCycleMs: windGustCycleMs,
      projectionWindGustCycleJitterSeconds: windGustCycleJitterSeconds,
      projectionExperimentalParallaxEnabled: parsed.projectionExperimentalParallaxEnabled === true,
      projectionParallaxStrength: parallaxStrength,
      projectionParallaxVanishingPointX: parallaxVanishingPointX,
      projectionParallaxVanishingPointY: parallaxVanishingPointY,
      projectionParallaxMarkerEnabled: parsed.projectionParallaxMarkerEnabled === true,
      projectionParallaxPopoutStrength: parallaxPopoutStrength,
      projectionParallaxDepthMultiplier: parallaxDepthMultiplier,
      projectionParallaxDepthReferenceIndex: parallaxDepthReferenceIndex,
      projectionParallaxMotionMode: parallaxMotionMode,
      projectionParallaxViewerOffsetX: parallaxViewerOffsetX,
      projectionParallaxViewerOffsetY: parallaxViewerOffsetY,
      projectionParallaxViewerDistance: parallaxViewerDistance,
      projectionViewportMargin: viewportMargin,
      projectionCloudCount: cloudCount,
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

function normalizeRelativeNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    return fallback;
  }
  return number;
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
    projectionTanzakuFontId: PROJECTION_TANZAKU_FONT_IDS.has(settings.projectionTanzakuFontId)
      ? settings.projectionTanzakuFontId
      : DEFAULT_SETTINGS.projectionTanzakuFontId,
    projectionColorEmojiFontEnabled: settings.projectionColorEmojiFontEnabled === true,
    projectionMilkyWayGain: settings.projectionMilkyWayGain,
    projectionMilkyWayTwinkle: settings.projectionMilkyWayTwinkle,
    projectionMilkyWaySparkle: settings.projectionMilkyWaySparkle,
    projectionMilkyWaySpeed: settings.projectionMilkyWaySpeed,
    projectionMilkyWayParticleCount: settings.projectionMilkyWayParticleCount,
    projectionMilkyWaySparkleRatio: settings.projectionMilkyWaySparkleRatio,
    projectionMilkyWaySparklePeriodVariance: settings.projectionMilkyWaySparklePeriodVariance,
    projectionMilkyWaySparkleIntensityVariance: settings.projectionMilkyWaySparkleIntensityVariance,
    projectionMilkyWaySparklePeriodSeconds: settings.projectionMilkyWaySparklePeriodSeconds,
    projectionMilkyWaySparkleDutyRatio: settings.projectionMilkyWaySparkleDutyRatio,
    projectionMilkyWaySeed: settings.projectionMilkyWaySeed,
    projectionTanabataStarResponseIntensity: settings.projectionTanabataStarResponseIntensity,
    projectionTanabataStarResponsePhaseDeg: settings.projectionTanabataStarResponsePhaseDeg,
    projectionTanabataStarResponsePeriodSeconds: settings.projectionTanabataStarResponsePeriodSeconds,
    projectionTanzakuSwayStrength: settings.projectionTanzakuSwayStrength,
    projectionTanzakuAmbientSwayStrength: settings.projectionTanzakuAmbientSwayStrength,
    projectionWindGustStrength: settings.projectionWindGustStrength,
    projectionWindGustCycleMs: settings.projectionWindGustCycleMs,
    projectionWindGustCycleJitterSeconds: settings.projectionWindGustCycleJitterSeconds,
    projectionExperimentalParallaxEnabled: settings.projectionExperimentalParallaxEnabled === true,
    projectionParallaxStrength: settings.projectionParallaxStrength,
    projectionParallaxVanishingPointX: settings.projectionParallaxVanishingPointX,
    projectionParallaxVanishingPointY: settings.projectionParallaxVanishingPointY,
    projectionParallaxMarkerEnabled: settings.projectionParallaxMarkerEnabled === true,
    projectionParallaxPopoutStrength: settings.projectionParallaxPopoutStrength,
    projectionParallaxDepthMultiplier: settings.projectionParallaxDepthMultiplier,
    projectionParallaxDepthReferenceIndex: settings.projectionParallaxDepthReferenceIndex,
    projectionParallaxMotionMode: PROJECTION_PARALLAX_MOTION_MODES.has(settings.projectionParallaxMotionMode)
      ? settings.projectionParallaxMotionMode
      : DEFAULT_SETTINGS.projectionParallaxMotionMode,
    projectionParallaxViewerOffsetX: settings.projectionParallaxViewerOffsetX,
    projectionParallaxViewerOffsetY: settings.projectionParallaxViewerOffsetY,
    projectionParallaxViewerDistance: settings.projectionParallaxViewerDistance,
    projectionViewportMargin: settings.projectionViewportMargin,
    projectionCloudCount: settings.projectionCloudCount,
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
      projectionTanzakuFontId: PROJECTION_TANZAKU_FONT_IDS.has(source.projectionTanzakuFontId)
        ? source.projectionTanzakuFontId
        : DEFAULT_SETTINGS.projectionTanzakuFontId,
      projectionColorEmojiFontEnabled: source.projectionColorEmojiFontEnabled === true,
      projectionMilkyWayGain: normalizeNumber(
        source.projectionMilkyWayGain,
        DEFAULT_SETTINGS.projectionMilkyWayGain,
        MIN_PROJECTION_MILKY_WAY_GAIN,
        MAX_PROJECTION_MILKY_WAY_GAIN
      ),
      projectionMilkyWayTwinkle: normalizeNumber(
        source.projectionMilkyWayTwinkle,
        DEFAULT_SETTINGS.projectionMilkyWayTwinkle,
        MIN_PROJECTION_MILKY_WAY_TWINKLE,
        MAX_PROJECTION_MILKY_WAY_TWINKLE
      ),
      projectionMilkyWaySparkle: normalizeNumber(
        source.projectionMilkyWaySparkle,
        DEFAULT_SETTINGS.projectionMilkyWaySparkle,
        MIN_PROJECTION_MILKY_WAY_SPARKLE,
        MAX_PROJECTION_MILKY_WAY_SPARKLE
      ),
      projectionMilkyWaySpeed: normalizeNumber(
        source.projectionMilkyWaySpeed,
        DEFAULT_SETTINGS.projectionMilkyWaySpeed,
        MIN_PROJECTION_MILKY_WAY_SPEED,
        MAX_PROJECTION_MILKY_WAY_SPEED
      ),
      projectionMilkyWayParticleCount: normalizeInteger(
        source.projectionMilkyWayParticleCount,
        DEFAULT_SETTINGS.projectionMilkyWayParticleCount,
        MIN_PROJECTION_MILKY_WAY_PARTICLE_COUNT,
        MAX_PROJECTION_MILKY_WAY_PARTICLE_COUNT
      ),
      projectionMilkyWaySparkleRatio: normalizeNumber(
        source.projectionMilkyWaySparkleRatio,
        DEFAULT_SETTINGS.projectionMilkyWaySparkleRatio,
        MIN_PROJECTION_MILKY_WAY_SPARKLE_RATIO,
        MAX_PROJECTION_MILKY_WAY_SPARKLE_RATIO
      ),
      projectionMilkyWaySparklePeriodVariance: normalizeNumber(
        source.projectionMilkyWaySparklePeriodVariance,
        DEFAULT_SETTINGS.projectionMilkyWaySparklePeriodVariance,
        MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE,
        MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE
      ),
      projectionMilkyWaySparkleIntensityVariance: normalizeNumber(
        source.projectionMilkyWaySparkleIntensityVariance,
        DEFAULT_SETTINGS.projectionMilkyWaySparkleIntensityVariance,
        MIN_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE,
        MAX_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE
      ),
      projectionMilkyWaySparklePeriodSeconds: normalizeNumber(
        source.projectionMilkyWaySparklePeriodSeconds,
        DEFAULT_SETTINGS.projectionMilkyWaySparklePeriodSeconds,
        MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS,
        MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS
      ),
      projectionMilkyWaySparkleDutyRatio: normalizeNumber(
        source.projectionMilkyWaySparkleDutyRatio,
        DEFAULT_SETTINGS.projectionMilkyWaySparkleDutyRatio,
        MIN_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO,
        MAX_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO
      ),
      projectionMilkyWaySeed: String(source.projectionMilkyWaySeed || DEFAULT_SETTINGS.projectionMilkyWaySeed).slice(0, 80),
      projectionTanabataStarResponseIntensity: normalizeNumber(
        source.projectionTanabataStarResponseIntensity,
        DEFAULT_SETTINGS.projectionTanabataStarResponseIntensity,
        MIN_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY,
        MAX_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY
      ),
      projectionTanabataStarResponsePhaseDeg: normalizeNumber(
        source.projectionTanabataStarResponsePhaseDeg,
        DEFAULT_SETTINGS.projectionTanabataStarResponsePhaseDeg,
        MIN_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG,
        MAX_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG
      ),
      projectionTanabataStarResponsePeriodSeconds: normalizeNumber(
        source.projectionTanabataStarResponsePeriodSeconds,
        DEFAULT_SETTINGS.projectionTanabataStarResponsePeriodSeconds,
        MIN_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS,
        MAX_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS
      ),
      projectionTanzakuSwayStrength: normalizeNumber(
        source.projectionTanzakuSwayStrength,
        DEFAULT_SETTINGS.projectionTanzakuSwayStrength,
        MIN_PROJECTION_TANZAKU_SWAY_STRENGTH,
        MAX_PROJECTION_TANZAKU_SWAY_STRENGTH
      ),
      projectionWindGustStrength: normalizeNumber(
        source.projectionWindGustStrength,
        DEFAULT_SETTINGS.projectionWindGustStrength,
        MIN_PROJECTION_WIND_GUST_STRENGTH,
        MAX_PROJECTION_WIND_GUST_STRENGTH
      ),
      projectionWindGustCycleMs: normalizeInteger(
        source.projectionWindGustCycleMs,
        DEFAULT_SETTINGS.projectionWindGustCycleMs,
        MIN_PROJECTION_WIND_GUST_CYCLE_SECONDS * 1000,
        MAX_PROJECTION_WIND_GUST_CYCLE_SECONDS * 1000
      ),
      projectionWindGustCycleJitterSeconds: normalizeInteger(
        source.projectionWindGustCycleJitterSeconds,
        DEFAULT_SETTINGS.projectionWindGustCycleJitterSeconds,
        MIN_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS,
        MAX_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS
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
        MIN_PROJECTION_PARALLAX_VANISHING_POINT_X,
        MAX_PROJECTION_PARALLAX_VANISHING_POINT_X
      ),
      projectionParallaxVanishingPointY: normalizeNumber(
        source.projectionParallaxVanishingPointY,
        DEFAULT_SETTINGS.projectionParallaxVanishingPointY,
        MIN_PROJECTION_PARALLAX_VANISHING_POINT_Y,
        MAX_PROJECTION_PARALLAX_VANISHING_POINT_Y
      ),
      projectionParallaxMarkerEnabled: source.projectionParallaxMarkerEnabled === true,
      projectionParallaxPopoutStrength: normalizeNumber(
        source.projectionParallaxPopoutStrength,
        DEFAULT_SETTINGS.projectionParallaxPopoutStrength,
        MIN_PROJECTION_PARALLAX_POPOUT_STRENGTH,
        MAX_PROJECTION_PARALLAX_POPOUT_STRENGTH
      ),
      projectionParallaxDepthMultiplier: normalizeNumber(
        source.projectionParallaxDepthMultiplier,
        DEFAULT_SETTINGS.projectionParallaxDepthMultiplier,
        MIN_PROJECTION_PARALLAX_DEPTH_MULTIPLIER,
        MAX_PROJECTION_PARALLAX_DEPTH_MULTIPLIER
      ),
      projectionParallaxDepthReferenceIndex: normalizeInteger(
        source.projectionParallaxDepthReferenceIndex,
        DEFAULT_SETTINGS.projectionParallaxDepthReferenceIndex,
        MIN_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX,
        MAX_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX
      ),
      projectionParallaxMotionMode: PROJECTION_PARALLAX_MOTION_MODES.has(source.projectionParallaxMotionMode)
        ? source.projectionParallaxMotionMode
        : DEFAULT_SETTINGS.projectionParallaxMotionMode,
      projectionParallaxViewerOffsetX: normalizeNumber(
        source.projectionParallaxViewerOffsetX,
        DEFAULT_SETTINGS.projectionParallaxViewerOffsetX,
        MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_X,
        MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_X
      ),
      projectionParallaxViewerOffsetY: normalizeNumber(
        source.projectionParallaxViewerOffsetY,
        DEFAULT_SETTINGS.projectionParallaxViewerOffsetY,
        MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_Y,
        MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_Y
      ),
      projectionParallaxViewerDistance: normalizeNumber(
        source.projectionParallaxViewerDistance,
        DEFAULT_SETTINGS.projectionParallaxViewerDistance,
        MIN_PROJECTION_PARALLAX_VIEWER_DISTANCE,
        MAX_PROJECTION_PARALLAX_VIEWER_DISTANCE
      ),
      projectionViewportMargin: normalizeNumber(
        source.projectionViewportMargin,
        DEFAULT_SETTINGS.projectionViewportMargin,
        MIN_PROJECTION_VIEWPORT_MARGIN,
        MAX_PROJECTION_VIEWPORT_MARGIN
      ),
      projectionCloudCount: normalizeInteger(
        source.projectionCloudCount,
        DEFAULT_SETTINGS.projectionCloudCount,
        MIN_PROJECTION_CLOUD_COUNT,
        MAX_PROJECTION_CLOUD_COUNT
      ),
      projectionCloudOriginY: normalizeRelativeNumber(
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
  for (const client of adminClients) {
    sendSse(client, "update", { at: new Date().toISOString() });
  }
}

function sendSse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function broadcastProjectionUpdate(reason) {
  const payload = { at: new Date().toISOString(), reason };
  for (const client of projectionClients) {
    sendSse(client, "update", payload);
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
    projectionTanzakuFontId: PROJECTION_TANZAKU_FONT_IDS.has(settings.projectionTanzakuFontId)
      ? settings.projectionTanzakuFontId
      : DEFAULT_SETTINGS.projectionTanzakuFontId,
    projectionColorEmojiFontEnabled: settings.projectionColorEmojiFontEnabled === true,
    projectionMilkyWayGain: settings.projectionMilkyWayGain,
    projectionMilkyWayTwinkle: settings.projectionMilkyWayTwinkle,
    projectionMilkyWaySparkle: settings.projectionMilkyWaySparkle,
    projectionMilkyWaySpeed: settings.projectionMilkyWaySpeed,
    projectionMilkyWayParticleCount: settings.projectionMilkyWayParticleCount,
    projectionMilkyWaySparkleRatio: settings.projectionMilkyWaySparkleRatio,
    projectionMilkyWaySparklePeriodVariance: settings.projectionMilkyWaySparklePeriodVariance,
    projectionMilkyWaySparkleIntensityVariance: settings.projectionMilkyWaySparkleIntensityVariance,
    projectionMilkyWaySparklePeriodSeconds: settings.projectionMilkyWaySparklePeriodSeconds,
    projectionMilkyWaySparkleDutyRatio: settings.projectionMilkyWaySparkleDutyRatio,
    projectionMilkyWaySeed: settings.projectionMilkyWaySeed,
    projectionTanabataStarResponseIntensity: settings.projectionTanabataStarResponseIntensity,
    projectionTanabataStarResponsePhaseDeg: settings.projectionTanabataStarResponsePhaseDeg,
    projectionTanabataStarResponsePeriodSeconds: settings.projectionTanabataStarResponsePeriodSeconds,
    projectionTanzakuSwayStrength: settings.projectionTanzakuSwayStrength,
    projectionTanzakuAmbientSwayStrength: settings.projectionTanzakuAmbientSwayStrength,
    projectionWindGustStrength: settings.projectionWindGustStrength,
    projectionWindGustCycleMs: settings.projectionWindGustCycleMs,
    projectionWindGustCycleJitterSeconds: settings.projectionWindGustCycleJitterSeconds,
    projectionExperimentalParallaxEnabled: settings.projectionExperimentalParallaxEnabled,
    projectionParallaxStrength: settings.projectionParallaxStrength,
    projectionParallaxVanishingPointX: settings.projectionParallaxVanishingPointX,
    projectionParallaxVanishingPointY: settings.projectionParallaxVanishingPointY,
    projectionParallaxMarkerEnabled: settings.projectionParallaxMarkerEnabled === true,
    projectionParallaxPopoutStrength: settings.projectionParallaxPopoutStrength,
    projectionParallaxDepthMultiplier: settings.projectionParallaxDepthMultiplier,
    projectionParallaxDepthReferenceIndex: settings.projectionParallaxDepthReferenceIndex,
    projectionParallaxMotionMode: PROJECTION_PARALLAX_MOTION_MODES.has(settings.projectionParallaxMotionMode)
      ? settings.projectionParallaxMotionMode
      : DEFAULT_SETTINGS.projectionParallaxMotionMode,
    projectionParallaxViewerOffsetX: settings.projectionParallaxViewerOffsetX,
    projectionParallaxViewerOffsetY: settings.projectionParallaxViewerOffsetY,
    projectionParallaxViewerDistance: settings.projectionParallaxViewerDistance,
    projectionViewportMargin: settings.projectionViewportMargin,
    projectionCloudCount: settings.projectionCloudCount,
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
    projectionTanzakuFontIds: Array.from(PROJECTION_TANZAKU_FONT_IDS),
    projectionMilkyWayGainMin: MIN_PROJECTION_MILKY_WAY_GAIN,
    projectionMilkyWayGainMax: MAX_PROJECTION_MILKY_WAY_GAIN,
    projectionMilkyWayTwinkleMin: MIN_PROJECTION_MILKY_WAY_TWINKLE,
    projectionMilkyWayTwinkleMax: MAX_PROJECTION_MILKY_WAY_TWINKLE,
    projectionMilkyWaySparkleMin: MIN_PROJECTION_MILKY_WAY_SPARKLE,
    projectionMilkyWaySparkleMax: MAX_PROJECTION_MILKY_WAY_SPARKLE,
    projectionMilkyWaySpeedMin: MIN_PROJECTION_MILKY_WAY_SPEED,
    projectionMilkyWaySpeedMax: MAX_PROJECTION_MILKY_WAY_SPEED,
    projectionMilkyWayParticleCountMin: MIN_PROJECTION_MILKY_WAY_PARTICLE_COUNT,
    projectionMilkyWayParticleCountMax: MAX_PROJECTION_MILKY_WAY_PARTICLE_COUNT,
    projectionMilkyWaySparkleRatioMin: MIN_PROJECTION_MILKY_WAY_SPARKLE_RATIO,
    projectionMilkyWaySparkleRatioMax: MAX_PROJECTION_MILKY_WAY_SPARKLE_RATIO,
    projectionMilkyWaySparklePeriodVarianceMin: MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE,
    projectionMilkyWaySparklePeriodVarianceMax: MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE,
    projectionMilkyWaySparkleIntensityVarianceMin: MIN_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE,
    projectionMilkyWaySparkleIntensityVarianceMax: MAX_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE,
    projectionMilkyWaySparklePeriodSecondsMin: MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS,
    projectionMilkyWaySparklePeriodSecondsMax: MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS,
    projectionMilkyWaySparkleDutyRatioMin: MIN_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO,
    projectionMilkyWaySparkleDutyRatioMax: MAX_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO,
    projectionTanabataStarResponseIntensityMin: MIN_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY,
    projectionTanabataStarResponseIntensityMax: MAX_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY,
    projectionTanabataStarResponsePhaseDegMin: MIN_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG,
    projectionTanabataStarResponsePhaseDegMax: MAX_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG,
    projectionTanabataStarResponsePeriodSecondsMin: MIN_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS,
    projectionTanabataStarResponsePeriodSecondsMax: MAX_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS,
    projectionTanzakuSwayStrengthMin: MIN_PROJECTION_TANZAKU_SWAY_STRENGTH,
    projectionTanzakuSwayStrengthMax: MAX_PROJECTION_TANZAKU_SWAY_STRENGTH,
    projectionTanzakuAmbientSwayStrengthMin: MIN_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH,
    projectionTanzakuAmbientSwayStrengthMax: MAX_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH,
    projectionWindGustStrengthMin: MIN_PROJECTION_WIND_GUST_STRENGTH,
    projectionWindGustStrengthMax: MAX_PROJECTION_WIND_GUST_STRENGTH,
    projectionWindGustCycleSecondsMin: MIN_PROJECTION_WIND_GUST_CYCLE_SECONDS,
    projectionWindGustCycleSecondsMax: MAX_PROJECTION_WIND_GUST_CYCLE_SECONDS,
    projectionWindGustCycleJitterSecondsMin: MIN_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS,
    projectionWindGustCycleJitterSecondsMax: MAX_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS,
    projectionParallaxStrengthMin: MIN_PROJECTION_PARALLAX_STRENGTH,
    projectionParallaxStrengthMax: MAX_PROJECTION_PARALLAX_STRENGTH,
    projectionParallaxVanishingPointMin: MIN_PROJECTION_PARALLAX_VANISHING_POINT_X,
    projectionParallaxVanishingPointMax: MAX_PROJECTION_PARALLAX_VANISHING_POINT_X,
    projectionParallaxVanishingPointXMin: MIN_PROJECTION_PARALLAX_VANISHING_POINT_X,
    projectionParallaxVanishingPointXMax: MAX_PROJECTION_PARALLAX_VANISHING_POINT_X,
    projectionParallaxVanishingPointYMin: MIN_PROJECTION_PARALLAX_VANISHING_POINT_Y,
    projectionParallaxVanishingPointYMax: MAX_PROJECTION_PARALLAX_VANISHING_POINT_Y,
    projectionParallaxPopoutStrengthMin: MIN_PROJECTION_PARALLAX_POPOUT_STRENGTH,
    projectionParallaxPopoutStrengthMax: MAX_PROJECTION_PARALLAX_POPOUT_STRENGTH,
    projectionParallaxDepthMultiplierMin: MIN_PROJECTION_PARALLAX_DEPTH_MULTIPLIER,
    projectionParallaxDepthMultiplierMax: MAX_PROJECTION_PARALLAX_DEPTH_MULTIPLIER,
    projectionParallaxDepthReferenceIndexMin: MIN_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX,
    projectionParallaxDepthReferenceIndexMax: MAX_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX,
    projectionParallaxViewerOffsetXMin: MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_X,
    projectionParallaxViewerOffsetXMax: MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_X,
    projectionParallaxViewerOffsetYMin: MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_Y,
    projectionParallaxViewerOffsetYMax: MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_Y,
    projectionParallaxViewerDistanceMin: MIN_PROJECTION_PARALLAX_VIEWER_DISTANCE,
    projectionParallaxViewerDistanceMax: MAX_PROJECTION_PARALLAX_VIEWER_DISTANCE,
    projectionViewportMarginMin: MIN_PROJECTION_VIEWPORT_MARGIN,
    projectionViewportMarginMax: MAX_PROJECTION_VIEWPORT_MARGIN,
    projectionCloudCountMin: MIN_PROJECTION_CLOUD_COUNT,
    projectionCloudCountMax: MAX_PROJECTION_CLOUD_COUNT,
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
        sendError(res, 400, "入替数は1以上です。");
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

    if (Object.prototype.hasOwnProperty.call(body, "projectionTanzakuFontId")) {
      const tanzakuFontId = String(body.projectionTanzakuFontId || "");
      if (!PROJECTION_TANZAKU_FONT_IDS.has(tanzakuFontId)) {
        sendError(res, 400, "短冊フォントの指定が不正です。");
        return;
      }
      nextSettings.projectionTanzakuFontId = tanzakuFontId;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionColorEmojiFontEnabled")) {
      nextSettings.projectionColorEmojiFontEnabled = body.projectionColorEmojiFontEnabled === true;
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

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWayTwinkle")) {
      const milkyWayTwinkle = Number(body.projectionMilkyWayTwinkle);
      if (
        !Number.isFinite(milkyWayTwinkle) ||
        milkyWayTwinkle < MIN_PROJECTION_MILKY_WAY_TWINKLE ||
        milkyWayTwinkle > MAX_PROJECTION_MILKY_WAY_TWINKLE
      ) {
        sendError(res, 400, `天の川きらめきは${MIN_PROJECTION_MILKY_WAY_TWINKLE}から${MAX_PROJECTION_MILKY_WAY_TWINKLE}までです。`);
        return;
      }
      nextSettings.projectionMilkyWayTwinkle = milkyWayTwinkle;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWaySparkle")) {
      const milkyWaySparkle = Number(body.projectionMilkyWaySparkle);
      if (
        !Number.isFinite(milkyWaySparkle) ||
        milkyWaySparkle < MIN_PROJECTION_MILKY_WAY_SPARKLE ||
        milkyWaySparkle > MAX_PROJECTION_MILKY_WAY_SPARKLE
      ) {
        sendError(res, 400, `強い瞬きは${MIN_PROJECTION_MILKY_WAY_SPARKLE}から${MAX_PROJECTION_MILKY_WAY_SPARKLE}までです。`);
        return;
      }
      nextSettings.projectionMilkyWaySparkle = milkyWaySparkle;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWaySpeed")) {
      const milkyWaySpeed = Number(body.projectionMilkyWaySpeed);
      if (
        !Number.isFinite(milkyWaySpeed) ||
        milkyWaySpeed < MIN_PROJECTION_MILKY_WAY_SPEED ||
        milkyWaySpeed > MAX_PROJECTION_MILKY_WAY_SPEED
      ) {
        sendError(res, 400, `天の川変化速度は${MIN_PROJECTION_MILKY_WAY_SPEED}から${MAX_PROJECTION_MILKY_WAY_SPEED}までです。`);
        return;
      }
      nextSettings.projectionMilkyWaySpeed = milkyWaySpeed;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWayParticleCount")) {
      const milkyWayParticleCount = Number(body.projectionMilkyWayParticleCount);
      if (
        !Number.isInteger(milkyWayParticleCount) ||
        milkyWayParticleCount < MIN_PROJECTION_MILKY_WAY_PARTICLE_COUNT ||
        milkyWayParticleCount > MAX_PROJECTION_MILKY_WAY_PARTICLE_COUNT
      ) {
        sendError(
          res,
          400,
          `天の川粒子数は${MIN_PROJECTION_MILKY_WAY_PARTICLE_COUNT}から${MAX_PROJECTION_MILKY_WAY_PARTICLE_COUNT}までです。`
        );
        return;
      }
      nextSettings.projectionMilkyWayParticleCount = milkyWayParticleCount;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWaySparkleRatio")) {
      const milkyWaySparkleRatio = Number(body.projectionMilkyWaySparkleRatio);
      if (
        !Number.isFinite(milkyWaySparkleRatio) ||
        milkyWaySparkleRatio < MIN_PROJECTION_MILKY_WAY_SPARKLE_RATIO ||
        milkyWaySparkleRatio > MAX_PROJECTION_MILKY_WAY_SPARKLE_RATIO
      ) {
        sendError(
          res,
          400,
          `強い瞬き割合は${MIN_PROJECTION_MILKY_WAY_SPARKLE_RATIO}から${MAX_PROJECTION_MILKY_WAY_SPARKLE_RATIO}までです。`
        );
        return;
      }
      nextSettings.projectionMilkyWaySparkleRatio = milkyWaySparkleRatio;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWaySparklePeriodVariance")) {
      const milkyWaySparklePeriodVariance = Number(body.projectionMilkyWaySparklePeriodVariance);
      if (
        !Number.isFinite(milkyWaySparklePeriodVariance) ||
        milkyWaySparklePeriodVariance < MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE ||
        milkyWaySparklePeriodVariance > MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE
      ) {
        sendError(
          res,
          400,
          `瞬き周期分散は${MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE}から${MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_VARIANCE}までです。`
        );
        return;
      }
      nextSettings.projectionMilkyWaySparklePeriodVariance = milkyWaySparklePeriodVariance;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWaySparkleIntensityVariance")) {
      const milkyWaySparkleIntensityVariance = Number(body.projectionMilkyWaySparkleIntensityVariance);
      if (
        !Number.isFinite(milkyWaySparkleIntensityVariance) ||
        milkyWaySparkleIntensityVariance < MIN_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE ||
        milkyWaySparkleIntensityVariance > MAX_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE
      ) {
        sendError(
          res,
          400,
          `瞬き強度分散は${MIN_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE}から${MAX_PROJECTION_MILKY_WAY_SPARKLE_INTENSITY_VARIANCE}までです。`
        );
        return;
      }
      nextSettings.projectionMilkyWaySparkleIntensityVariance = milkyWaySparkleIntensityVariance;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWaySparklePeriodSeconds")) {
      const milkyWaySparklePeriodSeconds = Number(body.projectionMilkyWaySparklePeriodSeconds);
      if (
        !Number.isFinite(milkyWaySparklePeriodSeconds) ||
        milkyWaySparklePeriodSeconds < MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS ||
        milkyWaySparklePeriodSeconds > MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS
      ) {
        sendError(
          res,
          400,
          `強い瞬き周期は${MIN_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS}から${MAX_PROJECTION_MILKY_WAY_SPARKLE_PERIOD_SECONDS}秒までです。`
        );
        return;
      }
      nextSettings.projectionMilkyWaySparklePeriodSeconds = milkyWaySparklePeriodSeconds;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWaySparkleDutyRatio")) {
      const milkyWaySparkleDutyRatio = Number(body.projectionMilkyWaySparkleDutyRatio);
      if (
        !Number.isFinite(milkyWaySparkleDutyRatio) ||
        milkyWaySparkleDutyRatio < MIN_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO ||
        milkyWaySparkleDutyRatio > MAX_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO
      ) {
        sendError(
          res,
          400,
          `強い瞬きデューティは${MIN_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO}から${MAX_PROJECTION_MILKY_WAY_SPARKLE_DUTY_RATIO}までです。`
        );
        return;
      }
      nextSettings.projectionMilkyWaySparkleDutyRatio = milkyWaySparkleDutyRatio;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionMilkyWaySeed")) {
      nextSettings.projectionMilkyWaySeed = String(body.projectionMilkyWaySeed || DEFAULT_SETTINGS.projectionMilkyWaySeed).slice(0, 80);
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionTanabataStarResponseIntensity")) {
      const tanabataStarResponseIntensity = Number(body.projectionTanabataStarResponseIntensity);
      if (
        !Number.isFinite(tanabataStarResponseIntensity) ||
        tanabataStarResponseIntensity < MIN_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY ||
        tanabataStarResponseIntensity > MAX_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY
      ) {
        sendError(
          res,
          400,
          `ベガ/アルタイル発光強度は${MIN_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY}から${MAX_PROJECTION_TANABATA_STAR_RESPONSE_INTENSITY}までです。`
        );
        return;
      }
      nextSettings.projectionTanabataStarResponseIntensity = tanabataStarResponseIntensity;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionTanabataStarResponsePhaseDeg")) {
      const tanabataStarResponsePhaseDeg = Number(body.projectionTanabataStarResponsePhaseDeg);
      if (
        !Number.isFinite(tanabataStarResponsePhaseDeg) ||
        tanabataStarResponsePhaseDeg < MIN_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG ||
        tanabataStarResponsePhaseDeg > MAX_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG
      ) {
        sendError(
          res,
          400,
          `ベガ/アルタイル位相差は${MIN_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG}から${MAX_PROJECTION_TANABATA_STAR_RESPONSE_PHASE_DEG}までです。`
        );
        return;
      }
      nextSettings.projectionTanabataStarResponsePhaseDeg = tanabataStarResponsePhaseDeg;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionTanabataStarResponsePeriodSeconds")) {
      const tanabataStarResponsePeriodSeconds = Number(body.projectionTanabataStarResponsePeriodSeconds);
      if (
        !Number.isFinite(tanabataStarResponsePeriodSeconds) ||
        tanabataStarResponsePeriodSeconds < MIN_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS ||
        tanabataStarResponsePeriodSeconds > MAX_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS
      ) {
        sendError(
          res,
          400,
          `ベガ/アルタイル周期は${MIN_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS}から${MAX_PROJECTION_TANABATA_STAR_RESPONSE_PERIOD_SECONDS}秒までです。`
        );
        return;
      }
      nextSettings.projectionTanabataStarResponsePeriodSeconds = tanabataStarResponsePeriodSeconds;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionTanzakuSwayStrength")) {
      const tanzakuSwayStrength = Number(body.projectionTanzakuSwayStrength);
      if (
        !Number.isFinite(tanzakuSwayStrength) ||
        tanzakuSwayStrength < MIN_PROJECTION_TANZAKU_SWAY_STRENGTH ||
        tanzakuSwayStrength > MAX_PROJECTION_TANZAKU_SWAY_STRENGTH
      ) {
        sendError(
          res,
          400,
          `短冊の突風連動揺れは${MIN_PROJECTION_TANZAKU_SWAY_STRENGTH}から${MAX_PROJECTION_TANZAKU_SWAY_STRENGTH}までです。`
        );
        return;
      }
      nextSettings.projectionTanzakuSwayStrength = tanzakuSwayStrength;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionTanzakuAmbientSwayStrength")) {
      const tanzakuAmbientSwayStrength = Number(body.projectionTanzakuAmbientSwayStrength);
      if (
        !Number.isFinite(tanzakuAmbientSwayStrength) ||
        tanzakuAmbientSwayStrength < MIN_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH ||
        tanzakuAmbientSwayStrength > MAX_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH
      ) {
        sendError(
          res,
          400,
          `短冊の常時ゆらぎは${MIN_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH}から${MAX_PROJECTION_TANZAKU_AMBIENT_SWAY_STRENGTH}までです。`
        );
        return;
      }
      nextSettings.projectionTanzakuAmbientSwayStrength = tanzakuAmbientSwayStrength;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionWindGustStrength")) {
      const windGustStrength = Number(body.projectionWindGustStrength);
      if (
        !Number.isFinite(windGustStrength) ||
        windGustStrength < MIN_PROJECTION_WIND_GUST_STRENGTH ||
        windGustStrength > MAX_PROJECTION_WIND_GUST_STRENGTH
      ) {
        sendError(
          res,
          400,
          `押し流し強度は${MIN_PROJECTION_WIND_GUST_STRENGTH}から${MAX_PROJECTION_WIND_GUST_STRENGTH}までです。`
        );
        return;
      }
      nextSettings.projectionWindGustStrength = windGustStrength;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionWindGustCycleMs")) {
      const windGustCycleMs = Number(body.projectionWindGustCycleMs);
      if (
        !Number.isInteger(windGustCycleMs) ||
        windGustCycleMs < MIN_PROJECTION_WIND_GUST_CYCLE_SECONDS * 1000 ||
        windGustCycleMs > MAX_PROJECTION_WIND_GUST_CYCLE_SECONDS * 1000
      ) {
        sendError(
          res,
          400,
          `押し流し周期は${MIN_PROJECTION_WIND_GUST_CYCLE_SECONDS}から${MAX_PROJECTION_WIND_GUST_CYCLE_SECONDS}秒までです。`
        );
        return;
      }
      nextSettings.projectionWindGustCycleMs = windGustCycleMs;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionWindGustCycleJitterSeconds")) {
      const windGustCycleJitterSeconds = Number(body.projectionWindGustCycleJitterSeconds);
      if (
        !Number.isInteger(windGustCycleJitterSeconds) ||
        windGustCycleJitterSeconds < MIN_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS ||
        windGustCycleJitterSeconds > MAX_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS
      ) {
        sendError(
          res,
          400,
          `押し流しのランダム延長は${MIN_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS}から${MAX_PROJECTION_WIND_GUST_CYCLE_JITTER_SECONDS}秒までです。`
        );
        return;
      }
      nextSettings.projectionWindGustCycleJitterSeconds = windGustCycleJitterSeconds;
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
        sendError(res, 400, `左右移動倍率は${MIN_PROJECTION_PARALLAX_STRENGTH}から${MAX_PROJECTION_PARALLAX_STRENGTH}までです。`);
        return;
      }
      nextSettings.projectionParallaxStrength = parallaxStrength;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxVanishingPointX")) {
      const vanishingPointX = Number(body.projectionParallaxVanishingPointX);
      if (
        !Number.isFinite(vanishingPointX) ||
        vanishingPointX < MIN_PROJECTION_PARALLAX_VANISHING_POINT_X ||
        vanishingPointX > MAX_PROJECTION_PARALLAX_VANISHING_POINT_X
      ) {
        sendError(res, 400, `視差消失点Xは${MIN_PROJECTION_PARALLAX_VANISHING_POINT_X}から${MAX_PROJECTION_PARALLAX_VANISHING_POINT_X}までです。`);
        return;
      }
      nextSettings.projectionParallaxVanishingPointX = vanishingPointX;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxVanishingPointY")) {
      const vanishingPointY = Number(body.projectionParallaxVanishingPointY);
      if (
        !Number.isFinite(vanishingPointY) ||
        vanishingPointY < MIN_PROJECTION_PARALLAX_VANISHING_POINT_Y ||
        vanishingPointY > MAX_PROJECTION_PARALLAX_VANISHING_POINT_Y
      ) {
        sendError(res, 400, `視差消失点Yは${MIN_PROJECTION_PARALLAX_VANISHING_POINT_Y}から${MAX_PROJECTION_PARALLAX_VANISHING_POINT_Y}までです。`);
        return;
      }
      nextSettings.projectionParallaxVanishingPointY = vanishingPointY;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxMarkerEnabled")) {
      nextSettings.projectionParallaxMarkerEnabled = body.projectionParallaxMarkerEnabled === true;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxPopoutStrength")) {
      const popoutStrength = Number(body.projectionParallaxPopoutStrength);
      if (
        !Number.isFinite(popoutStrength) ||
        popoutStrength < MIN_PROJECTION_PARALLAX_POPOUT_STRENGTH ||
        popoutStrength > MAX_PROJECTION_PARALLAX_POPOUT_STRENGTH
      ) {
        sendError(res, 400, `前後/上下移動倍率は${MIN_PROJECTION_PARALLAX_POPOUT_STRENGTH}から${MAX_PROJECTION_PARALLAX_POPOUT_STRENGTH}までです。`);
        return;
      }
      nextSettings.projectionParallaxPopoutStrength = popoutStrength;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxDepthMultiplier")) {
      const depthMultiplier = Number(body.projectionParallaxDepthMultiplier);
      if (
        !Number.isFinite(depthMultiplier) ||
        depthMultiplier < MIN_PROJECTION_PARALLAX_DEPTH_MULTIPLIER ||
        depthMultiplier > MAX_PROJECTION_PARALLAX_DEPTH_MULTIPLIER
      ) {
        sendError(res, 400, `短冊奥行倍率は${MIN_PROJECTION_PARALLAX_DEPTH_MULTIPLIER}から${MAX_PROJECTION_PARALLAX_DEPTH_MULTIPLIER}までです。`);
        return;
      }
      nextSettings.projectionParallaxDepthMultiplier = depthMultiplier;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxDepthReferenceIndex")) {
      const depthReferenceIndex = Number(body.projectionParallaxDepthReferenceIndex);
      if (
        !Number.isInteger(depthReferenceIndex) ||
        depthReferenceIndex < MIN_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX ||
        depthReferenceIndex > MAX_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX
      ) {
        sendError(res, 400, `短冊奥行基準順は${MIN_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX}から${MAX_PROJECTION_PARALLAX_DEPTH_REFERENCE_INDEX}までです。`);
        return;
      }
      nextSettings.projectionParallaxDepthReferenceIndex = depthReferenceIndex;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxMotionMode")) {
      const motionMode = String(body.projectionParallaxMotionMode || "");
      if (!PROJECTION_PARALLAX_MOTION_MODES.has(motionMode)) {
        sendError(res, 400, "笹舟移動モードは display / mapping / camera / camera-display のいずれかです。");
        return;
      }
      nextSettings.projectionParallaxMotionMode = motionMode;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxViewerOffsetX")) {
      const viewerOffsetX = Number(body.projectionParallaxViewerOffsetX);
      if (
        !Number.isFinite(viewerOffsetX) ||
        viewerOffsetX < MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_X ||
        viewerOffsetX > MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_X
      ) {
        sendError(res, 400, `鑑賞地点左右オフセットは${MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_X}から${MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_X}までです。`);
        return;
      }
      nextSettings.projectionParallaxViewerOffsetX = viewerOffsetX;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxViewerOffsetY")) {
      const viewerOffsetY = Number(body.projectionParallaxViewerOffsetY);
      if (
        !Number.isFinite(viewerOffsetY) ||
        viewerOffsetY < MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_Y ||
        viewerOffsetY > MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_Y
      ) {
        sendError(res, 400, `鑑賞地点上下オフセットは${MIN_PROJECTION_PARALLAX_VIEWER_OFFSET_Y}から${MAX_PROJECTION_PARALLAX_VIEWER_OFFSET_Y}までです。`);
        return;
      }
      nextSettings.projectionParallaxViewerOffsetY = viewerOffsetY;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionParallaxViewerDistance")) {
      const viewerDistance = Number(body.projectionParallaxViewerDistance);
      if (
        !Number.isFinite(viewerDistance) ||
        viewerDistance < MIN_PROJECTION_PARALLAX_VIEWER_DISTANCE ||
        viewerDistance > MAX_PROJECTION_PARALLAX_VIEWER_DISTANCE
      ) {
        sendError(res, 400, `壁面からの距離は${MIN_PROJECTION_PARALLAX_VIEWER_DISTANCE}から${MAX_PROJECTION_PARALLAX_VIEWER_DISTANCE}までです。`);
        return;
      }
      nextSettings.projectionParallaxViewerDistance = viewerDistance;
    }

    if (Object.prototype.hasOwnProperty.call(body, "projectionViewportMargin")) {
      const viewportMargin = Number(body.projectionViewportMargin);
      if (
        !Number.isFinite(viewportMargin) ||
        viewportMargin < MIN_PROJECTION_VIEWPORT_MARGIN ||
        viewportMargin > MAX_PROJECTION_VIEWPORT_MARGIN
      ) {
        sendError(res, 400, `投影面余白は${MIN_PROJECTION_VIEWPORT_MARGIN}から${MAX_PROJECTION_VIEWPORT_MARGIN}までです。`);
        return;
      }
      nextSettings.projectionViewportMargin = viewportMargin;
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
    broadcastProjectionUpdate("settings");
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
    broadcastProjectionUpdate("effect");
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
    broadcastProjectionUpdate("wishes");
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

  if (req.method === "POST" && url.pathname === "/api/admin/wishes/bulk-status") {
    if (!isAdmin(req, url)) {
      sendError(res, 401, "管理キーが必要です。");
      return;
    }

    const body = await parseJsonBody(req);
    const fromStatus = String(body.fromStatus || "");
    const nextStatus = String(body.status || "");
    if (!["pending", "approved", "rejected"].includes(fromStatus)) {
      sendError(res, 400, "fromStatus は pending / approved / rejected のいずれかです。");
      return;
    }
    if (!["pending", "approved", "rejected"].includes(nextStatus)) {
      sendError(res, 400, "status は pending / approved / rejected のいずれかです。");
      return;
    }
    if (fromStatus === nextStatus) {
      sendError(res, 400, "変更前と変更後の status が同じです。");
      return;
    }

    const wishes = await readWishes();
    const now = new Date().toISOString();
    let updatedCount = 0;
    for (const wish of wishes) {
      if (wish.status !== fromStatus) continue;
      wish.status = nextStatus;
      wish.approvedAt = nextStatus === "approved" ? now : null;
      wish.rejectedAt = nextStatus === "rejected" ? now : null;
      wish.moderation = buildModerationInfo("manual", nextStatus, "管理者による一括変更");
      updatedCount += 1;
    }

    if (updatedCount > 0) {
      await writeWishes(wishes);
      broadcastAdminUpdate();
      broadcastProjectionUpdate("wishes");
    }
    sendJson(res, 200, { ok: true, updatedCount, byStatus: countByStatus(wishes) });
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

  if (req.method === "GET" && url.pathname === "/api/projection/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    sendSse(res, "ready", { ok: true });
    projectionClients.add(res);

    const keepAlive = setInterval(() => {
      sendSse(res, "ping", { at: Date.now() });
    }, 25000);

    req.on("close", () => {
      clearInterval(keepAlive);
      projectionClients.delete(res);
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
    broadcastProjectionUpdate("wishes");
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
      broadcastProjectionUpdate("wishes");
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
    broadcastProjectionUpdate("wishes");
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
