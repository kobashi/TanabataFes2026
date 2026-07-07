const stage = document.querySelector("#tanzaku-stage");
const projectionStage = document.querySelector(".projection-stage");
const effectsCanvas = document.querySelector("#projection-effects-canvas");
const webglEffectsCanvas = document.querySelector("#projection-webgl-effects-canvas");
const cloudLayer = document.querySelector("#cloud-layer");
const vanishingPointMarker = document.querySelector("#vanishing-point-marker");
const parallaxPerspectiveBox = document.querySelector("#parallax-perspective-box");
const parallaxBoxDragHandle = document.querySelector("#parallax-box-drag-handle");
const parallaxDepthMap = document.querySelector("#parallax-depth-map");
const emptyState = document.querySelector("#empty-state");
const layoutMenuTrigger = document.querySelector("#layout-menu-trigger");
const layoutMenu = document.querySelector("#layout-menu");
const layoutMenuState = document.querySelector("#layout-menu-state");
const layoutSaveButton = document.querySelector("#layout-save-button");
const layoutLoadButton = document.querySelector("#layout-load-button");
const layoutClearButton = document.querySelector("#layout-clear-button");
const layoutFullscreenButton = document.querySelector("#layout-fullscreen-button");
const tanzakuFontSelect = document.querySelector("#tanzaku-font-select");
const tanzakuFontSizeInput = document.querySelector("#tanzaku-font-size");
const tanzakuFontSizeValue = document.querySelector("#tanzaku-font-size-value");
const oracleBoatSizeInput = document.querySelector("#oracle-boat-size");
const oracleBoatSizeValue = document.querySelector("#oracle-boat-size-value");
const oracleBoatOffsetInput = document.querySelector("#oracle-boat-offset");
const oracleBoatOffsetValue = document.querySelector("#oracle-boat-offset-value");
const perspectiveBoxXInput = document.querySelector("#perspective-box-x");
const perspectiveBoxXValue = document.querySelector("#perspective-box-x-value");
const perspectiveBoxYInput = document.querySelector("#perspective-box-y");
const perspectiveBoxYValue = document.querySelector("#perspective-box-y-value");
const bambooLeftXInput = document.querySelector("#bamboo-left-x");
const bambooLeftXValue = document.querySelector("#bamboo-left-x-value");
const bambooLeftYInput = document.querySelector("#bamboo-left-y");
const bambooLeftYValue = document.querySelector("#bamboo-left-y-value");
const bambooRightXInput = document.querySelector("#bamboo-right-x");
const bambooRightXValue = document.querySelector("#bamboo-right-x-value");
const bambooRightYInput = document.querySelector("#bamboo-right-y");
const bambooRightYValue = document.querySelector("#bamboo-right-y-value");
const layoutParallaxViewerXInput = document.querySelector("#layout-parallax-viewer-x");
const layoutParallaxViewerXValue = document.querySelector("#layout-parallax-viewer-x-value");
const layoutParallaxViewerYInput = document.querySelector("#layout-parallax-viewer-y");
const layoutParallaxViewerYValue = document.querySelector("#layout-parallax-viewer-y-value");
const layoutParallaxViewerZInput = document.querySelector("#layout-parallax-viewer-z");
const layoutParallaxViewerZValue = document.querySelector("#layout-parallax-viewer-z-value");
const layoutParallaxVanishingXInput = document.querySelector("#layout-parallax-vanishing-x");
const layoutParallaxVanishingXValue = document.querySelector("#layout-parallax-vanishing-x-value");
const layoutParallaxVanishingYInput = document.querySelector("#layout-parallax-vanishing-y");
const layoutParallaxVanishingYValue = document.querySelector("#layout-parallax-vanishing-y-value");
const layoutParallaxEnabledInput = document.querySelector("#layout-parallax-enabled");
const layoutParallaxMarkerEnabledInput = document.querySelector("#layout-parallax-marker-enabled");
const layoutParallaxMotionModeInput = document.querySelector("#layout-parallax-motion-mode");
const layoutOracleMotionSpeedInput = document.querySelector("#layout-oracle-motion-speed");
const layoutOracleMotionSpeedValue = document.querySelector("#layout-oracle-motion-speed-value");
const layoutOracleMotionDirectionInput = document.querySelector("#layout-oracle-motion-direction");
const layoutParallaxStrengthInput = document.querySelector("#layout-parallax-strength");
const layoutParallaxStrengthValue = document.querySelector("#layout-parallax-strength-value");
const layoutParallaxPopoutInput = document.querySelector("#layout-parallax-popout");
const layoutParallaxPopoutValue = document.querySelector("#layout-parallax-popout-value");

const colors = ["ivory", "crimson", "aqua", "violet", "gold", "leaf"];
const tanzakuFontOptions = [
  {
    id: "mincho",
    label: "明朝",
    family: "\"BIZ UDMincho\", \"Source Han Serif JP\", \"Noto Serif CJK JP\", \"Noto Serif JP\", \"Hiragino Mincho ProN\", \"Yu Mincho\", \"YuMincho\", serif"
  },
  {
    id: "gothic",
    label: "角ゴシック",
    family: "\"Zen Kaku Gothic New\", \"Zen Kaku Gothic N\", \"Source Han Sans JP\", \"Noto Sans CJK JP\", \"Noto Sans JP\", \"BIZ UDGothic\", \"BIZ UDPGothic\", sans-serif"
  },
  {
    id: "maru",
    label: "丸ゴシック",
    family: "\"Zen Maru Gothic\", \"M PLUS Rounded 1c\", \"Hiragino Maru Gothic ProN\", \"Source Han Sans JP\", \"Noto Sans CJK JP\", \"Noto Sans JP\", sans-serif"
  },
  {
    id: "kyokasho",
    label: "教科書体",
    family: "\"BIZ UDMincho\", \"Yu Kyokasho\", \"Source Han Serif JP\", \"Noto Serif CJK JP\", \"Noto Serif JP\", \"Hiragino Mincho ProN\", \"Yu Mincho\", \"YuMincho\", serif"
  },
  {
    id: "brush",
    label: "筆文字風",
    family: "\"Klee\", \"Klee One\", \"Hiragino Mincho ProN\", \"Yu Mincho\", serif"
  }
];
const TANZAKU_FONT_ASSET_VERSION = "20260704-1";
const tanzakuFontStylesheets = {
  gothic: `/fonts/tanzaku-gothic.css?v=${TANZAKU_FONT_ASSET_VERSION}`,
  maru: `/fonts/tanzaku-maru.css?v=${TANZAKU_FONT_ASSET_VERSION}`,
  emoji: `/fonts/tanzaku-emoji.css?v=${TANZAKU_FONT_ASSET_VERSION}`
};
const loadedTanzakuFontStylesheets = new Set();
const COLOR_EMOJI_FONT_FAMILY = "\"Noto Color Emoji\", \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", emoji";
const DEFAULT_DISPLAY_COUNT = 12;
const DEFAULT_SLOT_COUNT = 15;
const DEFAULT_MOVE_COUNT = 1;
const DEFAULT_TYPING_INTERVAL_MS = 240;
const DEFAULT_ROTATE_INTERVAL_MS = 18000;
const REFRESH_INTERVAL_MS = 7000;
const EFFECT_POLL_INTERVAL_MS = 2500;
const PARALLAX_VIEWER_STEP_MS = 4200;
const PARALLAX_VIEWER_DISTANCE_MAX = 32;
const PARALLAX_OVERLAY_FRAME_MS = 1000 / 15;
const PARALLAX_PIXEL_STEP = 0.5;
const PARALLAX_SCALE_STEP = 0.005;
const PARALLAX_CAMERA_X = 0.16;
const PARALLAX_CAMERA_Y = 0.14;
const PARALLAX_CAMERA_Z = 0.34;
const PARALLAX_VIEWER_OFFSET_X_MIN = -8;
const PARALLAX_VIEWER_OFFSET_X_MAX = 8;
const PARALLAX_VIEWER_OFFSET_Y_MIN = -8;
const PARALLAX_VIEWER_OFFSET_Y_MAX = 16;
const PARALLAX_VIEWER_OFFSET_CAMERA_X = 0.42;
const PARALLAX_VIEWER_OFFSET_CAMERA_Y = 0.42;
const PARALLAX_VIEWER_OFFSET_DISTANCE_MIN = 0.34;
const PARALLAX_VIEWER_OFFSET_DISTANCE_MAX = 1.75;
const PARALLAX_VANISHING_POINT_VIEWER_SCALE = 8;
const PARALLAX_PLACEMENT_REACH_X_MAX_PERCENT = 140;
const PARALLAX_PLACEMENT_REACH_Y_MAX_PERCENT = 180;
const PARALLAX_FOCAL_LENGTH = 1.65;
const PARALLAX_FAR_Z = 4.8;
const PARALLAX_NEAR_Z = 1.35;
const PARALLAX_CAMERA_NEAR_CLIP_Z = 0.72;
const PARALLAX_SCALE_RESPONSE = 0.24;
const PARALLAX_SCALE_MIN = 0.68;
const PARALLAX_SCALE_MAX = 1.55;
const TANZAKU_COMBINED_SCALE_MAX = 1.9;
const TANZAKU_DEPTH_REFERENCE_NEUTRAL = 0.5;
const PERSPECTIVE_BOX_WALL_X_DEFAULT = -0.52;
const PERSPECTIVE_BOX_WALL_Y_DEFAULT = -0.05;
const PERSPECTIVE_BOX_WALL_MIN = -2;
const PERSPECTIVE_BOX_WALL_MAX = 2;
const BAMBOO_LEFT_X_DEFAULT = 5;
const BAMBOO_RIGHT_X_DEFAULT = 93;
const BAMBOO_Y_DEFAULT = 0;
const PERSPECTIVE_BOX_FRONT_DEPTH = TANZAKU_DEPTH_REFERENCE_NEUTRAL;
const PERSPECTIVE_BOX_BUILDING_DEPTH = -0.7;
const ORACLE_MOTION_SPEED_MIN = 0.2;
const ORACLE_MOTION_SPEED_MAX = 3;
const TANZAKU_DEPTH_VISUAL_GAIN = 3;
const TANZAKU_DEPTH_FAR_EXTENSION = 1.15;
const TANZAKU_DEPTH_NEAR_EXTENSION = 1.05;
const TANZAKU_DEPTH_VISUAL_MIN = -1.9;
const TANZAKU_DEPTH_VISUAL_MAX = 3.4;
const TYPE_INTERVAL_MIN_RATIO = 0.2;
const TYPE_LENGTH_SLOW_MAX = 40;
const TYPE_INTERVAL_CURVE = 2.2;
const LEAVE_ANIMATION_MS = 1100;
const METEOR_SHOWER_ACTIVE_MS = 17000;
const METEOR_SHOWER_FADE_MS = 2600;
const EFFECT_LEAVE_START_MS = 2600;
const EFFECT_BRIDGE_START_MS = 1200;
const EFFECT_BRIDGE_BUILD_MS = 7600;
const EFFECT_BRIDGE_HOLD_MS = 2000;
const EFFECT_BRIDGE_SCATTER_START_MS = EFFECT_BRIDGE_START_MS + EFFECT_BRIDGE_BUILD_MS + EFFECT_BRIDGE_HOLD_MS;
const EFFECT_LEAVE_STAGGER_MS = 260;
const METEOR_CYCLE_MS = 80000;
const METEOR_DELAYS_MS = [0, 26000, 52000];
const WIND_LEAD_MS = 3200;
const WIND_SWEEP_MS = 2200;
const WIND_DEPTH_STAGGER_MS = 700;
const WIND_GUST_MS = 2200;
const WIND_PIVOT = "50% -18vh";
const TANZAKU_DEPTH_REFLOW_MS = 720;
const TANZAKU_GLOW_MS = 3200;
const DEFAULT_MILKY_WAY_PROJECTION_GAIN = 1.75;
const LAYOUT_STORAGE_KEY = "tanabataProjectionLayout.v1";
const LAYOUT_PRESET_STORAGE_KEY = "tanabataProjectionLayoutPreset.v1";
const APPEARANCE_STORAGE_KEY = "tanabataProjectionAppearance.v1";
const DEFAULT_TANZAKU_BOUNDS = { width: 9, height: 42 };
const ORACLE_BOAT_BASE_WIDTH_PX = 72;
const ORACLE_BOAT_BASE_HEIGHT_PX = 28;
const ORACLE_CONTAINER_BOTTOM_PX = 8;
const ORACLE_CAMERA_BOTTOM_PX = 12;
const ORACLE_EDGE_PADDING_PX = 8;
const PLACEMENT_MIN_CANDIDATES = 96;
const PLACEMENT_CANDIDATE_RATIO = 6;
const PLACEMENT_COLUMNS = 10;
const PLACEMENT_ROWS = 8;
const PLACEMENT_PADDING_PERCENT = 1.4;
const PLACEMENT_EDGE_WEIGHT = 0.16;
const TANZAKU_MIN_VISIBLE_PERCENT = 2.5;
const TANZAKU_TILT_VALUES = [-7, -5.5, -4, -2.5, -1, 1.25, 2.75, 4.25, 5.75, 7.25];
const TANZAKU_RECENT_TILT_MEMORY = 5;
const TANZAKU_MIN_TILT_GAP = 1.8;

let savedLayout = loadSavedLayout();
const initiallyStoredLayoutIndexes = new Set(
  savedLayout
    .map((entry, index) => (
      typeof entry?.x === "number" && typeof entry?.y === "number" ? index : null
    ))
    .filter((index) => index !== null)
);
let projectionSettings = {
  displayCount: DEFAULT_DISPLAY_COUNT,
  slotCount: DEFAULT_SLOT_COUNT,
  moveCount: DEFAULT_MOVE_COUNT,
  typingIntervalMs: DEFAULT_TYPING_INTERVAL_MS,
  rotateIntervalMs: DEFAULT_ROTATE_INTERVAL_MS,
  tanzakuFontId: "mincho",
  colorEmojiFontEnabled: false,
  tanzakuAmbientSwayStrength: 0,
  milkyWayGain: DEFAULT_MILKY_WAY_PROJECTION_GAIN,
  milkyWayTwinkle: 1,
  milkyWaySparkle: 1,
  milkyWaySpeed: 1,
  milkyWayParticleCount: 340,
  milkyWaySparkleRatio: 0.045,
  milkyWaySparklePeriodVariance: 1,
  milkyWaySparkleIntensityVariance: 1,
  milkyWaySparklePeriodSeconds: 2.2,
  milkyWaySparkleDutyRatio: 0.16,
  milkyWaySeed: "tanabata-milky-way",
  tanabataStarResponseIntensity: 1,
  tanabataStarResponsePhaseDeg: 166,
  tanabataStarResponsePeriodSeconds: 35,
  tanzakuSwayStrength: 1,
  windGustStrength: 1,
  windGustCycleMs: 30000,
  windGustCycleJitterSeconds: 0,
  cloudCount: 3,
  cloudOriginY: 0,
  cloudSeed: "tanabata-clouds",
  experimentalParallaxEnabled: false,
  parallaxStrength: 1,
  parallaxMarkerEnabled: false,
  parallaxPopoutStrength: 0,
  parallaxDepthMultiplier: 1,
  parallaxDepthReferenceIndex: 1,
  parallaxMotionMode: "mapping",
  parallaxViewerOffsetX: 0,
  parallaxViewerOffsetY: 0,
  parallaxViewerDistance: 2.5,
  viewportMargin: 0
};

function getProjectionViewportMetrics() {
  const visualViewport = window.visualViewport;
  const width = Number.isFinite(visualViewport?.width) ? visualViewport.width : window.innerWidth;
  const height = Number.isFinite(visualViewport?.height) ? visualViewport.height : window.innerHeight;
  return {
    width: Math.max(1, width),
    height: Math.max(1, height)
  };
}

function getProjectionPlaneMetricsForMargin(margin) {
  const numericMargin = Number(margin);
  const safeMargin = Math.max(0, Math.min(24, Number.isFinite(numericMargin) ? numericMargin : 0));
  const viewport = getProjectionViewportMetrics();
  const marginPx = Math.min(viewport.width, viewport.height) * (safeMargin / 100);
  return {
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    marginPx,
    width: Math.max(1, viewport.width - (marginPx * 2)),
    height: Math.max(1, viewport.height - (marginPx * 2))
  };
}

function getVanishingPointLimitForMargin(margin, axis) {
  return axis === "y" ? 5 : 1;
}

function clampVanishingPointForMargin(value, margin, axis) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const max = getVanishingPointLimitForMargin(margin, axis);
  return Math.max(-1, Math.min(max, safeValue));
}

function vanishingPointToViewerScale(value, axis, margin = projectionSettings.viewportMargin) {
  const internalValue = clampVanishingPointForMargin(Number(value), margin, axis);
  return Number((internalValue * PARALLAX_VANISHING_POINT_VIEWER_SCALE).toFixed(2));
}

function viewerScaleToVanishingPoint(value, axis, margin = projectionSettings.viewportMargin) {
  const scaledValue = Number(value);
  if (!Number.isFinite(scaledValue)) return 0;
  return Number(clampVanishingPointForMargin(
    scaledValue / PARALLAX_VANISHING_POINT_VIEWER_SCALE,
    margin,
    axis
  ).toFixed(4));
}

let nextZOrder = 1;
let recentTanzakuTilts = [];
let slots = Array.from({ length: getSlotCount() }, (_, index) => createSlot(index));

let knownApprovedIds = new Set();
let initialSeeded = false;
let rotationStarted = false;
let rotationInProgress = false;
let rotationTimer = null;
let rotationTimerIntervalMs = null;
let pendingSlotDomOrderSync = false;
let windLoopStarted = false;
let windLoopTimers = [];
let nextRotationOrder = 1;
let backlog = [];
let activeDrag = null;
let activePerspectiveBoxDrag = null;
let currentWishes = [];
let latestEffectId = null;
let specialEffectInProgress = false;
let layoutMenuPointerToggled = false;
let projectionEventSource = null;
let projectionUpdateTimer = null;
let appliedProjectionSettingsSignature = "";
let latestServerProjectionSettings = null;
let renderedCloudSettingsSignature = "";
let approvedWishesSignature = "";
let currentOracleBoatScale = 1;
let currentOracleBoatBottomOffset = 0;
let currentAppearanceSettings = normalizeAppearanceSettings();

const effectsScene = createEffectsScene(effectsCanvas);
const webglEffectsScene = createWebglEffectsScene(webglEffectsCanvas);
const parallaxScene = createParallaxScene();

function loadSavedLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadAppearanceSettings() {
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return normalizeAppearanceSettings(parsed);
  } catch {
    return normalizeAppearanceSettings();
  }
}

function saveAppearanceSettings(settings) {
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures in private mode / kiosk restrictions.
  }
}

function normalizeAppearanceSettings(settings = {}) {
  const fallback = projectionSettings || {};
  const read = (key, defaultValue) => (
    Object.prototype.hasOwnProperty.call(settings, key) ? settings[key] : defaultValue
  );
  return {
    fontId: normalizeTanzakuFontId(settings.fontId),
    fontSize: normalizeTanzakuFontSize(settings.fontSize),
    oracleBoatSize: normalizeOracleBoatSize(settings.oracleBoatSize),
    oracleBoatOffset: normalizeOracleBoatOffset(settings.oracleBoatOffset),
    perspectiveBoxX: normalizePerspectiveBoxCoordinate(read("perspectiveBoxX", PERSPECTIVE_BOX_WALL_X_DEFAULT)),
    perspectiveBoxY: normalizePerspectiveBoxCoordinate(read("perspectiveBoxY", PERSPECTIVE_BOX_WALL_Y_DEFAULT)),
    bambooLeftX: normalizeBambooX(read("bambooLeftX", BAMBOO_LEFT_X_DEFAULT)),
    bambooLeftY: normalizeBambooY(read("bambooLeftY", BAMBOO_Y_DEFAULT)),
    bambooRightX: normalizeBambooX(read("bambooRightX", BAMBOO_RIGHT_X_DEFAULT)),
    bambooRightY: normalizeBambooY(read("bambooRightY", BAMBOO_Y_DEFAULT)),
    parallaxViewerOffsetX: normalizeParallaxViewerOffsetX(read("parallaxViewerOffsetX", fallback.parallaxViewerOffsetX ?? 0)),
    parallaxViewerOffsetY: normalizeParallaxViewerOffsetY(read("parallaxViewerOffsetY", fallback.parallaxViewerOffsetY ?? 0)),
    parallaxViewerDistance: normalizeParallaxViewerDistance(read("parallaxViewerDistance", fallback.parallaxViewerDistance ?? 2.5)),
    parallaxVanishingPointX: normalizeParallaxVanishingPoint(
      read("parallaxVanishingPointX", fallback.parallaxVanishingPointX ?? 0),
      "x"
    ),
    parallaxVanishingPointY: normalizeParallaxVanishingPoint(
      read("parallaxVanishingPointY", fallback.parallaxVanishingPointY ?? 0),
      "y"
    ),
    experimentalParallaxEnabled: read("experimentalParallaxEnabled", fallback.experimentalParallaxEnabled === true) === true,
    parallaxMarkerEnabled: read("parallaxMarkerEnabled", fallback.parallaxMarkerEnabled === true) === true,
    parallaxMotionMode: normalizeParallaxMotionMode(read("parallaxMotionMode", fallback.parallaxMotionMode ?? "mapping")),
    oracleMotionSpeed: normalizeOracleMotionSpeed(read("oracleMotionSpeed", 1)),
    oracleMotionDirection: normalizeOracleMotionDirection(read("oracleMotionDirection", "forward")),
    parallaxStrength: normalizeParallaxStrength(read("parallaxStrength", fallback.parallaxStrength ?? 1)),
    parallaxPopoutStrength: normalizeParallaxPopoutStrength(read("parallaxPopoutStrength", fallback.parallaxPopoutStrength ?? 0))
  };
}

function normalizeTanzakuFontId(value) {
  const id = String(value || "mincho");
  return tanzakuFontOptions.some((option) => option.id === id) ? id : "mincho";
}

function normalizeOracleBoatSize(value) {
  const size = Number(value);
  if (!Number.isFinite(size)) return 100;
  return Math.max(70, Math.min(160, Math.round(size / 5) * 5));
}

function normalizeOracleBoatOffset(value) {
  const offset = Number(value);
  if (!Number.isFinite(offset)) return 0;
  return Math.max(-60, Math.min(180, Math.round(offset / 5) * 5));
}

function normalizePerspectiveBoxCoordinate(value) {
  const coordinate = Number(value);
  if (!Number.isFinite(coordinate)) return 0;
  return Number(Math.max(PERSPECTIVE_BOX_WALL_MIN, Math.min(PERSPECTIVE_BOX_WALL_MAX, coordinate)).toFixed(2));
}

function normalizeBambooX(value) {
  const position = Number(value);
  if (!Number.isFinite(position)) return 0;
  return Number(position.toFixed(1));
}

function normalizeBambooY(value) {
  const offset = Number(value);
  if (!Number.isFinite(offset)) return 0;
  return Number(offset.toFixed(1));
}

function normalizeParallaxVanishingPoint(value, axis) {
  const point = Number(value);
  if (!Number.isFinite(point)) return 0;
  return Number(clampVanishingPointForMargin(point, projectionSettings.viewportMargin, axis).toFixed(4));
}

function normalizeParallaxViewerOffsetX(value) {
  const offset = Number(value);
  if (!Number.isFinite(offset)) return 0;
  return Number(Math.max(PARALLAX_VIEWER_OFFSET_X_MIN, Math.min(PARALLAX_VIEWER_OFFSET_X_MAX, offset)).toFixed(2));
}

function normalizeParallaxViewerOffsetY(value) {
  const offset = Number(value);
  if (!Number.isFinite(offset)) return 0;
  return Number(Math.max(PARALLAX_VIEWER_OFFSET_Y_MIN, Math.min(PARALLAX_VIEWER_OFFSET_Y_MAX, offset)).toFixed(2));
}

function normalizeParallaxViewerDistance(value) {
  const distance = Number(value);
  if (!Number.isFinite(distance)) return 2.5;
  return Number(Math.max(0.5, Math.min(PARALLAX_VIEWER_DISTANCE_MAX, distance)).toFixed(1));
}

function normalizeParallaxMotionMode(value) {
  const mode = String(value || "mapping");
  return ["display", "mapping", "camera", "camera-display"].includes(mode) ? mode : "mapping";
}

function normalizeOracleMotionSpeed(value) {
  const speed = Number(value);
  if (!Number.isFinite(speed)) return 1;
  return Number(Math.max(ORACLE_MOTION_SPEED_MIN, Math.min(ORACLE_MOTION_SPEED_MAX, speed)).toFixed(2));
}

function normalizeOracleMotionDirection(value) {
  return value === "reverse" ? "reverse" : "forward";
}

function normalizeParallaxStrength(value) {
  const strength = Number(value);
  if (!Number.isFinite(strength)) return 1;
  return Number(Math.max(0, Math.min(3, strength)).toFixed(2));
}

function normalizeParallaxPopoutStrength(value) {
  const strength = Number(value);
  if (!Number.isFinite(strength)) return 0;
  return Number(Math.max(0, Math.min(3, strength)).toFixed(2));
}

function normalizeTanzakuFontSize(value) {
  const size = Number(value);
  if (!Number.isFinite(size)) return 100;
  return Math.max(80, Math.min(140, Math.round(size / 5) * 5));
}

function normalizeTanzakuAmbientSwayStrength(value) {
  const strength = Number(value);
  if (!Number.isFinite(strength)) return 0;
  return Math.max(0, Math.min(3, strength));
}

function getTanzakuFontOption(fontId) {
  return tanzakuFontOptions.find((option) => option.id === fontId) || tanzakuFontOptions[0];
}

function getTanzakuFontFamily(font, colorEmojiFontEnabled) {
  if (!colorEmojiFontEnabled) return font.family;
  return `${font.family}, ${COLOR_EMOJI_FONT_FAMILY}`;
}

function applyLocalProjectionSettings(settings) {
  projectionSettings.parallaxViewerOffsetX = settings.parallaxViewerOffsetX;
  projectionSettings.parallaxViewerOffsetY = settings.parallaxViewerOffsetY;
  projectionSettings.parallaxViewerDistance = settings.parallaxViewerDistance;
  projectionSettings.parallaxVanishingPointX = settings.parallaxVanishingPointX;
  projectionSettings.parallaxVanishingPointY = settings.parallaxVanishingPointY;
  projectionSettings.experimentalParallaxEnabled = settings.experimentalParallaxEnabled;
  projectionSettings.parallaxMarkerEnabled = settings.parallaxMarkerEnabled;
  projectionSettings.parallaxMotionMode = settings.parallaxMotionMode;
  projectionSettings.parallaxStrength = settings.parallaxStrength;
  projectionSettings.parallaxPopoutStrength = settings.parallaxPopoutStrength;
}

function getServerBackedAppearanceDefaults() {
  const baseline = latestServerProjectionSettings || projectionSettings;
  return normalizeAppearanceSettings({
    fontId: baseline.tanzakuFontId,
    fontSize: 100,
    oracleBoatSize: 100,
    oracleBoatOffset: 0,
    perspectiveBoxX: PERSPECTIVE_BOX_WALL_X_DEFAULT,
    perspectiveBoxY: PERSPECTIVE_BOX_WALL_Y_DEFAULT,
    bambooLeftX: BAMBOO_LEFT_X_DEFAULT,
    bambooLeftY: BAMBOO_Y_DEFAULT,
    bambooRightX: BAMBOO_RIGHT_X_DEFAULT,
    bambooRightY: BAMBOO_Y_DEFAULT,
    parallaxViewerOffsetX: baseline.parallaxViewerOffsetX ?? 0,
    parallaxViewerOffsetY: baseline.parallaxViewerOffsetY ?? 0,
    parallaxViewerDistance: baseline.parallaxViewerDistance ?? 2.5,
    parallaxVanishingPointX: baseline.parallaxVanishingPointX ?? 0,
    parallaxVanishingPointY: baseline.parallaxVanishingPointY ?? 0,
    experimentalParallaxEnabled: baseline.experimentalParallaxEnabled === true,
    parallaxMarkerEnabled: baseline.parallaxMarkerEnabled === true,
    parallaxMotionMode: baseline.parallaxMotionMode ?? "mapping",
    oracleMotionSpeed: 1,
    oracleMotionDirection: "forward",
    parallaxStrength: baseline.parallaxStrength ?? 1,
    parallaxPopoutStrength: baseline.parallaxPopoutStrength ?? 0
  });
}

function syncParallaxSceneFromProjectionSettings(settings = loadAppearanceSettings()) {
  parallaxScene.setMotionMode(projectionSettings.parallaxMotionMode);
  parallaxScene.setStrength(projectionSettings.parallaxStrength);
  parallaxScene.setViewerGeometry(
    projectionSettings.parallaxViewerOffsetX,
    projectionSettings.parallaxViewerOffsetY,
    projectionSettings.parallaxViewerDistance
  );
  parallaxScene.setViewportMargin(projectionSettings.viewportMargin);
  parallaxScene.setVanishingPoint(
    projectionSettings.parallaxVanishingPointX,
    projectionSettings.parallaxVanishingPointY
  );
  parallaxScene.setPopoutStrength(projectionSettings.parallaxPopoutStrength);
  parallaxScene.setPerspectiveBoxPosition(settings.perspectiveBoxX, settings.perspectiveBoxY);
  parallaxScene.setMotionTiming(settings.oracleMotionSpeed, settings.oracleMotionDirection);
  parallaxScene.setMarkerEnabled(projectionSettings.parallaxMarkerEnabled);
  parallaxScene.setEnabled(projectionSettings.experimentalParallaxEnabled);
}

function ensureTanzakuFontStylesheet(fontId) {
  const href = tanzakuFontStylesheets[fontId];
  if (!href || loadedTanzakuFontStylesheets.has(fontId)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.tanzakuFont = fontId;
  link.addEventListener("error", () => {
    loadedTanzakuFontStylesheets.delete(fontId);
  }, { once: true });
  document.head.appendChild(link);
  loadedTanzakuFontStylesheets.add(fontId);
}

function applyAppearanceSettings(settings = loadAppearanceSettings()) {
  const normalizedSettings = normalizeAppearanceSettings(settings);
  currentAppearanceSettings = normalizedSettings;
  const fontId = normalizedSettings.fontId;
  const fontSize = normalizedSettings.fontSize;
  const oracleBoatSize = normalizedSettings.oracleBoatSize;
  const oracleBoatOffset = normalizedSettings.oracleBoatOffset;
  const font = getTanzakuFontOption(fontId);
  const colorEmojiFontEnabled = projectionSettings.colorEmojiFontEnabled === true;
  const fontFamily = getTanzakuFontFamily(font, colorEmojiFontEnabled);

  ensureTanzakuFontStylesheet(fontId);
  if (colorEmojiFontEnabled) {
    ensureTanzakuFontStylesheet("emoji");
  }
  document.documentElement.style.setProperty("--tanzaku-font-family", fontFamily);
  document.documentElement.style.setProperty("--projection-tanzaku-font-family", fontFamily);
  document.documentElement.style.setProperty("--projection-layout-font-family", fontFamily);
  document.documentElement.style.setProperty("--projection-tanzaku-font-scale", (fontSize / 100).toFixed(2));
  currentOracleBoatScale = oracleBoatSize / 100;
  currentOracleBoatBottomOffset = oracleBoatOffset;
  projectionStage.style.setProperty("--oracle-boat-size", (oracleBoatSize / 100).toFixed(2));
  projectionStage.style.setProperty("--oracle-boat-bottom-offset", `${oracleBoatOffset}px`);
  projectionStage.style.setProperty("--bamboo-left-x", normalizedSettings.bambooLeftX.toFixed(1));
  projectionStage.style.setProperty("--bamboo-left-y", `${normalizedSettings.bambooLeftY.toFixed(1)}vh`);
  projectionStage.style.setProperty("--bamboo-right-x", normalizedSettings.bambooRightX.toFixed(1));
  projectionStage.style.setProperty("--bamboo-right-y", `${normalizedSettings.bambooRightY.toFixed(1)}vh`);
  applyLocalProjectionSettings(normalizedSettings);
  syncParallaxSceneFromProjectionSettings(normalizedSettings);

  if (tanzakuFontSelect) {
    tanzakuFontSelect.value = fontId;
  }
  if (tanzakuFontSizeInput) {
    tanzakuFontSizeInput.value = String(fontSize);
  }
  if (tanzakuFontSizeValue) {
    tanzakuFontSizeValue.textContent = `${fontSize}%`;
  }
  if (oracleBoatSizeInput) {
    oracleBoatSizeInput.value = String(oracleBoatSize);
  }
  if (oracleBoatSizeValue) {
    oracleBoatSizeValue.textContent = `${oracleBoatSize}%`;
  }
  if (oracleBoatOffsetInput) {
    oracleBoatOffsetInput.value = String(oracleBoatOffset);
  }
  if (oracleBoatOffsetValue) {
    oracleBoatOffsetValue.textContent = `${oracleBoatOffset}px`;
  }
  if (perspectiveBoxXInput) {
    perspectiveBoxXInput.value = String(normalizedSettings.perspectiveBoxX);
  }
  if (perspectiveBoxXValue) {
    perspectiveBoxXValue.textContent = normalizedSettings.perspectiveBoxX.toFixed(2);
  }
  if (perspectiveBoxYInput) {
    perspectiveBoxYInput.value = String(normalizedSettings.perspectiveBoxY);
  }
  if (perspectiveBoxYValue) {
    perspectiveBoxYValue.textContent = normalizedSettings.perspectiveBoxY.toFixed(2);
  }
  if (bambooLeftXInput) {
    bambooLeftXInput.value = String(normalizedSettings.bambooLeftX);
  }
  if (bambooLeftXValue) {
    bambooLeftXValue.textContent = normalizedSettings.bambooLeftX.toFixed(1);
  }
  if (bambooLeftYInput) {
    bambooLeftYInput.value = String(normalizedSettings.bambooLeftY);
  }
  if (bambooLeftYValue) {
    bambooLeftYValue.textContent = normalizedSettings.bambooLeftY.toFixed(1);
  }
  if (bambooRightXInput) {
    bambooRightXInput.value = String(normalizedSettings.bambooRightX);
  }
  if (bambooRightXValue) {
    bambooRightXValue.textContent = normalizedSettings.bambooRightX.toFixed(1);
  }
  if (bambooRightYInput) {
    bambooRightYInput.value = String(normalizedSettings.bambooRightY);
  }
  if (bambooRightYValue) {
    bambooRightYValue.textContent = normalizedSettings.bambooRightY.toFixed(1);
  }
  if (layoutParallaxViewerXInput) {
    layoutParallaxViewerXInput.value = String(normalizedSettings.parallaxViewerOffsetX);
  }
  if (layoutParallaxViewerXValue) {
    layoutParallaxViewerXValue.textContent = normalizedSettings.parallaxViewerOffsetX.toFixed(2);
  }
  if (layoutParallaxViewerYInput) {
    layoutParallaxViewerYInput.value = String(normalizedSettings.parallaxViewerOffsetY);
  }
  if (layoutParallaxViewerYValue) {
    layoutParallaxViewerYValue.textContent = normalizedSettings.parallaxViewerOffsetY.toFixed(2);
  }
  if (layoutParallaxViewerZInput) {
    layoutParallaxViewerZInput.value = String(normalizedSettings.parallaxViewerDistance);
  }
  if (layoutParallaxViewerZValue) {
    layoutParallaxViewerZValue.textContent = normalizedSettings.parallaxViewerDistance.toFixed(1);
  }
  const vanishingPointX = vanishingPointToViewerScale(normalizedSettings.parallaxVanishingPointX, "x");
  const vanishingPointY = vanishingPointToViewerScale(normalizedSettings.parallaxVanishingPointY, "y");
  if (layoutParallaxVanishingXInput) {
    layoutParallaxVanishingXInput.value = String(vanishingPointX);
  }
  if (layoutParallaxVanishingXValue) {
    layoutParallaxVanishingXValue.textContent = vanishingPointX.toFixed(2);
  }
  if (layoutParallaxVanishingYInput) {
    layoutParallaxVanishingYInput.value = String(vanishingPointY);
  }
  if (layoutParallaxVanishingYValue) {
    layoutParallaxVanishingYValue.textContent = vanishingPointY.toFixed(2);
  }
  if (layoutParallaxEnabledInput) {
    layoutParallaxEnabledInput.checked = normalizedSettings.experimentalParallaxEnabled;
  }
  if (layoutParallaxMarkerEnabledInput) {
    layoutParallaxMarkerEnabledInput.checked = normalizedSettings.parallaxMarkerEnabled;
    layoutParallaxMarkerEnabledInput.disabled = !normalizedSettings.experimentalParallaxEnabled;
  }
  if (layoutParallaxMotionModeInput) {
    layoutParallaxMotionModeInput.value = normalizedSettings.parallaxMotionMode;
  }
  if (layoutOracleMotionSpeedInput) {
    layoutOracleMotionSpeedInput.value = String(normalizedSettings.oracleMotionSpeed);
  }
  if (layoutOracleMotionSpeedValue) {
    layoutOracleMotionSpeedValue.textContent = normalizedSettings.oracleMotionSpeed.toFixed(2);
  }
  if (layoutOracleMotionDirectionInput) {
    layoutOracleMotionDirectionInput.value = normalizedSettings.oracleMotionDirection;
  }
  if (layoutParallaxStrengthInput) {
    layoutParallaxStrengthInput.value = String(normalizedSettings.parallaxStrength);
  }
  if (layoutParallaxStrengthValue) {
    layoutParallaxStrengthValue.textContent = normalizedSettings.parallaxStrength.toFixed(2);
  }
  if (layoutParallaxPopoutInput) {
    layoutParallaxPopoutInput.value = String(normalizedSettings.parallaxPopoutStrength);
  }
  if (layoutParallaxPopoutValue) {
    layoutParallaxPopoutValue.textContent = normalizedSettings.parallaxPopoutStrength.toFixed(2);
  }
}

function syncAppearanceSettingsFromControls() {
  const nextSettings = normalizeAppearanceSettings({
    fontId: normalizeTanzakuFontId(tanzakuFontSelect?.value),
    fontSize: normalizeTanzakuFontSize(tanzakuFontSizeInput?.value),
    oracleBoatSize: normalizeOracleBoatSize(oracleBoatSizeInput?.value),
    oracleBoatOffset: normalizeOracleBoatOffset(oracleBoatOffsetInput?.value),
    perspectiveBoxX: normalizePerspectiveBoxCoordinate(perspectiveBoxXInput?.value),
    perspectiveBoxY: normalizePerspectiveBoxCoordinate(perspectiveBoxYInput?.value),
    bambooLeftX: normalizeBambooX(bambooLeftXInput?.value),
    bambooLeftY: normalizeBambooY(bambooLeftYInput?.value),
    bambooRightX: normalizeBambooX(bambooRightXInput?.value),
    bambooRightY: normalizeBambooY(bambooRightYInput?.value),
    parallaxViewerOffsetX: normalizeParallaxViewerOffsetX(layoutParallaxViewerXInput?.value),
    parallaxViewerOffsetY: normalizeParallaxViewerOffsetY(layoutParallaxViewerYInput?.value),
    parallaxViewerDistance: normalizeParallaxViewerDistance(layoutParallaxViewerZInput?.value),
    parallaxVanishingPointX: viewerScaleToVanishingPoint(layoutParallaxVanishingXInput?.value, "x"),
    parallaxVanishingPointY: viewerScaleToVanishingPoint(layoutParallaxVanishingYInput?.value, "y"),
    experimentalParallaxEnabled: layoutParallaxEnabledInput?.checked === true,
    parallaxMarkerEnabled: layoutParallaxMarkerEnabledInput?.checked === true,
    parallaxMotionMode: normalizeParallaxMotionMode(layoutParallaxMotionModeInput?.value),
    oracleMotionSpeed: normalizeOracleMotionSpeed(layoutOracleMotionSpeedInput?.value),
    oracleMotionDirection: normalizeOracleMotionDirection(layoutOracleMotionDirectionInput?.value),
    parallaxStrength: normalizeParallaxStrength(layoutParallaxStrengthInput?.value),
    parallaxPopoutStrength: normalizeParallaxPopoutStrength(layoutParallaxPopoutInput?.value)
  });
  applyAppearanceSettings(nextSettings);
  saveAppearanceSettings(nextSettings);
  slots.forEach((slot) => syncSlotRenderPosition(slot, { force: true }));
}

function setupAppearanceControls() {
  if (tanzakuFontSelect && !tanzakuFontSelect.options.length) {
    for (const option of tanzakuFontOptions) {
      const element = document.createElement("option");
      element.value = option.id;
      element.textContent = option.label;
      tanzakuFontSelect.append(element);
    }
    tanzakuFontSelect.addEventListener("change", syncAppearanceSettingsFromControls);
  }

  if (oracleBoatSizeInput) {
    oracleBoatSizeInput.addEventListener("input", syncAppearanceSettingsFromControls);
    oracleBoatSizeInput.addEventListener("change", syncAppearanceSettingsFromControls);
  }

  if (oracleBoatOffsetInput) {
    oracleBoatOffsetInput.addEventListener("input", syncAppearanceSettingsFromControls);
    oracleBoatOffsetInput.addEventListener("change", syncAppearanceSettingsFromControls);
  }

  if (tanzakuFontSizeInput) {
    tanzakuFontSizeInput.addEventListener("input", syncAppearanceSettingsFromControls);
    tanzakuFontSizeInput.addEventListener("change", syncAppearanceSettingsFromControls);
  }

  [
    perspectiveBoxXInput,
    perspectiveBoxYInput,
    bambooLeftXInput,
    bambooLeftYInput,
    bambooRightXInput,
    bambooRightYInput,
    layoutParallaxViewerXInput,
    layoutParallaxViewerYInput,
    layoutParallaxViewerZInput,
    layoutParallaxVanishingXInput,
    layoutParallaxVanishingYInput,
    layoutOracleMotionSpeedInput,
    layoutParallaxStrengthInput,
    layoutParallaxPopoutInput
  ].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", syncAppearanceSettingsFromControls);
    input.addEventListener("change", syncAppearanceSettingsFromControls);
  });

  [
    layoutParallaxMotionModeInput,
    layoutOracleMotionDirectionInput,
    layoutParallaxEnabledInput,
    layoutParallaxMarkerEnabledInput
  ].forEach((select) => {
    if (!select) return;
    select.addEventListener("change", syncAppearanceSettingsFromControls);
  });

  applyAppearanceSettings();
}

function getCurrentLayout() {
  return slots.map((slot) => ({
    x: Number(slot.meta.x),
    y: Number(slot.meta.y)
  }));
}

function getCurrentLayoutPreset() {
  return slots.map((slot) => ({
    x: Number(slot.meta.x),
    y: Number(slot.meta.y),
    z: Number(slot.meta.z)
  }));
}

function getCurrentAppearanceSettings() {
  return normalizeAppearanceSettings({
    fontId: tanzakuFontSelect?.value,
    fontSize: tanzakuFontSizeInput?.value,
    oracleBoatSize: oracleBoatSizeInput?.value,
    oracleBoatOffset: oracleBoatOffsetInput?.value,
    perspectiveBoxX: perspectiveBoxXInput?.value,
    perspectiveBoxY: perspectiveBoxYInput?.value,
    bambooLeftX: bambooLeftXInput?.value,
    bambooLeftY: bambooLeftYInput?.value,
    bambooRightX: bambooRightXInput?.value,
    bambooRightY: bambooRightYInput?.value,
    parallaxViewerOffsetX: layoutParallaxViewerXInput?.value,
    parallaxViewerOffsetY: layoutParallaxViewerYInput?.value,
    parallaxViewerDistance: layoutParallaxViewerZInput?.value,
    parallaxVanishingPointX: viewerScaleToVanishingPoint(layoutParallaxVanishingXInput?.value, "x"),
    parallaxVanishingPointY: viewerScaleToVanishingPoint(layoutParallaxVanishingYInput?.value, "y"),
    experimentalParallaxEnabled: layoutParallaxEnabledInput?.checked === true,
    parallaxMarkerEnabled: layoutParallaxMarkerEnabledInput?.checked === true,
    parallaxMotionMode: layoutParallaxMotionModeInput?.value,
    oracleMotionSpeed: layoutOracleMotionSpeedInput?.value,
    oracleMotionDirection: layoutOracleMotionDirectionInput?.value,
    parallaxStrength: layoutParallaxStrengthInput?.value,
    parallaxPopoutStrength: layoutParallaxPopoutInput?.value
  });
}

function saveLayout() {
  try {
    savedLayout = getCurrentLayout();
    localStorage.setItem(
      LAYOUT_STORAGE_KEY,
      JSON.stringify(savedLayout)
    );
  } catch {
    // Ignore storage failures in private mode / kiosk restrictions.
  }
}

function loadLayoutPreset() {
  try {
    const raw = localStorage.getItem(LAYOUT_PRESET_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.layout)) {
      return null;
    }
    return {
      ...parsed,
      appearance: parsed.appearance ? normalizeAppearanceSettings(parsed.appearance) : null
    };
  } catch {
    return null;
  }
}

function formatLayoutPresetDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function updateLayoutMenuState(message = "") {
  if (!layoutMenuState || !layoutLoadButton) return;

  const preset = loadLayoutPreset();
  layoutLoadButton.disabled = !preset;
  if (message) {
    layoutMenuState.textContent = message;
    return;
  }

  layoutMenuState.textContent = preset
    ? `保存済み ${formatLayoutPresetDate(preset.savedAt)} / ${preset.layout.length}スロット / ${preset.layout.length > 0 && preset.layout.every((entry) => typeof entry?.z === "number") ? "XYZ" : "XY"} / ${preset.appearance ? "調整あり" : "配置のみ"}`
    : "保存なし";
}

function saveLayoutPreset() {
  try {
    const preset = {
      savedAt: new Date().toISOString(),
      slotCount: getSlotCount(),
      layout: getCurrentLayoutPreset(),
      appearance: getCurrentAppearanceSettings()
    };
    localStorage.setItem(LAYOUT_PRESET_STORAGE_KEY, JSON.stringify(preset));
    updateLayoutMenuState("配置と調整を保存しました");
  } catch {
    updateLayoutMenuState("保存できませんでした");
  }
}

function clearLayoutPresetValues() {
  try {
    localStorage.removeItem(LAYOUT_PRESET_STORAGE_KEY);
    localStorage.removeItem(APPEARANCE_STORAGE_KEY);
    applyAppearanceSettings(getServerBackedAppearanceDefaults());
    updateLayoutMenuState("保存値をクリアしました");
  } catch {
    updateLayoutMenuState("保存値をクリアできませんでした");
  }
}

function isFullscreenActive() {
  return document.fullscreenElement === projectionStage || document.fullscreenElement === document.documentElement;
}

function updateFullscreenButton() {
  if (!layoutFullscreenButton) return;
  const fullscreenSupported = Boolean(document.fullscreenEnabled && projectionStage?.requestFullscreen);
  layoutFullscreenButton.disabled = !fullscreenSupported;
  layoutFullscreenButton.textContent = isFullscreenActive() ? "全画面解除" : "全画面";
}

async function toggleProjectionFullscreen() {
  if (!layoutFullscreenButton || !projectionStage?.requestFullscreen) return;
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
    } else {
      await projectionStage.requestFullscreen();
    }
    updateFullscreenButton();
  } catch {
    updateLayoutMenuState("全画面に切り替えできませんでした");
  }
}

function applyLayoutPreset() {
  const preset = loadLayoutPreset();
  if (!preset) {
    updateLayoutMenuState("保存配置がありません");
    return;
  }

  let appliedCount = 0;
  let maxZOrder = nextZOrder;
  preset.layout.forEach((entry, index) => {
    const slot = slots[index];
    if (!slot || typeof entry?.x !== "number" || typeof entry?.y !== "number") return;
    updateSlotPosition(slot, entry.x, entry.y, { persist: false });
    if (typeof entry.z === "number" && Number.isFinite(entry.z)) {
      slot.meta.z = entry.z;
      maxZOrder = Math.max(maxZOrder, entry.z + 1);
    }
    appliedCount += 1;
  });
  nextZOrder = Math.max(nextZOrder, maxZOrder);
  syncSlotDomOrder();
  if (preset.appearance) {
    applyAppearanceSettings(preset.appearance);
    saveAppearanceSettings(preset.appearance);
  }
  saveLayout();
  updateLayoutMenuState(`${appliedCount}スロットの配置と調整を呼び出しました`);
}

function setLayoutMenuOpen(open) {
  if (!layoutMenu || !layoutMenuTrigger) return;
  layoutMenu.classList.toggle("is-open", open);
  layoutMenu.setAttribute("aria-hidden", open ? "false" : "true");
  layoutMenuTrigger.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    updateLayoutMenuState();
  }
}

function isLayoutMenuOpen() {
  return Boolean(layoutMenu?.classList.contains("is-open"));
}

function scheduleLayoutMenuToggle() {
  if (!layoutMenu) return;
  const nextOpen = !isLayoutMenuOpen();
  window.setTimeout(() => setLayoutMenuOpen(nextOpen), 0);
}

function getSlotCount() {
  return projectionSettings.slotCount;
}

function normalizeProjectionSettings(settings = {}) {
  const slotCount = Number(settings.projectionSlotCount);
  const nextSlotCount = Number.isInteger(slotCount) && slotCount > 0 ? slotCount : DEFAULT_SLOT_COUNT;
  const displayCount = Number(settings.projectionDisplayCount);
  const nextDisplayCount = Number.isInteger(displayCount) && displayCount > 0
    ? Math.min(displayCount, nextSlotCount)
    : Math.min(DEFAULT_DISPLAY_COUNT, nextSlotCount);
  const moveCount = Number(settings.projectionMoveCount);
  const nextMoveCount = Number.isInteger(moveCount) && moveCount > 0 ? moveCount : DEFAULT_MOVE_COUNT;
  const typingIntervalMs = Number(settings.projectionTypingIntervalMs);
  const nextTypingIntervalMs = Number.isInteger(typingIntervalMs) && typingIntervalMs > 0 ? typingIntervalMs : DEFAULT_TYPING_INTERVAL_MS;
  const rotateIntervalMs = Number(settings.projectionRotateIntervalMs);
  const nextRotateIntervalMs = Number.isInteger(rotateIntervalMs) && rotateIntervalMs > 0 ? rotateIntervalMs : DEFAULT_ROTATE_INTERVAL_MS;
  const tanzakuFontId = normalizeTanzakuFontId(settings.projectionTanzakuFontId);
  const colorEmojiFontEnabled = settings.projectionColorEmojiFontEnabled === true;
  const milkyWayGain = Number(settings.projectionMilkyWayGain);
  const nextMilkyWayGain = Number.isFinite(milkyWayGain) && milkyWayGain > 0 ? milkyWayGain : DEFAULT_MILKY_WAY_PROJECTION_GAIN;
  const milkyWayTwinkle = Number(settings.projectionMilkyWayTwinkle);
  const nextMilkyWayTwinkle = Number.isFinite(milkyWayTwinkle) ? Math.max(0, Math.min(2.5, milkyWayTwinkle)) : 1;
  const milkyWaySparkle = Number(settings.projectionMilkyWaySparkle);
  const nextMilkyWaySparkle = Number.isFinite(milkyWaySparkle) ? Math.max(0, Math.min(2.5, milkyWaySparkle)) : 1;
  const milkyWaySpeed = Number(settings.projectionMilkyWaySpeed);
  const nextMilkyWaySpeed = Number.isFinite(milkyWaySpeed) ? Math.max(0.2, Math.min(2.5, milkyWaySpeed)) : 1;
  const milkyWayParticleCount = Number(settings.projectionMilkyWayParticleCount);
  const nextMilkyWayParticleCount = Number.isInteger(milkyWayParticleCount)
    ? Math.max(80, Math.min(720, milkyWayParticleCount))
    : 340;
  const milkyWaySparkleRatio = Number(settings.projectionMilkyWaySparkleRatio);
  const nextMilkyWaySparkleRatio = Number.isFinite(milkyWaySparkleRatio)
    ? Math.max(0, Math.min(0.25, milkyWaySparkleRatio))
    : 0.045;
  const milkyWaySparklePeriodVariance = Number(settings.projectionMilkyWaySparklePeriodVariance);
  const nextMilkyWaySparklePeriodVariance = Number.isFinite(milkyWaySparklePeriodVariance)
    ? Math.max(0, Math.min(2.5, milkyWaySparklePeriodVariance))
    : 1;
  const milkyWaySparkleIntensityVariance = Number(settings.projectionMilkyWaySparkleIntensityVariance);
  const nextMilkyWaySparkleIntensityVariance = Number.isFinite(milkyWaySparkleIntensityVariance)
    ? Math.max(0, Math.min(2.5, milkyWaySparkleIntensityVariance))
    : 1;
  const milkyWaySparklePeriodSeconds = Number(settings.projectionMilkyWaySparklePeriodSeconds);
  const nextMilkyWaySparklePeriodSeconds = Number.isFinite(milkyWaySparklePeriodSeconds)
    ? Math.max(0.5, Math.min(8, milkyWaySparklePeriodSeconds))
    : 2.2;
  const milkyWaySparkleDutyRatio = Number(settings.projectionMilkyWaySparkleDutyRatio);
  const nextMilkyWaySparkleDutyRatio = Number.isFinite(milkyWaySparkleDutyRatio)
    ? Math.max(0.03, Math.min(0.8, milkyWaySparkleDutyRatio))
    : 0.16;
  const milkyWaySeed = String(settings.projectionMilkyWaySeed || "tanabata-milky-way").slice(0, 80);
  const tanabataStarResponseIntensity = Number(settings.projectionTanabataStarResponseIntensity);
  const nextTanabataStarResponseIntensity = Number.isFinite(tanabataStarResponseIntensity)
    ? Math.max(0, Math.min(3, tanabataStarResponseIntensity))
    : 1;
  const tanabataStarResponsePhaseDeg = Number(settings.projectionTanabataStarResponsePhaseDeg);
  const nextTanabataStarResponsePhaseDeg = Number.isFinite(tanabataStarResponsePhaseDeg)
    ? Math.max(0, Math.min(360, tanabataStarResponsePhaseDeg))
    : 166;
  const tanabataStarResponsePeriodSeconds = Number(settings.projectionTanabataStarResponsePeriodSeconds);
  const nextTanabataStarResponsePeriodSeconds = Number.isFinite(tanabataStarResponsePeriodSeconds)
    ? Math.max(8, Math.min(90, tanabataStarResponsePeriodSeconds))
    : 35;
  const tanzakuSwayStrength = Number(settings.projectionTanzakuSwayStrength);
  const nextTanzakuSwayStrength = Number.isFinite(tanzakuSwayStrength)
    ? Math.max(0, Math.min(3, tanzakuSwayStrength))
    : 1;
  const tanzakuAmbientSwayStrength = Number(settings.projectionTanzakuAmbientSwayStrength);
  const nextTanzakuAmbientSwayStrength = normalizeTanzakuAmbientSwayStrength(tanzakuAmbientSwayStrength);
  const windGustStrength = Number(settings.projectionWindGustStrength);
  const nextWindGustStrength = Number.isFinite(windGustStrength)
    ? Math.max(0, Math.min(3, windGustStrength))
    : 1;
  const windGustCycleMs = Number(settings.projectionWindGustCycleMs);
  const nextWindGustCycleMs = Number.isInteger(windGustCycleMs)
    ? Math.max(3000, Math.min(60000, windGustCycleMs))
    : 30000;
  const windGustCycleJitterSeconds = Number(settings.projectionWindGustCycleJitterSeconds);
  const nextWindGustCycleJitterSeconds = Number.isInteger(windGustCycleJitterSeconds)
    ? Math.max(0, Math.min(60, windGustCycleJitterSeconds))
    : 0;
  const cloudCount = Number(settings.projectionCloudCount);
  const nextCloudCount = Number.isInteger(cloudCount) ? Math.max(0, Math.min(12, cloudCount)) : 3;
  const cloudOriginY = Number(settings.projectionCloudOriginY);
  const nextCloudOriginY = Number.isFinite(cloudOriginY) && cloudOriginY >= -1 && cloudOriginY <= 1 ? cloudOriginY : 0;
  const cloudSeed = String(settings.projectionCloudSeed || "tanabata-clouds").slice(0, 80);
  const experimentalParallaxEnabled = settings.projectionExperimentalParallaxEnabled === true;
  const parallaxStrength = Number(settings.projectionParallaxStrength);
  const nextParallaxStrength = Number.isFinite(parallaxStrength)
    ? Math.max(0, Math.min(3, parallaxStrength))
    : 1;
  const viewportMargin = Number(settings.projectionViewportMargin);
  const nextViewportMargin = Number.isFinite(viewportMargin)
    ? Math.max(0, Math.min(24, viewportMargin))
    : 0;
  const parallaxVanishingPointX = Number(settings.projectionParallaxVanishingPointX);
  const nextParallaxVanishingPointX = Number.isFinite(parallaxVanishingPointX)
    ? clampVanishingPointForMargin(parallaxVanishingPointX, nextViewportMargin, "x")
    : 0;
  const parallaxVanishingPointY = Number(settings.projectionParallaxVanishingPointY);
  const nextParallaxVanishingPointY = Number.isFinite(parallaxVanishingPointY)
    ? clampVanishingPointForMargin(parallaxVanishingPointY, nextViewportMargin, "y")
    : 0;
  const parallaxMarkerEnabled = settings.projectionParallaxMarkerEnabled === true;
  const parallaxPopoutStrength = Number(settings.projectionParallaxPopoutStrength);
  const nextParallaxPopoutStrength = Number.isFinite(parallaxPopoutStrength)
    ? Math.max(0, Math.min(3, parallaxPopoutStrength))
    : 0;
  const parallaxMotionMode = ["display", "mapping", "camera", "camera-display"].includes(settings.projectionParallaxMotionMode)
    ? settings.projectionParallaxMotionMode
    : "mapping";
  const parallaxViewerOffsetX = Number(settings.projectionParallaxViewerOffsetX);
  const nextParallaxViewerOffsetX = Number.isFinite(parallaxViewerOffsetX)
    ? Math.max(PARALLAX_VIEWER_OFFSET_X_MIN, Math.min(PARALLAX_VIEWER_OFFSET_X_MAX, parallaxViewerOffsetX))
    : 0;
  const parallaxViewerOffsetY = Number(settings.projectionParallaxViewerOffsetY);
  const nextParallaxViewerOffsetY = Number.isFinite(parallaxViewerOffsetY)
    ? Math.max(PARALLAX_VIEWER_OFFSET_Y_MIN, Math.min(PARALLAX_VIEWER_OFFSET_Y_MAX, parallaxViewerOffsetY))
    : 0;
  const parallaxViewerDistance = Number(settings.projectionParallaxViewerDistance);
  const nextParallaxViewerDistance = Number.isFinite(parallaxViewerDistance)
    ? Math.max(0.5, Math.min(PARALLAX_VIEWER_DISTANCE_MAX, parallaxViewerDistance))
    : 2.5;
  const parallaxDepthMultiplier = Number(settings.projectionParallaxDepthMultiplier);
  const nextParallaxDepthMultiplier = Number.isFinite(parallaxDepthMultiplier)
    ? Math.max(0, Math.min(3, parallaxDepthMultiplier))
    : 1;
  const parallaxDepthReferenceIndex = Number(settings.projectionParallaxDepthReferenceIndex);
  const nextParallaxDepthReferenceIndex = Number.isInteger(parallaxDepthReferenceIndex)
    ? Math.max(1, Math.min(60, parallaxDepthReferenceIndex))
    : 1;

  return {
    displayCount: nextDisplayCount,
    slotCount: nextSlotCount,
    moveCount: Math.min(nextMoveCount, nextDisplayCount),
    typingIntervalMs: nextTypingIntervalMs,
    rotateIntervalMs: nextRotateIntervalMs,
    tanzakuFontId,
    colorEmojiFontEnabled,
    milkyWayGain: nextMilkyWayGain,
    milkyWayTwinkle: nextMilkyWayTwinkle,
    milkyWaySparkle: nextMilkyWaySparkle,
    milkyWaySpeed: nextMilkyWaySpeed,
    milkyWayParticleCount: nextMilkyWayParticleCount,
    milkyWaySparkleRatio: nextMilkyWaySparkleRatio,
    milkyWaySparklePeriodVariance: nextMilkyWaySparklePeriodVariance,
    milkyWaySparkleIntensityVariance: nextMilkyWaySparkleIntensityVariance,
    milkyWaySparklePeriodSeconds: nextMilkyWaySparklePeriodSeconds,
    milkyWaySparkleDutyRatio: nextMilkyWaySparkleDutyRatio,
    milkyWaySeed,
    tanabataStarResponseIntensity: nextTanabataStarResponseIntensity,
    tanabataStarResponsePhaseDeg: nextTanabataStarResponsePhaseDeg,
    tanabataStarResponsePeriodSeconds: nextTanabataStarResponsePeriodSeconds,
    tanzakuSwayStrength: nextTanzakuSwayStrength,
    tanzakuAmbientSwayStrength: nextTanzakuAmbientSwayStrength,
    windGustStrength: nextWindGustStrength,
    windGustCycleMs: nextWindGustCycleMs,
    windGustCycleJitterSeconds: nextWindGustCycleJitterSeconds,
    cloudCount: nextCloudCount,
    cloudOriginY: nextCloudOriginY,
    cloudSeed,
    experimentalParallaxEnabled,
    parallaxStrength: nextParallaxStrength,
    parallaxVanishingPointX: nextParallaxVanishingPointX,
    parallaxVanishingPointY: nextParallaxVanishingPointY,
    parallaxMarkerEnabled,
    parallaxPopoutStrength: nextParallaxPopoutStrength,
    parallaxMotionMode,
    parallaxViewerOffsetX: nextParallaxViewerOffsetX,
    parallaxViewerOffsetY: nextParallaxViewerOffsetY,
    parallaxViewerDistance: nextParallaxViewerDistance,
    parallaxDepthMultiplier: nextParallaxDepthMultiplier,
    parallaxDepthReferenceIndex: nextParallaxDepthReferenceIndex,
    viewportMargin: nextViewportMargin
  };
}

function setStylePropertyIfChanged(element, propertyName, value) {
  if (!element) return;
  if (element.style.getPropertyValue(propertyName) === value) return;
  element.style.setProperty(propertyName, value);
}

function setAttributeIfChanged(element, attributeName, value) {
  if (!element) return;
  if (element.getAttribute(attributeName) === value) return;
  element.setAttribute(attributeName, value);
}

function quantizePixel(value) {
  return Math.round(value / PARALLAX_PIXEL_STEP) * PARALLAX_PIXEL_STEP;
}

function formatPixel(value) {
  return `${quantizePixel(value).toFixed(1)}px`;
}

function formatScale(value) {
  return (Math.round(value / PARALLAX_SCALE_STEP) * PARALLAX_SCALE_STEP).toFixed(3);
}

function hashTextToUint32(text) {
  let hash = 2166136261;
  const source = String(text || "tanabata");
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function formatTilt(value) {
  return `${Number(value).toFixed(2).replace(/\.?0+$/, "")}deg`;
}

function pickTanzakuTilt(seedText) {
  const seed = hashTextToUint32(seedText);
  const startIndex = seed % TANZAKU_TILT_VALUES.length;
  let selected = TANZAKU_TILT_VALUES[startIndex];

  for (let offset = 0; offset < TANZAKU_TILT_VALUES.length; offset += 1) {
    const candidate = TANZAKU_TILT_VALUES[(startIndex + offset * 3) % TANZAKU_TILT_VALUES.length];
    const tooClose = recentTanzakuTilts.some((tilt) => Math.abs(tilt - candidate) < TANZAKU_MIN_TILT_GAP);
    if (!tooClose) {
      selected = candidate;
      break;
    }
  }

  recentTanzakuTilts.push(selected);
  if (recentTanzakuTilts.length > TANZAKU_RECENT_TILT_MEMORY) {
    recentTanzakuTilts = recentTanzakuTilts.slice(-TANZAKU_RECENT_TILT_MEMORY);
  }
  return formatTilt(selected);
}

function setSlotTilt(slot, wish, salt = "") {
  if (!slot) return;
  const wishKey = wish?.id || wish?.text || "empty";
  slot.meta.tilt = pickTanzakuTilt(`${wishKey}:${slot.index}:${salt}:${nextZOrder}:${nextRotationOrder}`);
  if (slot.element) {
    setStylePropertyIfChanged(slot.element, "--tilt", slot.meta.tilt);
  }
}

function createSlot(index) {
  const stored = savedLayout[index] || {};
  return {
    index,
    mode: index < projectionSettings.displayCount ? "display" : "waiting",
    state: null,
    wish: null,
    element: null,
    textNode: null,
    typingTimer: null,
    typingResolve: null,
    leaveTimer: null,
    leaveResolve: null,
    gustTimer: null,
    glowTimer: null,
    gustAnimation: null,
    rotationOrder: null,
    dragging: false,
    meta: {
      x: typeof stored.x === "number" ? stored.x : 8 + ((index * 19) % 84),
      y: typeof stored.y === "number" ? stored.y : 8 + ((index * 23) % 58),
      z: nextZOrder++,
      delay: `${(index % 6) * -0.7}s`,
      tilt: pickTanzakuTilt(`initial:${index}`)
    }
  };
}

function createSeededRandom(seedText) {
  let hash = 2166136261;
  const source = String(seedText || "tanabata-clouds");
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash += 0x6D2B79F5;
    let value = hash;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function relativeCloudOriginYToViewport(value) {
  return ((value + 1) / 2) * 100;
}

function renderCloudLayer() {
  if (!cloudLayer) return;

  const random = createSeededRandom(projectionSettings.cloudSeed);
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < projectionSettings.cloudCount; index += 1) {
    const cloud = document.createElement("span");
    cloud.className = "cloud";
    const originY = relativeCloudOriginYToViewport(projectionSettings.cloudOriginY);
    const spreadY = (random() - 0.5) * 48;
    const width = 38 + random() * 28;
    const height = 9 + random() * 8;
    const opacity = 0.36 + random() * 0.34;
    const duration = 46 + random() * 34;
    const delay = -random() * duration;
    const scale = 0.82 + random() * 0.46;
    const startX = -(width + 18 + (random() * 34));
    cloud.style.setProperty("--cloud-x", `${startX.toFixed(2)}vw`);
    cloud.style.setProperty("--cloud-y", `${(originY + spreadY).toFixed(2)}vh`);
    cloud.style.setProperty("--cloud-width", `${width.toFixed(2)}vw`);
    cloud.style.setProperty("--cloud-height", `${height.toFixed(2)}vh`);
    cloud.style.setProperty("--cloud-opacity", opacity.toFixed(3));
    cloud.style.setProperty("--cloud-duration", `${duration.toFixed(2)}s`);
    cloud.style.setProperty("--cloud-delay", `${delay.toFixed(2)}s`);
    cloud.style.setProperty("--cloud-scale", scale.toFixed(3));
    fragment.append(cloud);
  }
  cloudLayer.replaceChildren(fragment);
}

function getCloudSettingsSignature(settings) {
  return JSON.stringify({
    cloudCount: settings.cloudCount,
    cloudOriginY: settings.cloudOriginY,
    cloudSeed: settings.cloudSeed
  });
}

function getProjectionSettingsSignature(settings) {
  return JSON.stringify({
    displayCount: settings.displayCount,
    slotCount: settings.slotCount,
    moveCount: settings.moveCount,
    typingIntervalMs: settings.typingIntervalMs,
    rotateIntervalMs: settings.rotateIntervalMs,
    tanzakuFontId: settings.tanzakuFontId,
    colorEmojiFontEnabled: settings.colorEmojiFontEnabled,
    effectAutoEnabled: settings.effectAutoEnabled,
    effectIntervalMs: settings.effectIntervalMs,
    milkyWayGain: settings.milkyWayGain,
    milkyWayTwinkle: settings.milkyWayTwinkle,
    milkyWaySparkle: settings.milkyWaySparkle,
    milkyWaySpeed: settings.milkyWaySpeed,
    milkyWayParticleCount: settings.milkyWayParticleCount,
    milkyWaySparkleRatio: settings.milkyWaySparkleRatio,
    milkyWaySparklePeriodVariance: settings.milkyWaySparklePeriodVariance,
    milkyWaySparkleIntensityVariance: settings.milkyWaySparkleIntensityVariance,
    milkyWaySparklePeriodSeconds: settings.milkyWaySparklePeriodSeconds,
    milkyWaySparkleDutyRatio: settings.milkyWaySparkleDutyRatio,
    milkyWaySeed: settings.milkyWaySeed,
    tanabataStarResponseIntensity: settings.tanabataStarResponseIntensity,
    tanabataStarResponsePhaseDeg: settings.tanabataStarResponsePhaseDeg,
    tanabataStarResponsePeriodSeconds: settings.tanabataStarResponsePeriodSeconds,
    tanzakuSwayStrength: settings.tanzakuSwayStrength,
    tanzakuAmbientSwayStrength: settings.tanzakuAmbientSwayStrength,
    windGustStrength: settings.windGustStrength,
    windGustCycleMs: settings.windGustCycleMs,
    windGustCycleJitterSeconds: settings.windGustCycleJitterSeconds,
    experimentalParallaxEnabled: settings.experimentalParallaxEnabled,
    parallaxStrength: settings.parallaxStrength,
    parallaxVanishingPointX: settings.parallaxVanishingPointX,
    parallaxVanishingPointY: settings.parallaxVanishingPointY,
    parallaxMarkerEnabled: settings.parallaxMarkerEnabled,
    parallaxPopoutStrength: settings.parallaxPopoutStrength,
    parallaxDepthMultiplier: settings.parallaxDepthMultiplier,
    parallaxDepthReferenceIndex: settings.parallaxDepthReferenceIndex,
    parallaxMotionMode: settings.parallaxMotionMode,
    parallaxViewerOffsetX: settings.parallaxViewerOffsetX,
    parallaxViewerOffsetY: settings.parallaxViewerOffsetY,
    parallaxViewerDistance: settings.parallaxViewerDistance,
    viewportMargin: settings.viewportMargin,
    cloudCount: settings.cloudCount,
    cloudOriginY: settings.cloudOriginY,
    cloudSeed: settings.cloudSeed
  });
}

function getWishesSignature(wishes) {
  return JSON.stringify((wishes || []).map((wish) => [
    wish.id,
    wish.text,
    wish.updatedAt || wish.createdAt || ""
  ]));
}

function createParallaxScene() {
  const mappingPath = [
    { x: 0, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: 0, z: 0 }
  ];
  const displayPath = [
    { x: 0, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 0 }
  ];
  const scene = {
    enabled: false,
    startedAt: 0,
    frameRequested: false,
    viewerX: 0,
    viewerY: 0,
    viewerZ: 0,
    strength: 1,
    vanishingPointX: 0,
    vanishingPointY: 0,
    popoutStrength: 0,
    motionMode: "mapping",
    viewerOffsetX: 0,
    viewerOffsetY: 0,
    viewerDistance: 2.5,
    perspectiveBoxX: PERSPECTIVE_BOX_WALL_X_DEFAULT,
    perspectiveBoxY: PERSPECTIVE_BOX_WALL_Y_DEFAULT,
    motionSpeed: 1,
    motionDirection: "forward",
    viewportMargin: 0,
    markerEnabled: false,
    lastOverlayFrameAt: 0,
    overlayFrozenForTanzaku: false,
    overlayFrozenForMenu: false
  };

  function smooth(value) {
    return value * value * (3 - (2 * value));
  }

  function sample(now) {
    const sourcePath = usesDisplayPlaneMotion(scene.motionMode) ? displayPath : mappingPath;
    const path = scene.motionDirection === "reverse" ? sourcePath.slice().reverse() : sourcePath;
    const totalSegments = path.length - 1;
    const motionSpeed = Math.max(ORACLE_MOTION_SPEED_MIN, Math.min(ORACLE_MOTION_SPEED_MAX, scene.motionSpeed));
    const elapsed = Number.isFinite(now - scene.startedAt)
      ? ((now - scene.startedAt) * motionSpeed) % (totalSegments * PARALLAX_VIEWER_STEP_MS)
      : 0;
    const segment = Math.min(totalSegments - 1, Math.max(0, Math.floor(elapsed / PARALLAX_VIEWER_STEP_MS)));
    const from = path[segment];
    const to = path[segment + 1];
    if (!from || !to) {
      scene.viewerX = 0;
      scene.viewerY = 0;
      scene.viewerZ = 0;
      return;
    }
    const progress = smooth((elapsed - (segment * PARALLAX_VIEWER_STEP_MS)) / PARALLAX_VIEWER_STEP_MS);
    scene.viewerX = from.x + ((to.x - from.x) * progress);
    scene.viewerY = from.y + ((to.y - from.y) * progress);
    scene.viewerZ = from.z + ((to.z - from.z) * progress);
  }

  function getLayerZ(depth) {
    return PARALLAX_FAR_Z - ((PARALLAX_FAR_Z - PARALLAX_NEAR_Z) * getProjectionDepth(depth));
  }

  function getProjectionDepth(depth) {
    const safeDepth = Number.isFinite(depth) ? depth : 0.5;
    if (safeDepth < 0) {
      const extra = -safeDepth;
      return -(extra / (1 + (extra * 0.65))) * TANZAKU_DEPTH_FAR_EXTENSION;
    }
    if (safeDepth > 1) {
      const extra = safeDepth - 1;
      return 1 + ((extra / (1 + (extra * 0.28))) * TANZAKU_DEPTH_NEAR_EXTENSION);
    }
    return safeDepth;
  }

  function getViewerDistancePerspective() {
    return Math.max(0.3, Math.min(2.6, 2.5 / scene.viewerDistance));
  }

  function getDistanceAdjustedDepth(depth, referenceDepth) {
    const safeDepth = Number.isFinite(depth) ? depth : 0.5;
    const safeReferenceDepth = Number.isFinite(referenceDepth) ? referenceDepth : safeDepth;
    const distancePerspective = getViewerDistancePerspective();
    return safeReferenceDepth + ((safeDepth - safeReferenceDepth) * distancePerspective);
  }

  function getProjectionPlaneMetrics() {
    return getProjectionPlaneMetricsForMargin(scene.viewportMargin);
  }

  function clampSceneVanishingPoint(value, axis) {
    return clampVanishingPointForMargin(Number(value), scene.viewportMargin, axis);
  }

  function clampSceneVanishingPoints() {
    scene.vanishingPointX = clampSceneVanishingPoint(scene.vanishingPointX, "x");
    scene.vanishingPointY = clampSceneVanishingPoint(scene.vanishingPointY, "y");
  }

  function drawAreaPointToInnerPlane(value, axis, plane) {
    const size = axis === "y" ? plane.viewportHeight : plane.viewportWidth;
    const innerSize = axis === "y" ? plane.height : plane.width;
    const pixel = ((value + 1) / 2) * size;
    return (((pixel - plane.marginPx) / innerSize) * 2) - 1;
  }

  function getInnerPlaneVanishingPoint(plane) {
    return {
      x: drawAreaPointToInnerPlane(scene.vanishingPointX, "x", plane),
      y: drawAreaPointToInnerPlane(scene.vanishingPointY, "y", plane)
    };
  }

  function usesDisplayPlaneMotion(mode) {
    return mode === "display" || mode === "camera-display";
  }

  function usesCameraDepthMotion(mode) {
    return mode === "mapping" || mode === "camera";
  }

  function usesCameraViewCompensation(mode) {
    return mode === "camera" || mode === "camera-display";
  }

  function getCameraProjectionMotion(gain = 1) {
    const distanceFactor = 2.5 / scene.viewerDistance;
    const offsetDistanceFactor = Math.max(
      PARALLAX_VIEWER_OFFSET_DISTANCE_MIN,
      Math.min(PARALLAX_VIEWER_OFFSET_DISTANCE_MAX, Math.sqrt(distanceFactor))
    );
    const cameraX = (scene.viewerOffsetX * PARALLAX_VIEWER_OFFSET_CAMERA_X * offsetDistanceFactor) +
      (scene.viewerX * PARALLAX_CAMERA_X * scene.strength * distanceFactor);
    const dynamicCameraY = usesDisplayPlaneMotion(scene.motionMode)
      ? scene.viewerY * PARALLAX_CAMERA_Y * scene.popoutStrength
      : 0;
    const cameraY = (scene.viewerOffsetY * PARALLAX_VIEWER_OFFSET_CAMERA_Y * offsetDistanceFactor) +
      (dynamicCameraY * distanceFactor);
    const cameraZ = usesCameraDepthMotion(scene.motionMode)
      ? scene.viewerZ * PARALLAX_CAMERA_Z * scene.popoutStrength * distanceFactor
      : 0;
    return {
      x: cameraX * gain,
      y: cameraY * gain,
      z: cameraZ * gain
    };
  }

  function projectLayer(baseX, baseY, depth, referenceDepth = depth) {
    const plane = getProjectionPlaneMetrics();
    const vanishingPoint = getInnerPlaneVanishingPoint(plane);
    const layerZ = getLayerZ(getDistanceAdjustedDepth(depth, referenceDepth));
    const referenceLayerZ = getLayerZ(referenceDepth);
    const camera = getCameraProjectionMotion();
    const relativeZ = layerZ - camera.z;
    const safeZ = Math.max(PARALLAX_CAMERA_NEAR_CLIP_Z, relativeZ);
    const planeZ = PARALLAX_FAR_Z;
    const planeSafeZ = Math.max(PARALLAX_CAMERA_NEAR_CLIP_Z, planeZ - camera.z);
    const cameraViewCompensation = usesCameraViewCompensation(scene.motionMode) ? (planeSafeZ / planeZ) : 1;
    const worldX = (baseX - vanishingPoint.x) * referenceLayerZ / PARALLAX_FOCAL_LENGTH;
    const worldY = (baseY - vanishingPoint.y) * referenceLayerZ / PARALLAX_FOCAL_LENGTH;
    const projectedX = vanishingPoint.x + ((worldX - camera.x) * PARALLAX_FOCAL_LENGTH / safeZ);
    const projectedY = vanishingPoint.y + ((worldY - camera.y) * PARALLAX_FOCAL_LENGTH / safeZ);
    const shiftedX = vanishingPoint.x + ((projectedX - vanishingPoint.x) * cameraViewCompensation);
    const shiftedY = vanishingPoint.y + ((projectedY - vanishingPoint.y) * cameraViewCompensation);
    const distancePerspective = getViewerDistancePerspective();
    const scaleResponse = Math.max(0.1, Math.min(0.42, PARALLAX_SCALE_RESPONSE * distancePerspective));
    const neutralLayerZ = getLayerZ(TANZAKU_DEPTH_REFERENCE_NEUTRAL);
    const rawPerspectiveScale = (neutralLayerZ / safeZ) * cameraViewCompensation;
    const scale = Math.max(
      PARALLAX_SCALE_MIN,
      Math.min(PARALLAX_SCALE_MAX, 1 + ((rawPerspectiveScale - 1) * scaleResponse))
    );
    return {
      offsetXPx: (shiftedX - baseX) * plane.width * 0.5,
      offsetYPx: (shiftedY - baseY) * plane.height * 0.5,
      scale,
      depthScaleWeight: Math.max(0.25, Math.min(1, distancePerspective)),
      visible: relativeZ > 0
    };
  }

  function getRenderOrderRelativeZ(depth, referenceDepth = depth) {
    if (!scene.enabled) return null;
    const layerZ = getLayerZ(getDistanceAdjustedDepth(depth, referenceDepth));
    const camera = getCameraProjectionMotion();
    return layerZ - camera.z;
  }

  function projectPoint(baseX, baseY, depth, referenceDepth = depth) {
    const plane = getProjectionPlaneMetrics();
    const projected = projectLayer(baseX, baseY, depth, referenceDepth);
    return {
      x: plane.marginPx + (((baseX + 1) / 2) * plane.width) + projected.offsetXPx,
      y: plane.marginPx + (((baseY + 1) / 2) * plane.height) + projected.offsetYPx
    };
  }

  function getWorldPointForTanzakuDepth(baseX, baseY, depth, referenceDepth = TANZAKU_DEPTH_REFERENCE_NEUTRAL) {
    const plane = getProjectionPlaneMetrics();
    const vanishingPoint = getInnerPlaneVanishingPoint(plane);
    const layerZ = getLayerZ(getDistanceAdjustedDepth(depth, referenceDepth));
    const referenceLayerZ = getLayerZ(referenceDepth);
    return {
      x: (baseX - vanishingPoint.x) * referenceLayerZ / PARALLAX_FOCAL_LENGTH,
      y: (baseY - vanishingPoint.y) * referenceLayerZ / PARALLAX_FOCAL_LENGTH,
      z: layerZ
    };
  }

  function projectWorldPoint(worldPoint, camera = getCameraProjectionMotion()) {
    const plane = getProjectionPlaneMetrics();
    const vanishingPoint = getInnerPlaneVanishingPoint(plane);
    const relativeZ = worldPoint.z - camera.z;
    const safeZ = Math.max(PARALLAX_CAMERA_NEAR_CLIP_Z, relativeZ);
    const planeZ = PARALLAX_FAR_Z;
    const planeSafeZ = Math.max(PARALLAX_CAMERA_NEAR_CLIP_Z, planeZ - camera.z);
    const cameraViewCompensation = usesCameraViewCompensation(scene.motionMode) ? (planeSafeZ / planeZ) : 1;
    const projectedX = vanishingPoint.x + ((worldPoint.x - camera.x) * PARALLAX_FOCAL_LENGTH / safeZ);
    const projectedY = vanishingPoint.y + ((worldPoint.y - camera.y) * PARALLAX_FOCAL_LENGTH / safeZ);
    const shiftedX = vanishingPoint.x + ((projectedX - vanishingPoint.x) * cameraViewCompensation);
    const shiftedY = vanishingPoint.y + ((projectedY - vanishingPoint.y) * cameraViewCompensation);
    return {
      x: plane.marginPx + (((shiftedX + 1) / 2) * plane.width),
      y: plane.marginPx + (((shiftedY + 1) / 2) * plane.height)
    };
  }

  function getViewerGuidePoint() {
    const plane = getProjectionPlaneMetrics();
    const vanishingPoint = getInnerPlaneVanishingPoint(plane);
    const camera = getCameraProjectionMotion();
    const guideZ = Math.max(PARALLAX_CAMERA_NEAR_CLIP_Z, PARALLAX_FAR_Z - camera.z);
    const viewerPlaneX = vanishingPoint.x + ((camera.x * PARALLAX_FOCAL_LENGTH) / guideZ);
    const viewerPlaneY = vanishingPoint.y + ((camera.y * PARALLAX_FOCAL_LENGTH) / guideZ);
    return {
      x: plane.marginPx + (((viewerPlaneX + 1) / 2) * plane.width),
      y: plane.marginPx + (((viewerPlaneY + 1) / 2) * plane.height)
    };
  }

  function getPerspectiveBoxAnchor() {
    return {
      x: scene.perspectiveBoxX,
      y: scene.perspectiveBoxY,
      frontDepth: PERSPECTIVE_BOX_FRONT_DEPTH
    };
  }

  function applyViewportMargin() {
    const plane = getProjectionPlaneMetrics();
    projectionStage.style.setProperty("--projection-margin", `${plane.marginPx.toFixed(2)}px`);
    projectionStage.style.setProperty("--projection-viewport-width", `${plane.viewportWidth.toFixed(2)}px`);
    projectionStage.style.setProperty("--projection-viewport-height", `${plane.viewportHeight.toFixed(2)}px`);
    projectionStage.style.setProperty("--projection-frame-opacity", scene.markerEnabled && scene.viewportMargin > 0 ? "0.72" : "0");
  }

  function isMarkerModeVisible() {
    return scene.enabled && scene.markerEnabled;
  }

  function applyMarkerModeState() {
    const visible = isMarkerModeVisible();
    projectionStage.classList.toggle("projection-stage--parallax-marker", visible);
    if (!visible && parallaxDepthMap) {
      parallaxDepthMap.setAttribute("hidden", "");
    }
  }

  function applyVanishingPointMarker() {
    if (!vanishingPointMarker) return;
    const plane = getProjectionPlaneMetrics();
    const x = ((scene.vanishingPointX + 1) / 2) * plane.viewportWidth;
    const y = ((scene.vanishingPointY + 1) / 2) * plane.viewportHeight;
    setStylePropertyIfChanged(vanishingPointMarker, "--vanishing-point-marker-left", `${x.toFixed(2)}px`);
    setStylePropertyIfChanged(vanishingPointMarker, "--vanishing-point-marker-top", `${y.toFixed(2)}px`);
    vanishingPointMarker.hidden = !isMarkerModeVisible();
    applyMarkerModeState();
  }

  function hasActiveTanzakuRenderActivity() {
    return slots.some((slot) => slot.state === "typing" || slot.state === "leaving");
  }

  function setPerspectiveBoxDragHandleVisible(visible) {
    if (!parallaxBoxDragHandle) return;
    parallaxBoxDragHandle.hidden = !visible;
  }

  function drawPerspectiveBox(now = performance.now(), force = false) {
    if (!parallaxPerspectiveBox) return;
    const visible = scene.enabled && scene.markerEnabled;
    if (!visible) {
      parallaxPerspectiveBox.setAttribute("hidden", "");
      setPerspectiveBoxDragHandleVisible(false);
      scene.lastOverlayFrameAt = 0;
      scene.overlayFrozenForTanzaku = false;
      scene.overlayFrozenForMenu = false;
      return;
    }
    if (!force && isLayoutMenuOpen() && parallaxPerspectiveBox.children.length > 0) {
      scene.overlayFrozenForMenu = true;
      parallaxPerspectiveBox.removeAttribute("hidden");
      setPerspectiveBoxDragHandleVisible(true);
      return;
    }
    if (scene.overlayFrozenForMenu && !isLayoutMenuOpen()) {
      force = true;
      scene.overlayFrozenForMenu = false;
    }
    const tanzakuActive = hasActiveTanzakuRenderActivity();
    if (!force && tanzakuActive && parallaxPerspectiveBox.children.length > 0) {
      scene.overlayFrozenForTanzaku = true;
      parallaxPerspectiveBox.removeAttribute("hidden");
      setPerspectiveBoxDragHandleVisible(true);
      return;
    }
    if (scene.overlayFrozenForTanzaku && !tanzakuActive) {
      force = true;
      scene.overlayFrozenForTanzaku = false;
    }
    if (!force && scene.lastOverlayFrameAt && now - scene.lastOverlayFrameAt < PARALLAX_OVERLAY_FRAME_MS) return;
    scene.lastOverlayFrameAt = now;
    parallaxPerspectiveBox.removeAttribute("hidden");
    setPerspectiveBoxDragHandleVisible(true);

    const plane = getProjectionPlaneMetrics();
    setAttributeIfChanged(parallaxPerspectiveBox, "viewBox", `0 0 ${plane.viewportWidth} ${plane.viewportHeight}`);
    const anchor = getPerspectiveBoxAnchor();
    const frontDepth = anchor.frontDepth;
    const rearDepth = frontDepth + PERSPECTIVE_BOX_BUILDING_DEPTH;
    const halfWidth = 0.26;
    const halfHeight = 0.33;
    const baseCorners = [
      { x: anchor.x - halfWidth, y: anchor.y - halfHeight },
      { x: anchor.x + halfWidth, y: anchor.y - halfHeight },
      { x: anchor.x + halfWidth, y: anchor.y + halfHeight },
      { x: anchor.x - halfWidth, y: anchor.y + halfHeight }
    ];
    const frontWorld = baseCorners.map((point) => (
      getWorldPointForTanzakuDepth(point.x, point.y, frontDepth, TANZAKU_DEPTH_REFERENCE_NEUTRAL)
    ));
    const rearWorld = baseCorners.map((point) => (
      getWorldPointForTanzakuDepth(point.x, point.y, rearDepth, TANZAKU_DEPTH_REFERENCE_NEUTRAL)
    ));
    const camera = getCameraProjectionMotion();
    const front = [
      projectWorldPoint(frontWorld[0], camera),
      projectWorldPoint(frontWorld[1], camera),
      projectWorldPoint(frontWorld[2], camera),
      projectWorldPoint(frontWorld[3], camera)
    ];
    const rear = [
      projectWorldPoint(rearWorld[0], camera),
      projectWorldPoint(rearWorld[1], camera),
      projectWorldPoint(rearWorld[2], camera),
      projectWorldPoint(rearWorld[3], camera)
    ];
    const viewerGuidePoint = getViewerGuidePoint();
    const pointCommand = (point) => `${quantizePixel(point.x).toFixed(1)} ${quantizePixel(point.y).toFixed(1)}`;
    const closedPath = (points) => `M ${points.map(pointCommand).join(" L ")} Z`;
    const connectorPath = front.map((point, index) => `M ${pointCommand(point)} L ${pointCommand(rear[index])}`).join(" ");
    const perspectivePath = front
      .concat(rear)
      .map((point) => `M ${pointCommand(viewerGuidePoint)} L ${pointCommand(point)}`)
      .join(" ");
    const handleSource = front.concat(rear);
    const handlePoint = handleSource.reduce((point, next) => ({
      x: point.x + (next.x / handleSource.length),
      y: point.y + (next.y / handleSource.length)
    }), { x: 0, y: 0 });
    const handleInset = 28;
    const handleX = Math.max(handleInset, Math.min(plane.viewportWidth - handleInset, handlePoint.x));
    const handleY = Math.max(handleInset, Math.min(plane.viewportHeight - handleInset, handlePoint.y));
    const createPath = (className) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", className);
      return path;
    };
    const createCircle = (className) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("class", className);
      return circle;
    };
    const expectedChildren = 6;
    if (parallaxPerspectiveBox.children.length !== expectedChildren) {
      parallaxPerspectiveBox.replaceChildren(
        createPath("parallax-box-front"),
        createPath("parallax-box-rear"),
        createPath("parallax-box-depth"),
        createPath("parallax-box-perspective"),
        createCircle("parallax-box-handle-hit"),
        createCircle("parallax-box-handle")
      );
    }

    const paths = parallaxPerspectiveBox.querySelectorAll("path");
    setAttributeIfChanged(paths[0], "d", closedPath(front));
    setAttributeIfChanged(paths[1], "d", closedPath(rear));
    setAttributeIfChanged(paths[2], "d", connectorPath);
    setAttributeIfChanged(paths[3], "d", perspectivePath);
    const handleHit = parallaxPerspectiveBox.querySelector(".parallax-box-handle-hit");
    const handle = parallaxPerspectiveBox.querySelector(".parallax-box-handle");
    [handleHit, handle].forEach((element) => {
      setAttributeIfChanged(element, "cx", quantizePixel(handleX).toFixed(1));
      setAttributeIfChanged(element, "cy", quantizePixel(handleY).toFixed(1));
    });
    if (parallaxBoxDragHandle) {
      setStylePropertyIfChanged(parallaxBoxDragHandle, "--parallax-box-handle-x", `${quantizePixel(handleX).toFixed(1)}px`);
      setStylePropertyIfChanged(parallaxBoxDragHandle, "--parallax-box-handle-y", `${quantizePixel(handleY).toFixed(1)}px`);
    }
    setAttributeIfChanged(handleHit, "r", "26");
    setAttributeIfChanged(handle, "r", "12");
  }

  function drawDepthMap(referenceDepth = getDepthReferenceBaseDepth(), orderedSlots = getDepthOrderedSlots()) {
    if (!parallaxDepthMap) return;
    if (!isMarkerModeVisible()) {
      parallaxDepthMap.setAttribute("hidden", "");
      return;
    }

    const participants = slots.filter(isSlotDepthParticipant);
    const camera = getCameraProjectionMotion();
    const slotMetrics = participants.map((slot) => {
      const depth = getSlotDepth(slot, referenceDepth, orderedSlots);
      const layerZ = getLayerZ(getDistanceAdjustedDepth(depth, TANZAKU_DEPTH_REFERENCE_NEUTRAL));
      const relativeZ = layerZ - camera.z;
      const visualPosition = getSlotVisualPosition(slot);
      return { slot, relativeZ, x: visualPosition.x };
    });
    const positiveZ = slotMetrics
      .map((metric) => metric.relativeZ)
      .filter((relativeZ) => Number.isFinite(relativeZ) && relativeZ > 0);
    const negativeZ = slotMetrics
      .map((metric) => metric.relativeZ)
      .filter((relativeZ) => Number.isFinite(relativeZ) && relativeZ < 0);
    const maxAhead = Math.max(1, PARALLAX_FAR_Z - camera.z, ...positiveZ);
    const maxBehind = Math.max(0.5, ...negativeZ.map((relativeZ) => Math.abs(relativeZ)));
    const viewerY = 84;
    const dots = [
      {
        className: "parallax-depth-map-dot parallax-depth-map-dot--viewer",
        x: 50,
        y: viewerY
      },
      ...slotMetrics.map((metric) => {
        const aheadRatio = Math.max(0, Math.min(1, metric.relativeZ / maxAhead));
        const behindRatio = Math.max(0, Math.min(1, Math.abs(Math.min(0, metric.relativeZ)) / maxBehind));
        const y = metric.relativeZ >= 0
          ? viewerY - (aheadRatio * 74)
          : viewerY + (behindRatio * 10);
        return {
          className: `parallax-depth-map-dot parallax-depth-map-dot--tanzaku parallax-depth-map-dot--${colors[metric.slot.index % colors.length]}${metric.relativeZ <= 0 ? " parallax-depth-map-dot--behind" : ""}`,
          x: Math.max(18, Math.min(82, metric.x)),
          y
        };
      })
    ];

    if (parallaxDepthMap.children.length !== dots.length) {
      parallaxDepthMap.replaceChildren(...dots.map(() => document.createElement("span")));
    }
    dots.forEach((dot, index) => {
      const element = parallaxDepthMap.children[index];
      element.className = dot.className;
      setStylePropertyIfChanged(element, "--depth-dot-x", `${dot.x.toFixed(1)}%`);
      setStylePropertyIfChanged(element, "--depth-dot-y", `${dot.y.toFixed(1)}%`);
    });
    parallaxDepthMap.removeAttribute("hidden");
  }

  function applySlot(slot, referenceDepth = getDepthReferenceBaseDepth(), orderedSlots = getDepthOrderedSlots()) {
    if (!slot?.element) return;
    if (slot.depthReflowActive) return;
    const depth = getSlotDepth(slot, referenceDepth, orderedSlots);
    const visualPosition = getSlotVisualPosition(slot);
    const baseX = (visualPosition.x - 50) / 50;
    const baseY = (visualPosition.y - 50) / 50;
    const projected = projectLayer(baseX, baseY, depth, TANZAKU_DEPTH_REFERENCE_NEUTRAL);
    slot.element.classList.toggle("tanzaku--behind-viewer", !projected.visible);
    slot.element.style.visibility = projected.visible ? "visible" : "hidden";
    const depthScale = getSlotDepthScale(slot, depth);
    const adjustedDepthScale = 1 + ((depthScale - 1) * projected.depthScaleWeight);
    const combinedScale = Math.min(TANZAKU_COMBINED_SCALE_MAX, adjustedDepthScale * projected.scale);
    setStylePropertyIfChanged(slot.element, "--parallax-x", formatPixel(projected.offsetXPx));
    setStylePropertyIfChanged(slot.element, "--parallax-y", formatPixel(projected.offsetYPx));
    setStylePropertyIfChanged(slot.element, "--depth-scale", formatScale(Math.max(0.82, combinedScale)));
  }

  function bambooScreenPercentToPlaneX(value, fallback) {
    const position = normalizeBambooX(value ?? fallback);
    return (position - 50) / 50;
  }

  function bambooOffsetToPlaneY(value, fallbackBaseY) {
    const offset = normalizeBambooY(value);
    return fallbackBaseY - (offset / 50);
  }

  function applyBamboo() {
    const orderedSlots = getDepthOrderedSlots();
    const referenceDepth = getDepthReferenceBaseDepth(orderedSlots);
    const referenceSlot = getDepthReferenceSlot(orderedSlots);
    const bambooDepth = referenceSlot
      ? getSlotDepth(referenceSlot, referenceDepth, orderedSlots)
      : TANZAKU_DEPTH_REFERENCE_NEUTRAL;
    const settings = currentAppearanceSettings;
    const leftProjected = projectLayer(
      bambooScreenPercentToPlaneX(settings.bambooLeftX, BAMBOO_LEFT_X_DEFAULT),
      bambooOffsetToPlaneY(settings.bambooLeftY, 0.16),
      bambooDepth,
      TANZAKU_DEPTH_REFERENCE_NEUTRAL
    );
    const rightProjected = projectLayer(
      bambooScreenPercentToPlaneX(settings.bambooRightX, BAMBOO_RIGHT_X_DEFAULT),
      bambooOffsetToPlaneY(settings.bambooRightY, 0.12),
      bambooDepth,
      TANZAKU_DEPTH_REFERENCE_NEUTRAL
    );
    setStylePropertyIfChanged(projectionStage, "--bamboo-left-parallax-x", formatPixel(leftProjected.offsetXPx));
    setStylePropertyIfChanged(projectionStage, "--bamboo-left-parallax-y", formatPixel(leftProjected.offsetYPx));
    setStylePropertyIfChanged(projectionStage, "--bamboo-right-parallax-x", formatPixel(rightProjected.offsetXPx));
    setStylePropertyIfChanged(projectionStage, "--bamboo-right-parallax-y", formatPixel(rightProjected.offsetYPx));
    setStylePropertyIfChanged(projectionStage, "--bamboo-left-parallax-scale", formatScale(Math.max(0.9, leftProjected.scale)));
    setStylePropertyIfChanged(projectionStage, "--bamboo-right-parallax-scale", formatScale(Math.max(0.9, rightProjected.scale)));
  }

  function getOracleMotionScale(viewerZ) {
    return Math.max(0.76, 0.92 + (Math.max(0, viewerZ) * 0.16) - (Math.max(0, -viewerZ) * 0.08));
  }

  function clampOracleOffset(viewerX, viewerY, viewerZ) {
    const scale = currentOracleBoatScale * getOracleMotionScale(viewerZ);
    const halfWidth = (ORACLE_BOAT_BASE_WIDTH_PX * scale * 0.62) + ORACLE_EDGE_PADDING_PX;
    const height = (ORACLE_BOAT_BASE_HEIGHT_PX * scale * 1.28) + ORACLE_EDGE_PADDING_PX;
    const viewport = getProjectionViewportMetrics();
    const maxX = Math.max(0, (viewport.width / 2) - halfWidth);
    const baseBottom = ORACLE_CONTAINER_BOTTOM_PX + currentOracleBoatBottomOffset + ORACLE_CAMERA_BOTTOM_PX;
    const maxY = Math.max(0, baseBottom - ORACLE_EDGE_PADDING_PX);
    const minY = Math.min(maxY, baseBottom + height - (viewport.height - ORACLE_EDGE_PADDING_PX));
    return {
      x: Math.max(-maxX, Math.min(maxX, viewerX)),
      y: Math.max(minY, Math.min(maxY, viewerY))
    };
  }

  function applyOracle() {
    const viewerX = (scene.viewerOffsetX * 18) + (scene.viewerX * 34 * scene.strength);
    const viewerY = (scene.viewerOffsetY * 12) + (usesDisplayPlaneMotion(scene.motionMode) ? scene.viewerY * 18 * scene.popoutStrength : 0);
    const viewerZ = usesCameraDepthMotion(scene.motionMode)
      ? scene.viewerZ * scene.popoutStrength
      : 0;
    const oracleScale = getOracleMotionScale(viewerZ);
    const clamped = clampOracleOffset(viewerX, viewerY, viewerZ);
    setStylePropertyIfChanged(projectionStage, "--viewer-oracle-x", formatPixel(clamped.x));
    setStylePropertyIfChanged(projectionStage, "--viewer-oracle-y", formatPixel(clamped.y));
    setStylePropertyIfChanged(projectionStage, "--viewer-oracle-scale", formatScale(oracleScale));
    setStylePropertyIfChanged(projectionStage, "--viewer-oracle-near", formatScale(Math.max(0, viewerZ)));
    setStylePropertyIfChanged(projectionStage, "--viewer-oracle-far", formatScale(Math.max(0, -viewerZ)));
  }

  function reset() {
    scene.viewerX = 0;
    scene.viewerY = 0;
    scene.viewerZ = 0;
    projectionStage.classList.remove("projection-stage--parallax");
    projectionStage.classList.remove("projection-stage--parallax-marker");
    projectionStage.style.removeProperty("--bamboo-left-parallax-x");
    projectionStage.style.removeProperty("--bamboo-left-parallax-y");
    projectionStage.style.removeProperty("--bamboo-right-parallax-x");
    projectionStage.style.removeProperty("--bamboo-right-parallax-y");
    projectionStage.style.removeProperty("--bamboo-left-parallax-scale");
    projectionStage.style.removeProperty("--bamboo-right-parallax-scale");
    projectionStage.style.removeProperty("--viewer-oracle-x");
    projectionStage.style.removeProperty("--viewer-oracle-y");
    projectionStage.style.removeProperty("--viewer-oracle-scale");
    projectionStage.style.removeProperty("--viewer-oracle-near");
    projectionStage.style.removeProperty("--viewer-oracle-far");
    applyViewportMargin();
    applyVanishingPointMarker();
    drawPerspectiveBox(performance.now(), true);
    const depthOrderedSlots = getDepthOrderedSlots();
    const referenceDepth = getDepthReferenceBaseDepth(depthOrderedSlots);
    drawDepthMap(referenceDepth, depthOrderedSlots);
    slots.forEach((slot) => {
      if (!slot.element) return;
      setStylePropertyIfChanged(slot.element, "--parallax-x", "0px");
      setStylePropertyIfChanged(slot.element, "--parallax-y", "0px");
      slot.element.classList.remove("tanzaku--behind-viewer");
      slot.element.style.visibility = "visible";
      updateSlotDepth(slot, referenceDepth, depthOrderedSlots);
    });
  }

  function frame(now) {
    scene.frameRequested = false;
    if (!scene.enabled) return;
    sample(now);
    projectionStage.classList.add("projection-stage--parallax");
    applyViewportMargin();
    drawPerspectiveBox(now);
    applyBamboo();
    applyOracle();
    const depthOrderedSlots = getDepthOrderedSlots();
    const referenceDepth = getDepthReferenceBaseDepth(depthOrderedSlots);
    slots.forEach((slot) => applySlot(slot, referenceDepth, depthOrderedSlots));
    drawDepthMap(referenceDepth, depthOrderedSlots);
    ensureFrame();
  }

  function ensureFrame() {
    if (scene.enabled && !scene.frameRequested) {
      scene.frameRequested = true;
      window.requestAnimationFrame(frame);
    }
  }

  return {
    setEnabled(enabled) {
      if (scene.enabled === enabled) return;
      scene.enabled = enabled;
      if (enabled) {
        scene.startedAt = performance.now();
        ensureFrame();
      } else {
        reset();
      }
    },
    setStrength(strength) {
      scene.strength = Math.max(0, Math.min(3, Number.isFinite(strength) ? strength : 1));
      this.refresh();
    },
    setVanishingPoint(x, y) {
      scene.vanishingPointX = clampSceneVanishingPoint(x, "x");
      scene.vanishingPointY = clampSceneVanishingPoint(y, "y");
      this.refresh();
    },
    setPopoutStrength(strength) {
      scene.popoutStrength = Math.max(0, Math.min(3, Number.isFinite(strength) ? strength : 0));
      this.refresh();
    },
    setViewerGeometry(offsetX, offsetY, distance) {
      const nextOffsetX = Number(offsetX);
      const nextOffsetY = Number(offsetY);
      const nextDistance = Number(distance);
      scene.viewerOffsetX = Math.max(PARALLAX_VIEWER_OFFSET_X_MIN, Math.min(PARALLAX_VIEWER_OFFSET_X_MAX, Number.isFinite(nextOffsetX) ? nextOffsetX : 0));
      scene.viewerOffsetY = Math.max(PARALLAX_VIEWER_OFFSET_Y_MIN, Math.min(PARALLAX_VIEWER_OFFSET_Y_MAX, Number.isFinite(nextOffsetY) ? nextOffsetY : 0));
      scene.viewerDistance = Math.max(0.5, Math.min(PARALLAX_VIEWER_DISTANCE_MAX, Number.isFinite(nextDistance) ? nextDistance : 2.5));
      this.refresh();
    },
    setPerspectiveBoxPosition(x, y, { refresh = true } = {}) {
      const nextX = normalizePerspectiveBoxCoordinate(x);
      const nextY = normalizePerspectiveBoxCoordinate(y);
      if (scene.perspectiveBoxX === nextX && scene.perspectiveBoxY === nextY) return;
      scene.perspectiveBoxX = nextX;
      scene.perspectiveBoxY = nextY;
      drawPerspectiveBox(performance.now(), true);
      if (refresh) {
        this.refresh();
      }
    },
    setMotionTiming(speed, direction) {
      const nextSpeed = normalizeOracleMotionSpeed(speed);
      const nextDirection = normalizeOracleMotionDirection(direction);
      if (scene.motionSpeed === nextSpeed && scene.motionDirection === nextDirection) return;
      scene.motionSpeed = nextSpeed;
      scene.motionDirection = nextDirection;
      scene.startedAt = performance.now();
      scene.viewerX = 0;
      scene.viewerY = 0;
      scene.viewerZ = 0;
      this.refresh();
    },
    setMotionMode(mode) {
      const nextMode = ["display", "mapping", "camera", "camera-display"].includes(mode) ? mode : "mapping";
      if (scene.motionMode === nextMode) return;
      scene.motionMode = nextMode;
      scene.startedAt = performance.now();
      scene.viewerX = 0;
      scene.viewerY = 0;
      scene.viewerZ = 0;
      this.refresh();
    },
    setViewportMargin(margin) {
      const nextMargin = Number(margin);
      scene.viewportMargin = Math.max(0, Math.min(24, Number.isFinite(nextMargin) ? nextMargin : 0));
      clampSceneVanishingPoints();
      applyViewportMargin();
      applyVanishingPointMarker();
      drawPerspectiveBox(performance.now(), true);
      this.refresh();
    },
    setMarkerEnabled(enabled) {
      scene.markerEnabled = enabled === true;
      applyVanishingPointMarker();
      drawPerspectiveBox(performance.now(), true);
      drawDepthMap();
    },
    getRenderOrderRelativeZ,
    refresh() {
      applyViewportMargin();
      applyVanishingPointMarker();
      drawPerspectiveBox(performance.now(), true);
      if (scene.enabled) {
        applyBamboo();
        applyOracle();
        const depthOrderedSlots = getDepthOrderedSlots();
        const referenceDepth = getDepthReferenceBaseDepth(depthOrderedSlots);
        slots.forEach((slot) => applySlot(slot, referenceDepth, depthOrderedSlots));
        drawDepthMap(referenceDepth, depthOrderedSlots);
      } else {
        reset();
      }
    }
  };
}

function createWebglEffectsScene(canvas) {
  const fallback = {
    resize() {},
    startBridge() {},
    startWarp() {},
    stop() {}
  };
  if (!canvas) return fallback;

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    depth: false,
    premultipliedAlpha: true
  });
  if (!gl) return fallback;

  const BRIDGE_BUILD_MS = EFFECT_BRIDGE_BUILD_MS;
  const BRIDGE_SCATTER_MS = 12000;
  const WARP_FADE_MS = 12000;
  const END_FADE_MS = 2200;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function seededNoise(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, `
    attribute vec2 aSource;
    attribute vec2 aBridge;
    attribute vec2 aWarpOffset;
    attribute vec2 aScatter;
    attribute float aSize;
    attribute float aAlpha;
    attribute float aPhase;
    attribute float aGatherDelay;
    attribute float aOvershoot;
    attribute vec3 aColor;
    uniform float uTime;
    uniform float uBridgeBuild;
    uniform float uBridgeScatter;
    uniform float uWarp;
    uniform float uOpacity;
    uniform vec2 uWarpCenter;
    varying vec4 vColor;

    void main() {
      float pulse = 0.74 + 0.26 * sin(uTime * 2.4 + aPhase);
      float delayedBuild = clamp((uBridgeBuild - aGatherDelay) / max(0.22, 1.0 - aGatherDelay), 0.0, 1.0);
      float easedBuild = delayedBuild * delayedBuild * delayedBuild * (delayedBuild * (delayedBuild * 6.0 - 15.0) + 10.0);
      float brakeBuild = 1.0 - pow(1.0 - easedBuild, 1.35);
      float settle = smoothstep(0.72, 1.0, easedBuild);
      float gather = mix(brakeBuild * 0.9, 1.0, settle);
      float scatter = smoothstep(0.0, 1.0, uBridgeScatter);
      vec2 travel = aBridge - aSource;
      vec2 travelDirection = normalize(travel + vec2(0.0001, 0.0001));
      float overshootPulse = sin(smoothstep(0.58, 1.0, easedBuild) * 3.14159265);
      vec2 bridgeTarget = aBridge + travelDirection * aOvershoot * overshootPulse * (1.0 - scatter);
      vec2 bridgePosition = mix(aSource, bridgeTarget, gather);
      bridgePosition = mix(bridgePosition, aScatter, scatter);
      bridgePosition += vec2(
        sin(uTime * 1.2 + aPhase) * 0.012,
        cos(uTime * 1.0 + aPhase) * 0.018
      ) * gather * (1.0 - scatter);

      vec2 offset = aWarpOffset;
      float baseRadius = length(offset);
      float radiusRatio = clamp(baseRadius / 0.72, 0.0, 1.0);
      float initialAngle = atan(offset.y, offset.x);
      float angularVelocity = mix(0.16, 0.78, pow(1.0 - radiusRatio, 1.65));
      float spiralTwist = uWarp * mix(2.7, 0.38, radiusRatio);
      float spin = initialAngle + uTime * angularVelocity + spiralTwist + sin(aPhase) * 0.08;
      float radius = baseRadius * (0.82 + uWarp * 0.34);
      radius += sin(uTime * 0.42 + aPhase) * 0.018 * (1.0 - radiusRatio) * uWarp;
      vec2 direction = vec2(cos(spin), sin(spin));
      vec2 warpPosition = uWarpCenter + direction * radius;

      float modeMix = smoothstep(0.02, 0.32, uWarp);
      vec2 position = mix(bridgePosition, warpPosition, modeMix);
      float flash = 1.0 + 2.2 * (1.0 - smoothstep(0.0, 0.18, abs(uBridgeBuild - 0.86)));
      float bridgeAlpha = gather * (1.0 - scatter) * flash;
      float alpha = aAlpha * pulse * max(bridgeAlpha, uWarp) * uOpacity;
      gl_Position = vec4(position, 0.0, 1.0);
      gl_PointSize = aSize * (1.0 + uWarp * 1.8 + bridgeAlpha * 0.55);
      vColor = vec4(aColor, alpha);
    }
  `);

  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    varying vec4 vColor;

    void main() {
      vec2 point = gl_PointCoord - vec2(0.5);
      float dist = length(point);
      float alpha = smoothstep(0.5, 0.0, dist);
      alpha *= alpha;
      gl_FragColor = vec4(vColor.rgb, vColor.a * alpha);
    }
  `);

  if (!vertexShader || !fragmentShader) return fallback;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fallback;

  const particleCount = 900;
  const floatsPerParticle = 16;
  const data = new Float32Array(particleCount * floatsPerParticle);
  const vega = { x: -0.46, y: 0.66 };
  const altair = { x: 0.46, y: -0.14 };
  for (let index = 0; index < particleCount; index += 1) {
    const t = index / (particleCount - 1);
    const wave = Math.sin(t * Math.PI);
    const side = seededNoise(index * 17 + 5) - 0.5;
    const jitter = (seededNoise(index * 19 + 7) - 0.5) * 0.085 * wave;
    const bridgeX = vega.x + (altair.x - vega.x) * t + side * 0.052 * wave;
    const bridgeY = vega.y + (altair.y - vega.y) * t + Math.sin(t * Math.PI * 2.6) * 0.058 * wave + jitter;
    const sourceT = seededNoise(index * 43 + 3);
    const sourceSide = seededNoise(index * 67 + 31) > 0.5 ? 1 : -1;
    const sourceSpread = 1.16 + Math.pow(seededNoise(index * 71 + 33), 0.58) * 0.52;
    const sourceX = sourceSide * sourceSpread + (sourceT - 0.5) * 0.36;
    const sourceY = 0.12 - sourceX * 0.16 + (seededNoise(index * 47 + 9) - 0.5) * 0.72;
    const scatterAngle = seededNoise(index * 53 + 15) * Math.PI * 2;
    const scatterRadius = 0.18 + Math.pow(seededNoise(index * 57 + 21), 0.64) * 0.42;
    const scatterX = bridgeX + Math.cos(scatterAngle) * scatterRadius;
    const scatterY = bridgeY + Math.sin(scatterAngle) * scatterRadius;
    const warpAngle = seededNoise(index * 23 + 11) * Math.PI * 2;
    const warpRadius = 0.08 + Math.pow(seededNoise(index * 29 + 13), 0.55) * 0.64;
    const brightness = seededNoise(index * 31 + 17);
    const warm = seededNoise(index * 37 + 19) > 0.58;
    const gatherDelay = Math.pow(seededNoise(index * 61 + 29), 1.15) * 0.42;
    const overshootSeed = seededNoise(index * 73 + 35);
    const overshoot = overshootSeed > 0.46 ? 0.06 + Math.pow(overshootSeed, 1.85) * 0.13 : 0;
    const base = index * floatsPerParticle;
    data[base] = sourceX;
    data[base + 1] = sourceY;
    data[base + 2] = bridgeX;
    data[base + 3] = bridgeY;
    data[base + 4] = Math.cos(warpAngle) * warpRadius;
    data[base + 5] = Math.sin(warpAngle) * warpRadius;
    data[base + 6] = scatterX;
    data[base + 7] = scatterY;
    data[base + 8] = 4.6 + Math.pow(brightness, 2.2) * 13.5;
    data[base + 9] = 0.16 + Math.pow(brightness, 1.8) * 0.5;
    data[base + 10] = seededNoise(index * 41 + 23) * Math.PI * 2;
    data[base + 11] = warm ? 1.0 : 0.72;
    data[base + 12] = warm ? 0.86 : 0.95;
    data[base + 13] = warm ? 0.42 : 1.0;
    data[base + 14] = gatherDelay;
    data[base + 15] = overshoot;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const locations = {
    source: gl.getAttribLocation(program, "aSource"),
    bridge: gl.getAttribLocation(program, "aBridge"),
    warpOffset: gl.getAttribLocation(program, "aWarpOffset"),
    scatter: gl.getAttribLocation(program, "aScatter"),
    size: gl.getAttribLocation(program, "aSize"),
    alpha: gl.getAttribLocation(program, "aAlpha"),
    phase: gl.getAttribLocation(program, "aPhase"),
    gatherDelay: gl.getAttribLocation(program, "aGatherDelay"),
    overshoot: gl.getAttribLocation(program, "aOvershoot"),
    color: gl.getAttribLocation(program, "aColor"),
    time: gl.getUniformLocation(program, "uTime"),
    bridgeBuild: gl.getUniformLocation(program, "uBridgeBuild"),
    bridgeScatter: gl.getUniformLocation(program, "uBridgeScatter"),
    warp: gl.getUniformLocation(program, "uWarp"),
    opacity: gl.getUniformLocation(program, "uOpacity"),
    warpCenter: gl.getUniformLocation(program, "uWarpCenter")
  };

  const scene = {
    bridgeStartedAt: null,
    bridgeScatterStartedAt: null,
    warpStartedAt: null,
    endingAt: null,
    running: false,
    frameRequested: false
  };

  function enableAttribute(location, size, offset) {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, floatsPerParticle * 4, offset * 4);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function smoothstep(edge0, edge1, value) {
    const x = clamp01((value - edge0) / (edge1 - edge0));
    return x * x * (3 - 2 * x);
  }

  function frame(now) {
    scene.frameRequested = false;
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!scene.running) return;

    const bridgeProgress = scene.bridgeStartedAt === null ? 0 : clamp01((now - scene.bridgeStartedAt) / BRIDGE_BUILD_MS);
    const bridgeScatter = scene.bridgeScatterStartedAt === null ? 0 : clamp01((now - scene.bridgeScatterStartedAt) / BRIDGE_SCATTER_MS);
    const warpProgress = scene.warpStartedAt === null ? 0 : clamp01((now - scene.warpStartedAt) / WARP_FADE_MS);
    const endFade = scene.endingAt === null ? 1 : 1 - clamp01((now - scene.endingAt) / END_FADE_MS);
    const vortexFade = scene.warpStartedAt === null ? 1 : 1 - smoothstep(0.28, 1, warpProgress);
    const fade = Math.min(endFade, vortexFade);
    const bridge = bridgeProgress;
    const scatter = Math.max(bridgeScatter, 1 - fade);
    const warp = warpProgress;

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    enableAttribute(locations.source, 2, 0);
    enableAttribute(locations.bridge, 2, 2);
    enableAttribute(locations.warpOffset, 2, 4);
    enableAttribute(locations.scatter, 2, 6);
    enableAttribute(locations.size, 1, 8);
    enableAttribute(locations.alpha, 1, 9);
    enableAttribute(locations.phase, 1, 10);
    enableAttribute(locations.gatherDelay, 1, 14);
    enableAttribute(locations.overshoot, 1, 15);
    enableAttribute(locations.color, 3, 11);
    gl.uniform1f(locations.time, now / 1000);
    gl.uniform1f(locations.bridgeBuild, bridge);
    gl.uniform1f(locations.bridgeScatter, scatter);
    gl.uniform1f(locations.warp, warp);
    gl.uniform1f(locations.opacity, fade);
    gl.uniform2f(locations.warpCenter, 0.03, 0.1);
    gl.drawArrays(gl.POINTS, 0, particleCount);

    if (scene.endingAt !== null && fade <= 0) {
      scene.running = false;
      scene.bridgeStartedAt = null;
      scene.bridgeScatterStartedAt = null;
      scene.warpStartedAt = null;
      scene.endingAt = null;
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    ensureFrame();
  }

  function ensureFrame() {
    if (scene.running && !scene.frameRequested) {
      scene.frameRequested = true;
      window.requestAnimationFrame(frame);
    }
  }

  return {
    resize,
    startBridge() {
      scene.running = true;
      scene.bridgeStartedAt = performance.now();
      scene.bridgeScatterStartedAt = null;
      scene.warpStartedAt = null;
      scene.endingAt = null;
      ensureFrame();
    },
    startWarp() {
      scene.running = true;
      scene.bridgeScatterStartedAt = performance.now();
      scene.warpStartedAt = performance.now();
      ensureFrame();
    },
    stop() {
      if (!scene.running) return;
      scene.endingAt = performance.now();
      ensureFrame();
    }
  };
}

function createEffectsScene(canvas) {
  if (!canvas) {
    return {
      resize() {},
      setMeteorShowerActive() {},
      setMilkyWayGain() {},
      setMilkyWayParams() {},
      burstAtSlot() {}
    };
  }

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return {
      resize() {},
      setMeteorShowerActive() {},
      setMilkyWayGain() {},
      setMilkyWayParams() {},
      burstAtSlot() {}
    };
  }

  function seededNoise(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  function centeredNoise(seed) {
    return seededNoise(seed) - 0.5;
  }

  function createMilkyWayStars(count, seedText = "tanabata-milky-way") {
    const safeCount = Math.max(80, Math.min(720, Number.isInteger(count) ? count : 340));
    const random = createSeededRandom(`milky-stars:${seedText}:${safeCount}`);
    return Array.from({ length: safeCount }, (_, index) => {
      const brightnessSeed = random();
      const along = random();
      const coreBias = Math.pow(random(), 2.2);
      const side = random() >= 0.5 ? 1 : -1;
      const sparkleSeed = random();
      return {
        along,
        offset: side * coreBias,
        seed: index * 47 + brightnessSeed * 13,
        radius: 0.8 + random() * 2.15,
        alpha: 0.22 + random() * 0.5,
        phase: random() * Math.PI * 2,
        shimmerSpeed: 0.74 + random() * 2.45,
        flowSpeed: 0.42 + random() * 0.74,
        sparkleSeed,
        sparklePhase: random(),
        sparklePeriodSeed: random() - 0.5,
        sparkleDutySeed: random() - 0.5,
        sparkleIntensitySeed: random() - 0.5,
        warm: random() > 0.72
      };
    });
  }

  function createMilkyWayClouds(seedText = "tanabata-milky-way") {
    const random = createSeededRandom(`milky-clouds:${seedText}`);
    return Array.from({ length: 15 }, (_, index) => ({
      along: (index + random() * 0.7) / 15,
      offset: (random() - 0.5) * 0.46,
      width: 0.08 + random() * 0.08,
      height: 0.28 + random() * 0.32,
      alpha: 0.16 + random() * 0.1,
      phase: random() * Math.PI * 2,
      pulseSpeed: 0.28 + random() * 0.86
    }));
  }

  const scene = {
    width: 1,
    height: 1,
    dpr: 1,
    startTime: performance.now(),
    milkyWayGain: DEFAULT_MILKY_WAY_PROJECTION_GAIN,
    milkyWayTwinkle: 1,
    milkyWaySparkle: 1,
    milkyWaySpeed: 1,
    milkyWayParticleCount: 340,
    milkyWaySparkleRatio: 0.045,
    milkyWaySparklePeriodVariance: 1,
    milkyWaySparkleIntensityVariance: 1,
    milkyWaySparklePeriodSeconds: 2.2,
    milkyWaySparkleDutyRatio: 0.16,
    milkyWaySeed: "tanabata-milky-way",
    tanabataStarResponseIntensity: 1,
    tanabataStarResponsePhaseDeg: 166,
    tanabataStarResponsePeriodSeconds: 35,
    meteorShowerActive: false,
    particles: [],
    meteors: [],
    ambientStars: Array.from({ length: 170 }, (_, index) => {
      const brightnessSeed = seededNoise(index * 61 + 17);
      return {
        x: seededNoise(index * 53 + 2),
        y: seededNoise(index * 59 + 7) * 0.84,
        radius: 0.35 + Math.pow(brightnessSeed, 2.1) * 1.55,
        alpha: 0.08 + Math.pow(brightnessSeed, 2.4) * 0.58,
        phase: seededNoise(index * 67 + 19) * Math.PI * 2,
        warm: seededNoise(index * 71 + 23) > 0.78
      };
    }),
    tanabataStars: [
      {
        name: "ベガ",
        x: 0.27,
        y: 0.17,
        radius: 3.2,
        color: "228, 246, 255",
        halo: "116, 227, 255",
        phase: 0.4,
        responsePhase: 0
      },
      {
        name: "アルタイル",
        x: 0.73,
        y: 0.57,
        radius: 2.8,
        color: "255, 244, 196",
        halo: "255, 218, 130",
        phase: 2.2,
        responsePhase: Math.PI * 0.92
      }
    ],
    milkyStars: createMilkyWayStars(340, "tanabata-milky-way"),
    milkyClouds: createMilkyWayClouds("tanabata-milky-way")
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    scene.width = Math.max(1, rect.width);
    scene.height = Math.max(1, rect.height);
    scene.dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(scene.width * scene.dpr);
    canvas.height = Math.round(scene.height * scene.dpr);
    context.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0);
  }

  function spawnMeteor(now) {
    const depth = 0.35 + Math.random() * 0.65;
    scene.meteors.push({
      bornAt: now,
      duration: 850 + Math.random() * 800,
      x: scene.width * (0.65 + Math.random() * 0.55),
      y: scene.height * (0.03 + Math.random() * 0.46),
      distance: scene.width * (0.42 + Math.random() * 0.34),
      drop: scene.height * (0.18 + Math.random() * 0.18),
      depth
    });
  }

  function burstAtSlot(slot) {
    if (!slot?.element) return;
    const rect = slot.element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height * 0.22;
    const count = 16;
    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count;
      const speed = 0.32 + (index % 5) * 0.1;
      scene.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.24,
        bornAt: performance.now(),
        duration: 1500 + (index % 4) * 180,
        radius: 1.2 + (index % 3) * 0.55,
        hue: index % 2 ? "255, 244, 180" : "116, 227, 255"
      });
    }
  }

  function drawSoftParticle(x, y, radius, color, alpha) {
    const outerRadius = Math.max(radius * 4.2, 3);
    const gradient = context.createRadialGradient(x, y, 0, x, y, outerRadius);
    gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
    gradient.addColorStop(0.26, `rgba(${color}, ${alpha * 0.52})`);
    gradient.addColorStop(0.62, `rgba(${color}, ${alpha * 0.16})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, outerRadius, 0, Math.PI * 2);
    context.fill();
  }

  function drawAmbientStars(now) {
    const time = (now - scene.startTime) / 1000;
    scene.ambientStars.forEach((star) => {
      const alpha = star.alpha * (0.65 + Math.sin(time * 0.45 + star.phase) * 0.22);
      const color = star.warm ? "255, 232, 170" : "230, 248, 255";
      drawSoftParticle(star.x * scene.width, star.y * scene.height, star.radius, color, alpha);
    });
  }

  function drawNamedStar(star, now) {
    const time = (now - scene.startTime) / 1000;
    const x = star.x * scene.width;
    const y = star.y * scene.height;
    const pulse = 0.86 + Math.sin(time * 0.55 + star.phase) * 0.14;
    const responsePeriodSeconds = Math.max(8, scene.tanabataStarResponsePeriodSeconds || 35);
    const responsePhaseOffset = star.name === "アルタイル"
      ? (scene.tanabataStarResponsePhaseDeg * Math.PI) / 180
      : 0;
    const response = 0.5 + Math.sin(((Math.PI * 2) / responsePeriodSeconds) * time + responsePhaseOffset) * 0.5;
    const responseGlow = Math.pow(response, 1.7) * scene.tanabataStarResponseIntensity;
    const breath = pulse * (0.92 + responseGlow * 0.24);
    const coreAlpha = Math.min(1, 0.92 * breath);
    const haloAlpha = Math.min(0.72, 0.24 * breath);
    const strokeAlpha = Math.min(1, 0.5 * breath + responseGlow * 0.12);

    drawSoftParticle(x, y, star.radius * (10.5 + responseGlow * 5.5), star.halo, 0.09 * responseGlow);
    drawSoftParticle(x, y, star.radius * 7.5, star.halo, haloAlpha);
    drawSoftParticle(x, y, star.radius * 2.2, star.color, coreAlpha);

    context.save();
    context.strokeStyle = `rgba(${star.color}, ${strokeAlpha})`;
    context.lineWidth = 1.2 + responseGlow * 0.35;
    context.shadowColor = `rgba(${star.halo}, ${0.7 * breath})`;
    context.shadowBlur = 16 + responseGlow * 10;
    context.beginPath();
    context.moveTo(x - star.radius * (5.6 + responseGlow * 1.1), y);
    context.lineTo(x + star.radius * (5.6 + responseGlow * 1.1), y);
    context.moveTo(x, y - star.radius * (5.6 + responseGlow * 1.1));
    context.lineTo(x, y + star.radius * (5.6 + responseGlow * 1.1));
    context.stroke();

    context.restore();
  }

  function drawTanabataStars(now) {
    scene.tanabataStars.forEach((star) => {
      drawNamedStar(star, now);
    });
  }

  function drawMilkyWay(now) {
    const time = (now - scene.startTime) / 1000;
    const bandLength = scene.width * 1.32;
    const bandThickness = scene.height * 0.2;

    context.save();
    context.translate(scene.width * 0.5, scene.height * 0.37);
    context.rotate(-0.18);

    const animatedTime = time * scene.milkyWaySpeed;
    const twinkle = scene.milkyWayTwinkle;
    const sparkleAmount = scene.milkyWaySparkle;
    const slowPulse = Math.sin(animatedTime * 0.32) * 0.12 * twinkle;
    const crossPulse = Math.sin(animatedTime * 0.57 + 1.8) * 0.07 * twinkle;
    const streamPulse = 0.82 + slowPulse + crossPulse;
    const bandGradient = context.createLinearGradient(0, -bandThickness, 0, bandThickness);
    bandGradient.addColorStop(0, "rgba(180, 215, 255, 0)");
    bandGradient.addColorStop(0.18, `rgba(98, 218, 232, ${0.07 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(0.38, `rgba(190, 242, 255, ${0.19 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(0.5, `rgba(255, 250, 222, ${0.25 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(0.62, `rgba(235, 246, 255, ${0.17 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(0.84, `rgba(116, 126, 255, ${0.065 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(1, "rgba(180, 215, 255, 0)");
    context.fillStyle = bandGradient;
    context.beginPath();
    context.ellipse(0, 0, bandLength * 0.5, bandThickness, 0, 0, Math.PI * 2);
    context.fill();

    scene.milkyClouds.forEach((cloud) => {
      const x = (cloud.along - 0.5) * bandLength;
      const y = cloud.offset * bandThickness;
      const pulse = 0.7
        + Math.sin(animatedTime * cloud.pulseSpeed - cloud.along * 7 + cloud.phase) * 0.2 * twinkle
        + Math.sin(animatedTime * (cloud.pulseSpeed * 1.73) + cloud.phase * 0.7) * 0.12 * twinkle;
      const cloudGradient = context.createRadialGradient(x, y, 0, x, y, bandLength * cloud.width * 0.62);
      cloudGradient.addColorStop(0, `rgba(245, 252, 255, ${cloud.alpha * pulse * scene.milkyWayGain})`);
      cloudGradient.addColorStop(0.42, `rgba(119, 232, 255, ${cloud.alpha * 0.62 * pulse * scene.milkyWayGain})`);
      cloudGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = cloudGradient;
      context.beginPath();
      context.ellipse(x, y, bandLength * cloud.width, bandThickness * cloud.height, 0, 0, Math.PI * 2);
      context.fill();
    });

    scene.milkyStars.forEach((star) => {
      const x = (star.along - 0.5) * bandLength;
      const softWiggle = Math.sin(star.along * Math.PI * 6 + star.phase) * 0.12;
      const y = (star.offset + softWiggle) * bandThickness;
      const flow = 0.58 + Math.sin(animatedTime * star.flowSpeed - star.along * 9.5 + star.phase) * 0.28 * twinkle;
      const shimmer = 0.84
        + Math.sin(animatedTime * star.shimmerSpeed + star.phase + star.seed) * 0.16 * twinkle
        + Math.sin(animatedTime * (star.shimmerSpeed * 0.43) + star.phase * 1.7) * 0.08 * twinkle;
      const baseSparklePeriod = Math.max(0.5, scene.milkyWaySparklePeriodSeconds || 2.2);
      const periodVariance = Math.max(0, scene.milkyWaySparklePeriodVariance || 0);
      const sparklePeriod = Math.max(0.35, baseSparklePeriod * (1 + star.sparklePeriodSeed * 0.72 * periodVariance));
      const dutyVariance = star.sparkleDutySeed * 0.22 * periodVariance;
      const sparkleDuty = Math.max(0.03, Math.min(0.86, scene.milkyWaySparkleDutyRatio + dutyVariance));
      const sparkleCycle = ((animatedTime / sparklePeriod) + star.sparklePhase) % 1;
      const sparkleWave = sparkleCycle < sparkleDuty
        ? Math.sin((sparkleCycle / sparkleDuty) * Math.PI)
        : 0;
      const sparkleThreshold = 1 - scene.milkyWaySparkleRatio;
      const sparkleIntensity = Math.max(0.25, 1 + (star.sparkleIntensitySeed * 1.1 * scene.milkyWaySparkleIntensityVariance));
      const sparkle = star.sparkleSeed > sparkleThreshold ? Math.pow(sparkleWave, 7) * sparkleAmount * sparkleIntensity : 0;
      const alpha = Math.min(
        sparkle > 0 ? 1 : 0.94,
        star.alpha * Math.max(0.2, flow) * shimmer * scene.milkyWayGain * (1 + sparkle * 1.55)
      );
      const color = star.warm ? "255, 240, 185" : "226, 250, 255";
      drawSoftParticle(x, y, star.radius * (1 + sparkle * 0.55), color, alpha);
      if (sparkle > 0.12) {
        drawSoftParticle(x, y, star.radius * 2.25, "255, 250, 210", Math.min(0.42, sparkle * 0.28 * scene.milkyWayGain));
      }
    });

    context.restore();
  }

  function drawParticles(now) {
    scene.particles = scene.particles.filter((particle) => {
      const progress = (now - particle.bornAt) / particle.duration;
      if (progress >= 1) return false;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.003;
      const alpha = Math.max(0, 1 - progress);
      drawSoftParticle(
        particle.x,
        particle.y,
        particle.radius * (1 - progress * 0.28),
        particle.hue,
        alpha * 0.82
      );
      return true;
    });
  }

  function drawMeteors(now) {
    if (scene.meteorShowerActive && Math.random() < 0.11) {
      spawnMeteor(now);
    }

    scene.meteors = scene.meteors.filter((meteor) => {
      const progress = (now - meteor.bornAt) / meteor.duration;
      if (progress >= 1) return false;
      const eased = 1 - Math.pow(1 - progress, 3);
      const headX = meteor.x - meteor.distance * eased;
      const headY = meteor.y + meteor.drop * eased;
      const tail = 110 + 210 * meteor.depth;
      const alpha = Math.sin(Math.PI * progress) * (0.36 + meteor.depth * 0.58);
      const gradient = context.createLinearGradient(headX + tail, headY - tail * 0.48, headX, headY);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(0.55, `rgba(120, 235, 255, ${alpha * 0.55})`);
      gradient.addColorStop(1, `rgba(255, 252, 215, ${alpha})`);
      context.strokeStyle = gradient;
      context.lineWidth = 1.2 + meteor.depth * 2.6;
      context.shadowColor = `rgba(135, 236, 255, ${alpha})`;
      context.shadowBlur = 16 + meteor.depth * 16;
      context.beginPath();
      context.moveTo(headX + tail, headY - tail * 0.48);
      context.lineTo(headX, headY);
      context.stroke();
      context.shadowBlur = 0;
      return true;
    });
  }

  function frame(now) {
    context.clearRect(0, 0, scene.width, scene.height);
    drawAmbientStars(now);
    drawMilkyWay(now);
    drawTanabataStars(now);
    drawMeteors(now);
    drawParticles(now);
    window.requestAnimationFrame(frame);
  }

  resize();
  window.requestAnimationFrame(frame);

  return {
    resize,
    setMeteorShowerActive(active) {
      scene.meteorShowerActive = active;
    },
    setMilkyWayGain(value) {
      const gain = Number(value);
      scene.milkyWayGain = Number.isFinite(gain) && gain > 0 ? gain : DEFAULT_MILKY_WAY_PROJECTION_GAIN;
    },
    setMilkyWayParams({
      gain,
      twinkle,
      sparkle,
      speed,
      particleCount,
      sparkleRatio,
      sparklePeriodVariance,
      sparkleIntensityVariance,
      sparklePeriodSeconds,
      sparkleDutyRatio,
      seed,
      tanabataStarResponseIntensity,
      tanabataStarResponsePhaseDeg,
      tanabataStarResponsePeriodSeconds
    } = {}) {
      const nextGain = Number(gain);
      const nextTwinkle = Number(twinkle);
      const nextSparkle = Number(sparkle);
      const nextSpeed = Number(speed);
      const nextParticleCount = Number(particleCount);
      const nextSparkleRatio = Number(sparkleRatio);
      const nextSparklePeriodVariance = Number(sparklePeriodVariance);
      const nextSparkleIntensityVariance = Number(sparkleIntensityVariance);
      const nextSparklePeriodSeconds = Number(sparklePeriodSeconds);
      const nextSparkleDutyRatio = Number(sparkleDutyRatio);
      const nextSeed = String(seed || "tanabata-milky-way").slice(0, 80);
      const nextTanabataStarResponseIntensity = Number(tanabataStarResponseIntensity);
      const nextTanabataStarResponsePhaseDeg = Number(tanabataStarResponsePhaseDeg);
      const nextTanabataStarResponsePeriodSeconds = Number(tanabataStarResponsePeriodSeconds);
      scene.milkyWayGain = Number.isFinite(nextGain) && nextGain > 0 ? nextGain : DEFAULT_MILKY_WAY_PROJECTION_GAIN;
      scene.milkyWayTwinkle = Number.isFinite(nextTwinkle) ? Math.max(0, Math.min(2.5, nextTwinkle)) : 1;
      scene.milkyWaySparkle = Number.isFinite(nextSparkle) ? Math.max(0, Math.min(2.5, nextSparkle)) : 1;
      scene.milkyWaySpeed = Number.isFinite(nextSpeed) ? Math.max(0.2, Math.min(2.5, nextSpeed)) : 1;
      scene.milkyWaySparkleRatio = Number.isFinite(nextSparkleRatio) ? Math.max(0, Math.min(0.25, nextSparkleRatio)) : 0.045;
      scene.milkyWaySparklePeriodVariance = Number.isFinite(nextSparklePeriodVariance)
        ? Math.max(0, Math.min(2.5, nextSparklePeriodVariance))
        : 1;
      scene.milkyWaySparkleIntensityVariance = Number.isFinite(nextSparkleIntensityVariance)
        ? Math.max(0, Math.min(2.5, nextSparkleIntensityVariance))
        : 1;
      scene.milkyWaySparklePeriodSeconds = Number.isFinite(nextSparklePeriodSeconds)
        ? Math.max(0.5, Math.min(8, nextSparklePeriodSeconds))
        : 2.2;
      scene.milkyWaySparkleDutyRatio = Number.isFinite(nextSparkleDutyRatio)
        ? Math.max(0.03, Math.min(0.8, nextSparkleDutyRatio))
        : 0.16;
      scene.tanabataStarResponseIntensity = Number.isFinite(nextTanabataStarResponseIntensity)
        ? Math.max(0, Math.min(3, nextTanabataStarResponseIntensity))
        : 1;
      scene.tanabataStarResponsePhaseDeg = Number.isFinite(nextTanabataStarResponsePhaseDeg)
        ? Math.max(0, Math.min(360, nextTanabataStarResponsePhaseDeg))
        : 166;
      scene.tanabataStarResponsePeriodSeconds = Number.isFinite(nextTanabataStarResponsePeriodSeconds)
        ? Math.max(8, Math.min(90, nextTanabataStarResponsePeriodSeconds))
        : 35;
      const safeParticleCount = Number.isInteger(nextParticleCount) ? Math.max(80, Math.min(720, nextParticleCount)) : 340;
      if (safeParticleCount !== scene.milkyWayParticleCount || nextSeed !== scene.milkyWaySeed) {
        scene.milkyWayParticleCount = safeParticleCount;
        scene.milkyWaySeed = nextSeed;
        scene.milkyStars = createMilkyWayStars(safeParticleCount, nextSeed);
        scene.milkyClouds = createMilkyWayClouds(nextSeed);
      }
    },
    burstAtSlot
  };
}

function getLineCount(wish) {
  return wish?.text ? wish.text.split("\n").length : 1;
}

function getTypingIntervalMs(wishText, maxIntervalMs) {
  const typingIntervalMaxMs = Math.max(1, Number(maxIntervalMs) || DEFAULT_TYPING_INTERVAL_MS);
  const typingIntervalMinMs = Math.max(1, Math.round(typingIntervalMaxMs * TYPE_INTERVAL_MIN_RATIO));
  const length = [...String(wishText || "")].length;
  if (length <= 1) return typingIntervalMaxMs;

  const clampedLength = Math.min(length, TYPE_LENGTH_SLOW_MAX);
  const progress = (clampedLength - 1) / (TYPE_LENGTH_SLOW_MAX - 1);
  const curvedProgress = Math.pow(progress, TYPE_INTERVAL_CURVE);
  return Math.round(
    typingIntervalMaxMs - curvedProgress * (typingIntervalMaxMs - typingIntervalMinMs)
  );
}

function clearSlotTimers(slot) {
  if (slot.typingTimer) {
    clearInterval(slot.typingTimer);
    slot.typingTimer = null;
  }
  if (slot.typingResolve) {
    const resolve = slot.typingResolve;
    slot.typingResolve = null;
    resolve();
  }
  if (slot.leaveTimer) {
    clearTimeout(slot.leaveTimer);
    slot.leaveTimer = null;
  }
  if (slot.leaveResolve) {
    const resolve = slot.leaveResolve;
    slot.leaveResolve = null;
    resolve();
  }
  if (slot.gustTimer) {
    clearTimeout(slot.gustTimer);
    slot.gustTimer = null;
  }
  if (slot.glowTimer) {
    clearTimeout(slot.glowTimer);
    slot.glowTimer = null;
    if (slot.element) {
      slot.element.classList.remove("tanzaku--glowing");
    }
  }
  if (slot.gustAnimation) {
    slot.gustAnimation.cancel();
    slot.gustAnimation = null;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSlotElement(slot) {
  const card = document.createElement("article");
  card.className = `tanzaku tanzaku-${colors[slot.index % colors.length]}`;
  setStylePropertyIfChanged(card, "--x", `${slot.meta.x}`);
  setStylePropertyIfChanged(card, "--y", `${slot.meta.y}`);
  setStylePropertyIfChanged(card, "--z", `${slot.meta.z}`);
  setStylePropertyIfChanged(card, "--delay", slot.meta.delay);
  setStylePropertyIfChanged(card, "--tilt", slot.meta.tilt);
  card.dataset.slotIndex = String(slot.index);
  card.addEventListener("pointerdown", onSlotPointerDown);

  const string = document.createElement("span");
  string.className = "tanzaku-string";

  const text = document.createElement("p");
  text.className = "tanzaku-text";

  card.append(string, text);
  slot.element = card;
  slot.textNode = text;
  updateSlotDepth(slot);
  return card;
}

function updateSlotPosition(slot, x, y, { persist = true } = {}) {
  slot.meta.x = x;
  slot.meta.y = y;
  if (slot.element) {
    setStylePropertyIfChanged(slot.element, "--x", `${x}`);
    setStylePropertyIfChanged(slot.element, "--y", `${y}`);
    syncSlotRenderPosition(slot, { force: true });
  }
  updateSlotDepth(slot);
  syncSlotDomOrder();
  if (persist) {
    saveLayout();
  }
}

function syncSlotDomOrder() {
  const depthOrderedSlots = getDepthOrderedSlots();
  const referenceDepth = getDepthReferenceBaseDepth(depthOrderedSlots);
  const metrics = new Map();
  const getMetric = (slot) => {
    if (!metrics.has(slot)) {
      const depth = getSlotDepth(slot, referenceDepth, depthOrderedSlots);
      const relativeZ = parallaxScene.getRenderOrderRelativeZ(depth, TANZAKU_DEPTH_REFERENCE_NEUTRAL);
      metrics.set(slot, {
        depth,
        relativeZ: Number.isFinite(relativeZ) ? relativeZ : null
      });
    }
    return metrics.get(slot);
  };
  const orderedSlots = slots
    .filter((slot) => slot?.element)
    .sort((a, b) => {
      const activeDiff = Number(isSlotDepthParticipant(a)) - Number(isSlotDepthParticipant(b));
      if (activeDiff) return activeDiff;
      const aMetric = getMetric(a);
      const bMetric = getMetric(b);
      if (aMetric.relativeZ !== null && bMetric.relativeZ !== null) {
        const relativeZDiff = bMetric.relativeZ - aMetric.relativeZ;
        if (Math.abs(relativeZDiff) > 0.0001) return relativeZDiff;
      }
      const depthDiff = aMetric.depth - bMetric.depth;
      const zDiff = a.meta.z - b.meta.z;
      return depthDiff || zDiff || a.index - b.index;
    });
  const orderedElements = orderedSlots.map((slot) => slot.element);
  if (!orderedElements.length) return;
  orderedSlots.forEach((slot, index) => {
    const renderZ = index + 1;
    setStylePropertyIfChanged(slot.element, "--z", `${renderZ}`);
    slot.element.dataset.renderZ = String(renderZ);
  });
  const currentElements = Array.from(stage.children);
  const alreadyOrdered =
    currentElements.length === orderedElements.length &&
    orderedElements.every((element, index) => currentElements[index] === element);
  if (!alreadyOrdered) {
    if (rotationInProgress) {
      pendingSlotDomOrderSync = true;
      return;
    }
    stage.replaceChildren(...orderedElements);
    pendingSlotDomOrderSync = false;
  }
}

function bringSlotToFront(slot) {
  slot.meta.z = nextZOrder++;
  syncSlotDomOrder();
  updateSlotDepth(slot);
}

function isSlotDepthParticipant(slot) {
  return Boolean(
    slot?.element &&
    slot.wish &&
    (slot.mode === "display" || slot.state === "leaving")
  );
}

function getDepthOrderedSlots() {
  return slots
    .filter(isSlotDepthParticipant)
    .sort((a, b) => a.meta.z - b.meta.z);
}

function getSlotBaseDepth(slot, orderedSlots = getDepthOrderedSlots()) {
  if (!isSlotDepthParticipant(slot)) return 0.5;
  if (orderedSlots.length <= 1) return 0.5;
  const orderIndex = orderedSlots.indexOf(slot);
  if (orderIndex === -1) return 0.5;
  return orderIndex / (orderedSlots.length - 1);
}

function getDepthReferenceBaseDepth(orderedSlots = getDepthOrderedSlots()) {
  const referenceSlot = getDepthReferenceSlot(orderedSlots);
  return referenceSlot ? getSlotBaseDepth(referenceSlot, orderedSlots) : 0.5;
}

function getDepthReferenceSlot(orderedSlots = getDepthOrderedSlots()) {
  if (!orderedSlots.length) return null;
  const referenceIndex = projectionSettings.parallaxDepthReferenceIndex;
  const orderIndex = Math.min(Math.max(0, referenceIndex - 1), orderedSlots.length - 1);
  return orderedSlots[orderIndex] || null;
}

function getSlotDepth(slot, referenceDepth = getDepthReferenceBaseDepth(), orderedSlots = getDepthOrderedSlots()) {
  const baseDepth = getSlotBaseDepth(slot, orderedSlots);
  const multiplier = projectionSettings.parallaxDepthMultiplier;
  const depthSpread = baseDepth - referenceDepth;
  return TANZAKU_DEPTH_REFERENCE_NEUTRAL + (depthSpread * multiplier * TANZAKU_DEPTH_VISUAL_GAIN);
}

function getSlotDepthScale(slot, depth = getSlotDepth(slot)) {
  const visualDepth = Math.max(TANZAKU_DEPTH_VISUAL_MIN, Math.min(TANZAKU_DEPTH_VISUAL_MAX, Number.isFinite(depth) ? depth : 0.5));
  return 0.94 + visualDepth * 0.1;
}

function updateSlotDepth(slot, referenceDepth = getDepthReferenceBaseDepth(), orderedSlots = getDepthOrderedSlots()) {
  if (!slot?.element) return;
  const depth = getSlotDepth(slot, referenceDepth, orderedSlots);
  const scale = getSlotDepthScale(slot, depth);
  const visualDepth = Math.max(TANZAKU_DEPTH_VISUAL_MIN, Math.min(TANZAKU_DEPTH_VISUAL_MAX, Number.isFinite(depth) ? depth : 0.5));
  const brightness = 0.86 + visualDepth * 0.18;
  setStylePropertyIfChanged(slot.element, "--depth", depth.toFixed(3));
  setStylePropertyIfChanged(slot.element, "--depth-scale", formatScale(scale));
  setStylePropertyIfChanged(slot.element, "--depth-brightness", brightness.toFixed(3));
}

function parseStyleNumber(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function captureSlotMotionState(slot) {
  const style = slot.element?.style;
  return {
    parallaxX: parseStyleNumber(style?.getPropertyValue("--parallax-x"), 0),
    parallaxY: parseStyleNumber(style?.getPropertyValue("--parallax-y"), 0),
    depthScale: parseStyleNumber(style?.getPropertyValue("--depth-scale"), 1),
    brightness: parseStyleNumber(style?.getPropertyValue("--depth-brightness"), 1)
  };
}

function setSlotMotionState(slot, state) {
  if (!slot?.element || !state) return;
  setStylePropertyIfChanged(slot.element, "--parallax-x", formatPixel(state.parallaxX));
  setStylePropertyIfChanged(slot.element, "--parallax-y", formatPixel(state.parallaxY));
  setStylePropertyIfChanged(slot.element, "--depth-scale", formatScale(state.depthScale));
  setStylePropertyIfChanged(slot.element, "--depth-brightness", state.brightness.toFixed(3));
}

function interpolateSlotMotionState(from, to, progress) {
  return {
    parallaxX: from.parallaxX + ((to.parallaxX - from.parallaxX) * progress),
    parallaxY: from.parallaxY + ((to.parallaxY - from.parallaxY) * progress),
    depthScale: from.depthScale + ((to.depthScale - from.depthScale) * progress),
    brightness: from.brightness + ((to.brightness - from.brightness) * progress)
  };
}

function animateSlotDepthReflow(animatedSlots, updateLayout) {
  const targets = animatedSlots.filter((slot) => slot?.element && slot.wish && slot.mode === "display");
  const before = new Map(targets.map((slot) => [slot, captureSlotMotionState(slot)]));

  updateLayout();

  if (!targets.length) {
    return Promise.resolve();
  }

  const after = new Map(targets.map((slot) => [slot, captureSlotMotionState(slot)]));
  targets.forEach((slot) => {
    slot.depthReflowActive = true;
    setSlotMotionState(slot, before.get(slot));
  });

  return new Promise((resolve) => {
    const startedAt = performance.now();
    const tick = (now) => {
      const linearProgress = Math.min(1, Math.max(0, (now - startedAt) / TANZAKU_DEPTH_REFLOW_MS));
      const progress = 0.5 - (Math.cos(Math.PI * linearProgress) / 2);
      targets.forEach((slot) => {
        setSlotMotionState(
          slot,
          interpolateSlotMotionState(before.get(slot), after.get(slot), progress)
        );
      });

      if (linearProgress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      targets.forEach((slot) => {
        slot.depthReflowActive = false;
        setSlotMotionState(slot, after.get(slot));
      });
      parallaxScene.refresh();
      resolve();
    };

    window.requestAnimationFrame(tick);
  });
}

function glowSlot(slot) {
  if (!slot?.element) return;
  if (slot.glowTimer) {
    clearTimeout(slot.glowTimer);
    slot.glowTimer = null;
  }
  slot.element.classList.add("tanzaku--glowing");
  effectsScene.burstAtSlot(slot);
  slot.glowTimer = setTimeout(() => {
    slot.glowTimer = null;
    if (slot.element) {
      slot.element.classList.remove("tanzaku--glowing");
    }
  }, TANZAKU_GLOW_MS);
}

function getCurrentProjectionPlaneMetrics() {
  return getProjectionPlaneMetricsForMargin(projectionSettings.viewportMargin);
}

function getSlotBounds(slot, position = slot.meta) {
  if (!slot.element) {
    return {
      x: position.x,
      y: position.y,
      width: DEFAULT_TANZAKU_BOUNDS.width,
      height: DEFAULT_TANZAKU_BOUNDS.height
    };
  }

  const rect = slot.element.getBoundingClientRect();
  const plane = getCurrentProjectionPlaneMetrics();
  return {
    x: position.x,
    y: position.y,
    width: (rect.width / plane.width) * 100 || DEFAULT_TANZAKU_BOUNDS.width,
    height: (rect.height / plane.height) * 100 || DEFAULT_TANZAKU_BOUNDS.height
  };
}

function getSlotStringHeightPercent(slot) {
  const string = slot.element?.querySelector(".tanzaku-string");
  if (!string) return 8;

  const rect = string.getBoundingClientRect();
  const plane = getCurrentProjectionPlaneMetrics();
  return (rect.height / plane.height) * 100 || 8;
}

function usesParallaxDisplayPlaneMotion(mode) {
  return mode === "display" || mode === "camera-display";
}

function usesParallaxCameraDepthMotion(mode) {
  return mode === "mapping" || mode === "camera";
}

function getParallaxPlacementReachPercent() {
  if (!projectionSettings.experimentalParallaxEnabled) {
    return { left: 0, right: 0, top: 0, bottom: 0 };
  }

  const viewerDistance = Math.max(0.5, Math.min(PARALLAX_VIEWER_DISTANCE_MAX, projectionSettings.parallaxViewerDistance || 2.5));
  const distanceFactor = 2.5 / viewerDistance;
  const offsetDistanceFactor = Math.max(
    PARALLAX_VIEWER_OFFSET_DISTANCE_MIN,
    Math.min(PARALLAX_VIEWER_OFFSET_DISTANCE_MAX, Math.sqrt(distanceFactor))
  );
  const fixedCameraX = projectionSettings.parallaxViewerOffsetX * PARALLAX_VIEWER_OFFSET_CAMERA_X * offsetDistanceFactor;
  const fixedCameraY = projectionSettings.parallaxViewerOffsetY * PARALLAX_VIEWER_OFFSET_CAMERA_Y * offsetDistanceFactor;
  const dynamicCameraX = PARALLAX_CAMERA_X * projectionSettings.parallaxStrength * distanceFactor;
  const dynamicCameraY = usesParallaxDisplayPlaneMotion(projectionSettings.parallaxMotionMode)
    ? PARALLAX_CAMERA_Y * projectionSettings.parallaxPopoutStrength * distanceFactor
    : 0;
  const dynamicCameraZ = usesParallaxCameraDepthMotion(projectionSettings.parallaxMotionMode)
    ? PARALLAX_CAMERA_Z * projectionSettings.parallaxPopoutStrength * distanceFactor
    : 0;
  const safeZ = Math.max(PARALLAX_CAMERA_NEAR_CLIP_Z, PARALLAX_NEAR_Z - dynamicCameraZ);
  const shiftFactor = (PARALLAX_FOCAL_LENGTH / safeZ) * 50;
  const minCameraX = fixedCameraX - dynamicCameraX;
  const maxCameraX = fixedCameraX + dynamicCameraX;
  const minCameraY = fixedCameraY - dynamicCameraY;
  const maxCameraY = fixedCameraY + dynamicCameraY;
  const minShiftX = -maxCameraX * shiftFactor;
  const maxShiftX = -minCameraX * shiftFactor;
  const minShiftY = -maxCameraY * shiftFactor;
  const maxShiftY = -minCameraY * shiftFactor;
  return {
    left: Math.min(PARALLAX_PLACEMENT_REACH_X_MAX_PERCENT, Math.max(0, maxShiftX)),
    right: Math.min(PARALLAX_PLACEMENT_REACH_X_MAX_PERCENT, Math.max(0, -minShiftX)),
    top: Math.min(PARALLAX_PLACEMENT_REACH_Y_MAX_PERCENT, Math.max(0, maxShiftY)),
    bottom: Math.min(PARALLAX_PLACEMENT_REACH_Y_MAX_PERCENT, Math.max(0, -minShiftY))
  };
}

function getSlotPlacementLimits(
  slot,
  bounds = getSlotBounds(slot),
  stringHeight = getSlotStringHeightPercent(slot),
  { includeMargin = true, allowPartial = true, includeParallaxReach = true } = {}
) {
  const plane = getCurrentProjectionPlaneMetrics();
  const marginX = includeMargin ? (plane.marginPx / plane.width) * 100 : 0;
  const marginY = includeMargin ? (plane.marginPx / plane.height) * 100 : 0;
  const reach = includeParallaxReach ? getParallaxPlacementReachPercent() : { left: 0, right: 0, top: 0, bottom: 0 };
  const visibleWidth = allowPartial ? Math.min(bounds.width, TANZAKU_MIN_VISIBLE_PERCENT) : bounds.width;
  const visibleHeight = allowPartial ? Math.min(bounds.height, TANZAKU_MIN_VISIBLE_PERCENT) : bounds.height;
  const minX = -marginX - reach.left - bounds.width + visibleWidth;
  const maxX = Math.max(minX, 100 + marginX + reach.right - visibleWidth);
  const topEdge = -marginY - reach.top;
  const bottomEdge = 100 + marginY + reach.bottom;
  const fullMinY = Math.max(topEdge, topEdge + stringHeight);
  const minY = allowPartial ? topEdge - bounds.height + visibleHeight : fullMinY;
  const maxY = Math.max(minY, bottomEdge - visibleHeight);
  return { minX, maxX, minY, maxY };
}

function getSafeSlotPosition(slot, position = slot.meta, options = {}) {
  const bounds = getSlotBounds(slot, position);
  const stringHeight = getSlotStringHeightPercent(slot);
  const { minX, maxX, minY, maxY } = getSlotPlacementLimits(slot, bounds, stringHeight, options);
  return {
    x: Number(Math.max(minX, Math.min(maxX, position.x)).toFixed(2)),
    y: Number(Math.max(minY, Math.min(maxY, position.y)).toFixed(2))
  };
}

function syncSlotRenderPosition(slot, { force = false } = {}) {
  if (!slot?.element) return null;
  if (!force && slot.renderPosition) {
    return slot.renderPosition;
  }

  const safePosition = getSafeSlotPosition(slot);
  slot.renderPosition = safePosition;
  setStylePropertyIfChanged(slot.element, "--render-x", `${safePosition.x}`);
  setStylePropertyIfChanged(slot.element, "--render-y", `${safePosition.y}`);
  return safePosition;
}

function getSlotVisualPosition(slot) {
  return slot.renderPosition || getSafeSlotPosition(slot);
}

function getOverlapArea(a, b) {
  const right = Math.min(a.x + a.width, b.x + b.width);
  const left = Math.max(a.x, b.x);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  const top = Math.max(a.y, b.y);
  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

function getPlacementBlockingSlots(targetSlot) {
  return slots.filter((slot) => (
    slot !== targetSlot &&
    slot.wish &&
    slot.mode === "display" &&
    !slot.dragging
  ));
}

function expandBounds(bounds, padding) {
  return {
    x: bounds.x - padding,
    y: bounds.y - padding,
    width: bounds.width + (padding * 2),
    height: bounds.height + (padding * 2)
  };
}

function getCandidatePlacementScore(targetSlot, candidate) {
  const candidateBounds = getSlotBounds(targetSlot, candidate);
  const paddedCandidateBounds = expandBounds(candidateBounds, PLACEMENT_PADDING_PERCENT);
  const safeCandidate = getSafeSlotPosition(targetSlot, candidate, { includeMargin: false, allowPartial: false });
  const normalSafeCandidate = getSafeSlotPosition(targetSlot, candidate, {
    includeMargin: false,
    allowPartial: false,
    includeParallaxReach: false
  });
  const safeShift = Math.abs(candidate.x - safeCandidate.x) + Math.abs(candidate.y - safeCandidate.y);
  const normalAreaShift = projectionSettings.experimentalParallaxEnabled
    ? Math.abs(candidate.x - normalSafeCandidate.x) + Math.abs(candidate.y - normalSafeCandidate.y)
    : 0;
  const centerX = candidate.x + (candidateBounds.width / 2);
  const centerY = candidate.y + (candidateBounds.height / 2);
  const centerDrift = Math.hypot(centerX - 50, centerY - 50) * PLACEMENT_EDGE_WEIGHT;
  return getPlacementBlockingSlots(targetSlot)
    .reduce((score, slot) => {
      const slotBounds = getSlotBounds(slot, getSlotVisualPosition(slot));
      const paddedSlotBounds = expandBounds(slotBounds, PLACEMENT_PADDING_PERCENT);
      const overlap = getOverlapArea(candidateBounds, slotBounds);
      const paddedOverlap = getOverlapArea(paddedCandidateBounds, paddedSlotBounds);
      const dx = centerX - (slotBounds.x + (slotBounds.width / 2));
      const dy = centerY - (slotBounds.y + (slotBounds.height / 2));
      const distance = Math.max(0.1, Math.sqrt((dx * dx) + (dy * dy)));
      return score + (overlap * 100000) + (paddedOverlap * 4200) + (900 / distance);
    }, (safeShift * 100000) + (normalAreaShift * 500) + centerDrift);
}

function createPlacementCandidates(targetSlot) {
  const targetCount = Math.max(
    PLACEMENT_MIN_CANDIDATES,
    Math.ceil(projectionSettings.slotCount * PLACEMENT_CANDIDATE_RATIO)
  );
  const bounds = getSlotBounds(targetSlot);
  const stringHeight = getSlotStringHeightPercent(targetSlot);
  const { minX, maxX, minY, maxY } = getSlotPlacementLimits(targetSlot, bounds, stringHeight, { includeMargin: false, allowPartial: false });
  const rowCount = Math.max(PLACEMENT_ROWS, Math.ceil(targetCount / PLACEMENT_COLUMNS));
  const candidates = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowProgress = rowCount === 1 ? 0.5 : rowIndex / (rowCount - 1);
    const y = minY + ((maxY - minY) * rowProgress);
    const rowOffset = rowIndex % 2 ? 0.5 : 0;

    for (let columnIndex = 0; columnIndex < PLACEMENT_COLUMNS; columnIndex += 1) {
      const columnProgress = PLACEMENT_COLUMNS === 1
        ? 0.5
        : (columnIndex + rowOffset) / (PLACEMENT_COLUMNS - 1);
      const x = minX + ((maxX - minX) * Math.min(1, columnProgress));
      candidates.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2))
      });
    }
  }

  return candidates.slice(0, targetCount);
}

function placeSlotWhereVisible(targetSlot, { force = false } = {}) {
  if (!force && initiallyStoredLayoutIndexes.has(targetSlot.index)) return;

  const best = createPlacementCandidates(targetSlot)
    .map((candidate) => ({
      ...candidate,
      score: getCandidatePlacementScore(targetSlot, candidate)
    }))
    .sort((a, b) => a.score - b.score)[0];

  if (best) {
    updateSlotPosition(targetSlot, best.x, best.y, { persist: false });
  }
}

function refreshSlot(slot) {
  if (!slot.element || !slot.textNode) return;

  const hasWish = Boolean(slot.wish);
  const hidden =
    (slot.mode === "waiting" && slot.state !== "leaving") ||
    slot.state === "pending-enter";

  slot.element.classList.toggle("tanzaku--waiting", slot.mode === "waiting" && slot.state !== "leaving");
  slot.element.classList.toggle("tanzaku--display", slot.mode === "display");
  slot.element.classList.toggle("tanzaku--typing", slot.state === "typing");
  slot.element.classList.toggle("tanzaku--leaving", slot.state === "leaving");
  slot.element.classList.toggle("tanzaku--pending-enter", slot.state === "pending-enter");
  slot.element.classList.toggle("tanzaku--dragging", slot.dragging);
  slot.element.classList.toggle("tanzaku--empty", !hasWish);
  slot.element.style.opacity = hidden || !hasWish ? "0" : "1";
  slot.element.style.pointerEvents = hidden ? "none" : "auto";
  setStylePropertyIfChanged(slot.element, "--x", `${slot.meta.x}`);
  setStylePropertyIfChanged(slot.element, "--y", `${slot.meta.y}`);
  syncSlotRenderPosition(slot);
  updateSlotDepth(slot);
  setStylePropertyIfChanged(slot.element, "--tilt", slot.meta.tilt);

  if (!hasWish) {
    slot.textNode.textContent = "";
    slot.textNode.dataset.lines = "1";
    return;
  }

  if (slot.state !== "typing") {
    slot.textNode.textContent = slot.wish.text;
  }
  slot.textNode.dataset.lines = String(getLineCount(slot.wish));
}

function getSlotTiltValue(slot) {
  return Number.parseFloat(slot.meta.tilt) || 0;
}

function clearSlotGust(slot) {
  if (!slot?.element) return;
  setStylePropertyIfChanged(slot.element, "--gust-x", "0px");
  setStylePropertyIfChanged(slot.element, "--gust-y", "0px");
  setStylePropertyIfChanged(slot.element, "--gust-rotate", "0deg");
}

function createGustController(slot, swing, gustStrength = 1) {
  let frameId = null;
  let cancelled = false;
  const startedAt = performance.now();
  const gustScale = Math.max(0, Number.isFinite(gustStrength) ? gustStrength : 1);
  const gustX = (8 + (slot.meta.y / 100) * 5) * gustScale;
  const gustY = (2 + (slot.meta.y / 100) * 3) * gustScale;
  const gustRotate = -swing * gustScale;
  const attackRatio = 0.28;
  const easeOut = (progress) => 1 - Math.pow(1 - progress, 3);
  const easeInOut = (progress) => 0.5 - (Math.cos(Math.PI * progress) / 2);

  const controller = {
    cancel() {
      cancelled = true;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      clearSlotGust(slot);
    }
  };

  const tick = (now) => {
    if (cancelled || !slot.element) return;
    const progress = Math.min(1, Math.max(0, (now - startedAt) / WIND_GUST_MS));
    const strength = progress < attackRatio
      ? easeOut(progress / attackRatio)
      : 1 - easeInOut((progress - attackRatio) / (1 - attackRatio));
    const recoil = Math.sin(progress * Math.PI * 2) * 0.08 * (1 - progress);
    const adjustedStrength = Math.max(0, strength + recoil);

    setStylePropertyIfChanged(slot.element, "--gust-x", `${(gustX * adjustedStrength).toFixed(2)}px`);
    setStylePropertyIfChanged(slot.element, "--gust-y", `${(gustY * adjustedStrength).toFixed(2)}px`);
    setStylePropertyIfChanged(slot.element, "--gust-rotate", `${(gustRotate * adjustedStrength).toFixed(2)}deg`);

    if (progress < 1) {
      frameId = requestAnimationFrame(tick);
      return;
    }

    clearSlotGust(slot);
    if (slot.gustAnimation === controller) {
      slot.gustAnimation = null;
    }
  };

  frameId = requestAnimationFrame(tick);
  return controller;
}

function playWindGust(slot) {
  if (!slot.element || !slot.wish || slot.mode !== "display" || slot.state === "leaving" || slot.dragging) return;

  if (slot.gustAnimation) {
    slot.gustAnimation.cancel();
    slot.gustAnimation = null;
  }

  const swayStrengthValue = Number(projectionSettings.tanzakuSwayStrength);
  const gustStrengthValue = Number(projectionSettings.windGustStrength);
  const swayStrength = Number.isFinite(swayStrengthValue) ? Math.max(0, swayStrengthValue) : 1;
  const gustStrength = Number.isFinite(gustStrengthValue) ? Math.max(0, gustStrengthValue) : 1;
  const swing = (6.5 + (slot.meta.y / 100) * 1.5) * swayStrength;
  slot.gustAnimation = createGustController(slot, swing, gustStrength);
}

function triggerWindGust() {
  const candidates = getDisplaySlots()
    .filter((slot) => slot.wish)
    .sort((a, b) => (a.meta.x - b.meta.x) || (a.meta.y - b.meta.y));

  if (!candidates.length) return;

  const minX = candidates[0].meta.x;
  const maxX = candidates[candidates.length - 1].meta.x;
  const spread = Math.max(1, maxX - minX);

  candidates.forEach((slot, index) => {
    if (slot.gustTimer) {
      clearTimeout(slot.gustTimer);
      slot.gustTimer = null;
    }

    const normalizedX = (slot.meta.x - minX) / spread;
    const fallbackOrder = candidates.length > 1 ? index / (candidates.length - 1) : 0;
    const waveProgress = maxX === minX ? fallbackOrder : normalizedX;
    const depth = getSlotDepth(slot);
    const windDepth = Math.max(0, Math.min(1, Number.isFinite(depth) ? depth : 0.5));
    const depthDelay = (1 - windDepth) * WIND_DEPTH_STAGGER_MS;
    const delay = Math.round((waveProgress * WIND_SWEEP_MS) + depthDelay);

    slot.gustTimer = setTimeout(() => {
      slot.gustTimer = null;
      playWindGust(slot);
    }, delay);
  });
}

function getWindGustDelayMs() {
  const cycleMs = Math.max(3000, Math.min(60000, Number(projectionSettings.windGustCycleMs) || 30000));
  const jitterSeconds = Math.max(0, Math.min(60, Number(projectionSettings.windGustCycleJitterSeconds) || 0));
  const jitterMs = jitterSeconds > 0 ? Math.round(Math.random() * jitterSeconds * 1000) : 0;
  return cycleMs + jitterMs;
}

function scheduleWindLoopCycle(delayMs) {
  const timeoutId = setTimeout(() => {
    windLoopTimers = windLoopTimers.filter((timerId) => timerId !== timeoutId);
    if (!windLoopStarted) return;
    triggerWindGust();
    scheduleWindLoopCycle(getWindGustDelayMs());
  }, delayMs);
  windLoopTimers.push(timeoutId);
}

function startWindLoop() {
  clearWindLoop();
  windLoopStarted = true;

  const firstDelay = Math.max(0, METEOR_DELAYS_MS[0] - WIND_LEAD_MS);
  scheduleWindLoopCycle(firstDelay);
}

function clearWindLoop() {
  windLoopTimers.forEach((timerId) => {
    clearTimeout(timerId);
    clearInterval(timerId);
  });
  windLoopTimers = [];
  windLoopStarted = false;
}

function restartWindLoop() {
  clearWindLoop();
  startWindLoop();
}

function renderSlots() {
  emptyState.hidden = slots.some((slot) => Boolean(slot.wish));
  slots.forEach((slot) => {
    if (slot.element) {
      refreshSlot(slot);
    }
  });
  syncSlotDomOrder();
  if (!rotationInProgress && pendingSlotDomOrderSync) {
    pendingSlotDomOrderSync = false;
    syncSlotDomOrder();
  }
  parallaxScene.refresh();
}

function mount() {
  syncSlotDomOrder();
  renderSlots();
  saveLayout();
}

function rebuildSlots(wishes = [], options = {}) {
  slots.forEach(clearSlotTimers);
  slots = Array.from({ length: getSlotCount() }, (_, index) => createSlot(index));
  slots.forEach((slot) => buildSlotElement(slot));
  mount();
  seedSlots(wishes, options);
}

function applyProjectionSettings(settings, wishes = []) {
  const nextSettings = normalizeProjectionSettings(settings);
  latestServerProjectionSettings = { ...nextSettings };
  const nextSettingsSignature = getProjectionSettingsSignature(nextSettings);
  const settingsChanged = nextSettingsSignature !== appliedProjectionSettingsSignature;
  const previousDisplayCount = projectionSettings.displayCount;
  const gustSettingsChanged =
    nextSettings.tanzakuSwayStrength !== projectionSettings.tanzakuSwayStrength ||
    nextSettings.windGustStrength !== projectionSettings.windGustStrength ||
    nextSettings.windGustCycleMs !== projectionSettings.windGustCycleMs ||
    nextSettings.windGustCycleJitterSeconds !== projectionSettings.windGustCycleJitterSeconds;
  const slotShapeChanged =
    nextSettings.displayCount !== projectionSettings.displayCount ||
    nextSettings.slotCount !== projectionSettings.slotCount;
  const placementSpaceChanged =
    nextSettings.experimentalParallaxEnabled !== projectionSettings.experimentalParallaxEnabled ||
    nextSettings.parallaxMotionMode !== projectionSettings.parallaxMotionMode ||
    nextSettings.parallaxStrength !== projectionSettings.parallaxStrength ||
    nextSettings.parallaxPopoutStrength !== projectionSettings.parallaxPopoutStrength ||
    nextSettings.parallaxViewerOffsetX !== projectionSettings.parallaxViewerOffsetX ||
    nextSettings.parallaxViewerOffsetY !== projectionSettings.parallaxViewerOffsetY ||
    nextSettings.parallaxViewerDistance !== projectionSettings.parallaxViewerDistance ||
    nextSettings.viewportMargin !== projectionSettings.viewportMargin;
  const addedDisplayStart = initialSeeded && nextSettings.displayCount > previousDisplayCount
    ? previousDisplayCount
    : nextSettings.displayCount;
  projectionSettings = nextSettings;
  if (!settingsChanged) {
    applyLocalProjectionSettings(loadAppearanceSettings());
    return { settingsChanged: false, slotShapeChanged: false };
  }
  appliedProjectionSettingsSignature = nextSettingsSignature;

  effectsScene.setMilkyWayParams({
    gain: projectionSettings.milkyWayGain,
    twinkle: projectionSettings.milkyWayTwinkle,
    sparkle: projectionSettings.milkyWaySparkle,
    speed: projectionSettings.milkyWaySpeed,
    particleCount: projectionSettings.milkyWayParticleCount,
    sparkleRatio: projectionSettings.milkyWaySparkleRatio,
    sparklePeriodVariance: projectionSettings.milkyWaySparklePeriodVariance,
    sparkleIntensityVariance: projectionSettings.milkyWaySparkleIntensityVariance,
    sparklePeriodSeconds: projectionSettings.milkyWaySparklePeriodSeconds,
    sparkleDutyRatio: projectionSettings.milkyWaySparkleDutyRatio,
    seed: projectionSettings.milkyWaySeed,
    tanabataStarResponseIntensity: projectionSettings.tanabataStarResponseIntensity,
    tanabataStarResponsePhaseDeg: projectionSettings.tanabataStarResponsePhaseDeg,
    tanabataStarResponsePeriodSeconds: projectionSettings.tanabataStarResponsePeriodSeconds
  });
  applyAppearanceSettings({
    ...loadAppearanceSettings(),
    fontId: projectionSettings.tanzakuFontId
  });
  document.documentElement.style.setProperty(
    "--tanzaku-ambient-sway-strength",
    Number(projectionSettings.tanzakuAmbientSwayStrength || 0).toFixed(2)
  );
  const nextCloudSettingsSignature = getCloudSettingsSignature(projectionSettings);
  if (nextCloudSettingsSignature !== renderedCloudSettingsSignature) {
    renderCloudLayer();
    renderedCloudSettingsSignature = nextCloudSettingsSignature;
  }
  syncParallaxSceneFromProjectionSettings();
  if (placementSpaceChanged && !slotShapeChanged) {
    slots.forEach((slot) => syncSlotRenderPosition(slot, { force: true }));
  }
  const depthOrderedSlots = getDepthOrderedSlots();
  const depthReference = getDepthReferenceBaseDepth(depthOrderedSlots);
  slots.forEach((slot) => updateSlotDepth(slot, depthReference, depthOrderedSlots));
  syncSlotDomOrder();
  if (gustSettingsChanged) {
    restartWindLoop();
  }

  if (slotShapeChanged) {
    rebuildSlots(wishes, { addedDisplayStart });
  }

  return { settingsChanged: true, slotShapeChanged };
}

function seedSlots(wishes, { addedDisplayStart = projectionSettings.displayCount } = {}) {
  const initial = wishes.slice(0, getSlotCount());
  backlog = wishes.slice(getSlotCount()).reverse();

  slots.forEach((slot, index) => {
    clearSlotTimers(slot);
    slot.mode = index < projectionSettings.displayCount ? "display" : "waiting";
    slot.state = null;
    slot.dragging = false;
    slot.wish = initial[index] || null;
    setSlotTilt(slot, slot.wish, `seed:${index}`);
    slot.rotationOrder = slot.wish ? getSlotCount() - index : null;
    if (slot.mode === "display" && slot.wish && index >= addedDisplayStart) {
      placeSlotWhereVisible(slot, { force: true });
    }
    refreshSlot(slot);
  });

  syncSlotDomOrder();
  nextRotationOrder = getSlotCount() + 1;
  knownApprovedIds = new Set(wishes.map((wish) => wish.id));
  initialSeeded = true;
  saveLayout();
}

function startTyping(slot, wishText) {
  clearSlotTimers(slot);
  slot.state = "typing";
  slot.textNode.textContent = "";
  slot.textNode.dataset.lines = String(wishText.split("\n").length);
  refreshSlot(slot);
  glowSlot(slot);

  const chars = [...wishText];
  if (!chars.length) {
    slot.state = null;
    refreshSlot(slot);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    slot.typingResolve = resolve;
    let index = 0;
    let typedText = "";
    const typingIntervalMs = getTypingIntervalMs(wishText, projectionSettings.typingIntervalMs);
    slot.typingTimer = setInterval(() => {
      typedText += chars[index] || "";
      index += 1;
      slot.textNode.textContent = typedText;
      if (index >= chars.length) {
        clearInterval(slot.typingTimer);
        slot.typingTimer = null;
        slot.typingResolve = null;
        slot.state = null;
        refreshSlot(slot);
        resolve();
      }
    }, typingIntervalMs);
  });
}

function startLeaving(slot, { finalize = true } = {}) {
  clearSlotTimers(slot);
  slot.state = "leaving";
  if (slot.element) {
    slot.element.classList.remove("tanzaku--glowing");
  }
  refreshSlot(slot);

  return new Promise((resolve) => {
    slot.leaveResolve = resolve;
    slot.leaveTimer = setTimeout(() => {
      slot.leaveTimer = null;
      slot.leaveResolve = null;
      if (!finalize) {
        resolve();
        return;
      }
      slot.state = null;
      slot.mode = "waiting";
      slot.dragging = false;
      slot.rotationOrder = slot.wish ? nextRotationOrder : null;
      nextRotationOrder += 1;
      refreshSlot(slot);
      resolve();
    }, LEAVE_ANIMATION_MS);
  });
}

function assignWish(slot, wish, { animate = false } = {}) {
  slot.wish = wish || null;
  if (!wish) {
    refreshSlot(slot);
    return Promise.resolve();
  }

  if (animate && slot.mode === "display") {
    return startTyping(slot, wish.text);
  }

  refreshSlot(slot);
  slot.textNode.textContent = wish.text;
  slot.textNode.dataset.lines = String(getLineCount(wish));
  return Promise.resolve();
}

function getDisplaySlots() {
  return slots.filter((slot) => slot.mode === "display" && slot.state !== "leaving" && !slot.dragging);
}

function getWaitingSlots() {
  return slots.filter((slot) => slot.mode === "waiting" && slot.state !== "leaving");
}

function getVisibleWishIds(excludedSlot = null) {
  return new Set(
    getDisplaySlots()
      .filter((slot) => slot !== excludedSlot && slot.wish)
      .map((slot) => slot.wish.id)
  );
}

function getOldestSlot(candidates) {
  const ordered = candidates
    .filter((slot) => slot.wish)
    .sort((a, b) => (a.rotationOrder ?? Number.MAX_SAFE_INTEGER) - (b.rotationOrder ?? Number.MAX_SAFE_INTEGER));
  return ordered[0] || null;
}

function getOldestDisplaySlot() {
  return getOldestSlot(getDisplaySlots());
}

function getEmptyWaitingSlot() {
  return getWaitingSlots().find((slot) => !slot.wish) || null;
}

function getOldestWaitingSlot() {
  return getOldestSlot(getWaitingSlots()) || getEmptyWaitingSlot();
}

function getBackmostDisplaySlots(count) {
  if (count <= 0) return [];
  const displaySlots = new Set(getDisplaySlots());
  return getDepthOrderedSlots()
    .filter((slot) => displaySlots.has(slot))
    .slice(0, count);
}

function getNextWaitingSlot(excludedWishIds) {
  const waitingSlots = getWaitingSlots();
  return (
    getOldestSlot(waitingSlots.filter((slot) => slot.wish && !excludedWishIds.has(slot.wish.id))) ||
    waitingSlots.find((slot) => !slot.wish) ||
    null
  );
}

function moveDisplaySlotToWaiting(sourceSlot) {
  if (!sourceSlot || sourceSlot.mode !== "display" || !sourceSlot.wish) return;
  return startLeaving(sourceSlot);
}

function pullNextWaitingWish(excludedWishIds) {
  const waitingSlot = getOldestSlot(getWaitingSlots().filter((slot) => (
    slot.wish && !excludedWishIds.has(slot.wish.id)
  )));
  if (waitingSlot?.wish) {
    const wish = waitingSlot.wish;
    waitingSlot.wish = null;
    waitingSlot.rotationOrder = null;
    refreshSlot(waitingSlot);
    excludedWishIds.add(wish.id);
    return wish;
  }

  const wish = pullUniqueFromBacklog(excludedWishIds);
  if (wish) {
    excludedWishIds.add(wish.id);
  }
  return wish;
}

function preparePendingEntry(slot, wish) {
  clearSlotTimers(slot);
  slot.mode = "display";
  slot.state = "pending-enter";
  slot.dragging = false;
  slot.rotationOrder = nextRotationOrder;
  nextRotationOrder += 1;
  slot.wish = wish || null;
  slot.meta.z = nextZOrder++;
  setSlotTilt(slot, wish, "pending");
  refreshSlot(slot);
}

function promoteWaitingSlotToDisplay(targetSlot, wish, { animate = true, foreground = false } = {}) {
  if (!targetSlot) return Promise.resolve();
  targetSlot.mode = "display";
  targetSlot.state = null;
  targetSlot.dragging = false;
  targetSlot.rotationOrder = nextRotationOrder;
  nextRotationOrder += 1;
  targetSlot.wish = wish || null;
  setSlotTilt(targetSlot, wish, foreground ? "new" : "rotate");
  if (foreground) {
    placeSlotWhereVisible(targetSlot, { force: true });
  }
  bringSlotToFront(targetSlot);
  return assignWish(targetSlot, wish, { animate });
}

function pullUniqueFromBacklog(excludedWishIds) {
  const index = backlog.findIndex((wish) => !excludedWishIds.has(wish.id));
  if (index === -1) return null;
  const [wish] = backlog.splice(index, 1);
  return wish;
}

async function introduceNewWish(wish) {
  const target = getEmptyWaitingSlot() || getOldestWaitingSlot();
  const source = getOldestDisplaySlot();

  if (!source) {
    backlog.push(wish);
    return;
  }

  if (!target || source === target) {
    await moveDisplaySlotToWaiting(source);
    await promoteWaitingSlotToDisplay(source, wish, { animate: true, foreground: true });
    return;
  }

  const displacedWish = target.wish;
  if (displacedWish) backlog.unshift(displacedWish);
  await moveDisplaySlotToWaiting(source);
  await promoteWaitingSlotToDisplay(target, wish, { animate: true, foreground: true });
}

async function rotateWindow() {
  const source = getOldestDisplaySlot();
  if (!source) return;

  const visibleWishIds = getVisibleWishIds(source);
  const target = getNextWaitingSlot(visibleWishIds);
  if (!target || source === target) {
    const nextWish = pullUniqueFromBacklog(visibleWishIds);
    if (!nextWish) return;

    await moveDisplaySlotToWaiting(source);
    await promoteWaitingSlotToDisplay(source, nextWish, { animate: true });
    return;
  }

  const nextWish = target.wish || pullUniqueFromBacklog(visibleWishIds) || source.wish;
  if (!nextWish) return;

  await Promise.all([
    moveDisplaySlotToWaiting(source),
    promoteWaitingSlotToDisplay(target, nextWish, { animate: true })
  ]);
}

async function rotateWindows() {
  const sources = getBackmostDisplaySlots(projectionSettings.moveCount);
  if (!sources.length) return;

  const visibleWishIds = new Set(
    getDisplaySlots()
      .filter((slot) => !sources.includes(slot) && slot.wish)
      .map((slot) => slot.wish.id)
  );
  const pairs = sources
    .map((slot) => ({
      slot,
      oldWish: slot.wish,
      nextWish: pullNextWaitingWish(visibleWishIds)
    }))
    .filter((pair) => pair.nextWish);

  if (!pairs.length) return;

  for (const pair of pairs) {
    await startLeaving(pair.slot, { finalize: false });
  }

  const visibleSlots = getDisplaySlots().filter((slot) => !pairs.some((pair) => pair.slot === slot));
  await animateSlotDepthReflow(visibleSlots, () => {
    pairs.forEach((pair) => {
      if (pair.oldWish) {
        backlog.push(pair.oldWish);
      }
      preparePendingEntry(pair.slot, pair.nextWish);
    });
    syncSlotDomOrder();
    parallaxScene.refresh();
  });

  for (const pair of pairs) {
    await startTyping(pair.slot, pair.nextWish.text);
  }
}

function startRotationTimer() {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }

  rotationTimerIntervalMs = projectionSettings.rotateIntervalMs;
  rotationTimer = setInterval(() => {
    if (specialEffectInProgress) return;
    if (rotationInProgress) return;
    rotationInProgress = true;
    rotateWindows()
      .catch(() => {})
      .finally(() => {
        rotationInProgress = false;
        renderSlots();
      });
  }, rotationTimerIntervalMs);
}

function stopRotationTimer() {
  if (!rotationTimer) return;
  clearInterval(rotationTimer);
  rotationTimer = null;
  rotationTimerIntervalMs = null;
}

async function reconcileApprovedWishes(wishes) {
  if (!initialSeeded && !slots.some((slot) => Boolean(slot.wish))) {
    seedSlots(wishes);
    return;
  }

  for (const wish of wishes) {
    if (!knownApprovedIds.has(wish.id)) {
      await introduceNewWish(wish);
      knownApprovedIds.add(wish.id);
    }
  }
}

function ensureRotationStarted(wishes) {
  if (!wishes.length) return;
  if (specialEffectInProgress) return;
  if (!rotationStarted) {
    rotationStarted = true;
    startRotationTimer();
    return;
  }

  if (rotationTimerIntervalMs !== projectionSettings.rotateIntervalMs) {
    startRotationTimer();
  }
}

function createMeteorShowerLayer() {
  const layer = document.createElement("div");
  layer.className = "meteor-shower-field";

  const meteorCount = 26;
  for (let index = 0; index < meteorCount; index += 1) {
    const meteor = document.createElement("span");
    meteor.className = "meteor-shower";
    meteor.style.setProperty("--top", `${5 + ((index * 17) % 70)}vh`);
    meteor.style.setProperty("--left", `${34 + ((index * 23) % 78)}vw`);
    meteor.style.setProperty("--delay", `${(index % 13) * 0.22}s`);
    meteor.style.setProperty("--duration", `${1.2 + (index % 5) * 0.18}s`);
    meteor.style.setProperty("--scale", `${0.65 + (index % 6) * 0.09}`);
    layer.append(meteor);
  }

  return layer;
}

async function playMeteorShowerEffect() {
  if (specialEffectInProgress) return;
  specialEffectInProgress = true;
  rotationInProgress = false;
  stopRotationTimer();
  if (activeDrag) endDrag();

  const layer = createMeteorShowerLayer();
  try {
    document.body.classList.add("projection-effect-active");
    document.body.classList.add("projection-effect-meteor-shower");
    effectsScene.setMeteorShowerActive(true);
    const bridgeStartPromise = wait(EFFECT_BRIDGE_START_MS).then(() => webglEffectsScene.startBridge());
    const bridgeScatterPromise = wait(EFFECT_BRIDGE_SCATTER_START_MS).then(() => webglEffectsScene.startWarp());
    projectionStage.append(layer);

    await wait(EFFECT_LEAVE_START_MS);

    const leavingSlots = getDisplaySlots()
      .filter((slot) => slot.wish)
      .sort((a, b) => (a.rotationOrder ?? 0) - (b.rotationOrder ?? 0));

    const leavePromises = leavingSlots.map((slot, index) => {
      return wait(index * EFFECT_LEAVE_STAGGER_MS).then(() => startLeaving(slot));
    });

    await Promise.all([bridgeStartPromise, bridgeScatterPromise, ...leavePromises]);
    await wait(Math.max(0, METEOR_SHOWER_ACTIVE_MS - EFFECT_LEAVE_START_MS));

    layer.classList.add("meteor-shower-field--ending");
    effectsScene.setMeteorShowerActive(false);
    webglEffectsScene.stop();
    await wait(METEOR_SHOWER_FADE_MS);
  } catch (error) {
    console.warn("Meteor shower effect recovered after an unexpected interruption.", error);
  } finally {
    effectsScene.setMeteorShowerActive(false);
    webglEffectsScene.stop();
    layer.remove();
    document.body.classList.remove("projection-effect-meteor-shower");
    document.body.classList.remove("projection-effect-active");

    specialEffectInProgress = false;
    rotationInProgress = false;
    rotationStarted = false;
    seedSlots(currentWishes);
    renderSlots();
    ensureRotationStarted(currentWishes);
  }
}

async function checkProjectionEffect() {
  if (specialEffectInProgress) return;
  const response = await fetch("/api/projection/effect", { cache: "no-store" });
  const result = await response.json();
  const effect = result.effect;
  if (!effect || effect.id === latestEffectId) return;

  latestEffectId = effect.id;
  if (effect.type === "meteor-shower") {
    await playMeteorShowerEffect();
  }
}

function scheduleProjectionRefresh(reason = "update") {
  if (projectionUpdateTimer) return;
  projectionUpdateTimer = window.setTimeout(async () => {
    projectionUpdateTimer = null;
    try {
      await loadWishes();
      if (reason === "effect" || reason === "update") {
        await checkProjectionEffect();
      }
    } catch {
      // Keep the regular polling fallback alive if the push refresh fails.
    }
  }, 120);
}

function connectProjectionEvents() {
  if (!window.EventSource || projectionEventSource) return;
  const events = new EventSource("/api/projection/events");
  projectionEventSource = events;
  events.addEventListener("update", (event) => {
    let reason = "update";
    try {
      reason = JSON.parse(event.data)?.reason || reason;
    } catch {
      // Ignore malformed event payloads.
    }
    scheduleProjectionRefresh(reason);
  });
  events.addEventListener("error", () => {
    projectionEventSource = null;
    events.close();
    window.setTimeout(connectProjectionEvents, 5000);
  });
}

function onSlotPointerDown(event) {
  const card = event.currentTarget;
  const slot = slots[Number(card.dataset.slotIndex)];
  if (!slot || slot.mode !== "display" || slot.state === "leaving" || !slot.wish) return;

  event.preventDefault();
  const visualPosition = getSlotVisualPosition(slot);

  activeDrag = {
    slot,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: visualPosition.x,
    startY: visualPosition.y
  };

  slot.dragging = true;
  if (slot.gustTimer) {
    clearTimeout(slot.gustTimer);
    slot.gustTimer = null;
  }
  if (slot.gustAnimation) {
    slot.gustAnimation.cancel();
    slot.gustAnimation = null;
  }
  card.classList.add("tanzaku--dragging");
  card.style.transition = "none";
  card.setPointerCapture(event.pointerId);

  window.addEventListener("pointermove", onWindowPointerMove);
  window.addEventListener("pointerup", onWindowPointerEnd, { once: true });
  window.addEventListener("pointercancel", onWindowPointerEnd, { once: true });
}

function onWindowPointerMove(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

  const { slot, startClientX, startClientY, startX, startY } = activeDrag;
  const plane = getCurrentProjectionPlaneMetrics();
  const next = {
    x: startX + (((event.clientX - startClientX) / plane.width) * 100),
    y: startY + (((event.clientY - startClientY) / plane.height) * 100)
  };
  updateSlotPosition(slot, Number(next.x.toFixed(2)), Number(next.y.toFixed(2)), { persist: false });
}

function endDrag() {
  if (!activeDrag) return;

  const { slot } = activeDrag;
  if (slot.element) {
    slot.element.classList.remove("tanzaku--dragging");
    slot.element.style.transition = "";
  }
  slot.dragging = false;
  saveLayout();
  refreshSlot(slot);
  activeDrag = null;
  window.removeEventListener("pointermove", onWindowPointerMove);
}

function onWindowPointerEnd(event) {
  if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;
  endDrag();
}

function updatePerspectiveBoxPositionDuringDrag(x, y) {
  const nextX = normalizePerspectiveBoxCoordinate(x);
  const nextY = normalizePerspectiveBoxCoordinate(y);
  parallaxScene.setPerspectiveBoxPosition(nextX, nextY, { refresh: false });
  if (perspectiveBoxXInput) {
    perspectiveBoxXInput.value = String(nextX);
  }
  if (perspectiveBoxXValue) {
    perspectiveBoxXValue.textContent = nextX.toFixed(2);
  }
  if (perspectiveBoxYInput) {
    perspectiveBoxYInput.value = String(nextY);
  }
  if (perspectiveBoxYValue) {
    perspectiveBoxYValue.textContent = nextY.toFixed(2);
  }
  return { x: nextX, y: nextY };
}

function onPerspectiveBoxPointerDown(event) {
  if (!projectionSettings.experimentalParallaxEnabled || !projectionSettings.parallaxMarkerEnabled) return;
  const handle = event.currentTarget;

  event.preventDefault();
  event.stopPropagation();
  const settings = getCurrentAppearanceSettings();
  activePerspectiveBoxDrag = {
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: settings.perspectiveBoxX,
    startY: settings.perspectiveBoxY,
    currentX: settings.perspectiveBoxX,
    currentY: settings.perspectiveBoxY,
    handle
  };
  parallaxPerspectiveBox?.classList.add("is-dragging");
  handle?.classList.add("is-dragging");
  handle?.setPointerCapture?.(event.pointerId);
  window.addEventListener("pointermove", onPerspectiveBoxPointerMove);
  window.addEventListener("pointerup", onPerspectiveBoxPointerEnd, { once: true });
  window.addEventListener("pointercancel", onPerspectiveBoxPointerEnd, { once: true });
}

function onPerspectiveBoxPointerMove(event) {
  if (!activePerspectiveBoxDrag || event.pointerId !== activePerspectiveBoxDrag.pointerId) return;

  event.preventDefault();
  const plane = getCurrentProjectionPlaneMetrics();
  const nextX = activePerspectiveBoxDrag.startX + (((event.clientX - activePerspectiveBoxDrag.startClientX) / plane.width) * 2);
  const nextY = activePerspectiveBoxDrag.startY + (((event.clientY - activePerspectiveBoxDrag.startClientY) / plane.height) * 2);
  const next = updatePerspectiveBoxPositionDuringDrag(nextX, nextY);
  activePerspectiveBoxDrag.currentX = next.x;
  activePerspectiveBoxDrag.currentY = next.y;
}

function onPerspectiveBoxPointerEnd(event) {
  if (!activePerspectiveBoxDrag || event.pointerId !== activePerspectiveBoxDrag.pointerId) return;

  const handle = activePerspectiveBoxDrag.handle;
  const nextSettings = {
    ...getCurrentAppearanceSettings(),
    perspectiveBoxX: activePerspectiveBoxDrag.currentX,
    perspectiveBoxY: activePerspectiveBoxDrag.currentY
  };
  saveAppearanceSettings(normalizeAppearanceSettings(nextSettings));
  activePerspectiveBoxDrag = null;
  parallaxPerspectiveBox?.classList.remove("is-dragging");
  handle?.classList.remove("is-dragging");
  handle?.releasePointerCapture?.(event.pointerId);
  window.removeEventListener("pointermove", onPerspectiveBoxPointerMove);
  window.removeEventListener("pointerup", onPerspectiveBoxPointerEnd);
  window.removeEventListener("pointercancel", onPerspectiveBoxPointerEnd);
}

if (parallaxBoxDragHandle) {
  parallaxBoxDragHandle.addEventListener("pointerdown", onPerspectiveBoxPointerDown);
}

if (layoutMenuTrigger && layoutMenu) {
  layoutMenuTrigger.setAttribute("aria-haspopup", "menu");
  layoutMenuTrigger.setAttribute("aria-expanded", "false");

  layoutMenuTrigger.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    layoutMenuPointerToggled = true;
    scheduleLayoutMenuToggle();
  });

  layoutMenuTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (layoutMenuPointerToggled) {
      layoutMenuPointerToggled = false;
      return;
    }
    scheduleLayoutMenuToggle();
  });

  layoutMenuTrigger.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    scheduleLayoutMenuToggle();
  });

  layoutMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

if (layoutSaveButton) {
  layoutSaveButton.addEventListener("click", saveLayoutPreset);
}

if (layoutLoadButton) {
  layoutLoadButton.addEventListener("click", applyLayoutPreset);
}

if (layoutClearButton) {
  layoutClearButton.addEventListener("click", clearLayoutPresetValues);
}

if (layoutFullscreenButton) {
  layoutFullscreenButton.addEventListener("click", toggleProjectionFullscreen);
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  updateFullscreenButton();
}

setupAppearanceControls();

document.addEventListener("click", (event) => {
  if (
    layoutMenu?.contains(event.target) ||
    layoutMenuTrigger?.contains(event.target)
  ) {
    return;
  }
  setLayoutMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setLayoutMenuOpen(false);
  }
});

async function loadWishes() {
  const response = await fetch("/api/approved", { cache: "no-store" });
  const result = await response.json();
  const nextWishes = result.wishes || [];
  const nextWishesSignature = getWishesSignature(nextWishes);
  const wishesChanged = nextWishesSignature !== approvedWishesSignature;
  currentWishes = nextWishes;
  if (specialEffectInProgress) {
    return;
  }

  const settingsResult = applyProjectionSettings(result.settings, nextWishes);
  if (settingsResult.slotShapeChanged) {
    approvedWishesSignature = nextWishesSignature;
    renderSlots();
    ensureRotationStarted(nextWishes);
    return;
  }

  if (!wishesChanged) {
    ensureRotationStarted(nextWishes);
    return;
  }

  await reconcileApprovedWishes(nextWishes);
  approvedWishesSignature = nextWishesSignature;
  renderSlots();
  ensureRotationStarted(nextWishes);
}

slots.forEach((slot) => buildSlotElement(slot));
mount();
startWindLoop();
connectProjectionEvents();

setInterval(() => loadWishes().catch(() => {}), REFRESH_INTERVAL_MS);
setInterval(() => checkProjectionEffect().catch(() => {}), EFFECT_POLL_INTERVAL_MS);
function handleProjectionResize() {
  webglEffectsScene.resize();
  effectsScene.resize();
  renderSlots();
}

window.addEventListener("resize", handleProjectionResize);
window.visualViewport?.addEventListener("resize", handleProjectionResize);
loadWishes()
  .then(() => checkProjectionEffect())
  .catch(() => {});
