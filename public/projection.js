const stage = document.querySelector("#tanzaku-stage");
const projectionStage = document.querySelector(".projection-stage");
const effectsCanvas = document.querySelector("#projection-effects-canvas");
const webglEffectsCanvas = document.querySelector("#projection-webgl-effects-canvas");
const cloudLayer = document.querySelector("#cloud-layer");
const vanishingPointMarker = document.querySelector("#vanishing-point-marker");
const emptyState = document.querySelector("#empty-state");
const layoutMenuTrigger = document.querySelector("#layout-menu-trigger");
const layoutMenu = document.querySelector("#layout-menu");
const layoutMenuState = document.querySelector("#layout-menu-state");
const layoutSaveButton = document.querySelector("#layout-save-button");
const layoutLoadButton = document.querySelector("#layout-load-button");
const tanzakuFontSelect = document.querySelector("#tanzaku-font-select");
const tanzakuFontSizeInput = document.querySelector("#tanzaku-font-size");
const tanzakuFontSizeValue = document.querySelector("#tanzaku-font-size-value");
const oracleBoatSizeInput = document.querySelector("#oracle-boat-size");
const oracleBoatSizeValue = document.querySelector("#oracle-boat-size-value");

const colors = ["ivory", "crimson", "aqua", "violet", "gold", "leaf"];
const tanzakuFontOptions = [
  {
    id: "mincho",
    label: "明朝",
    family: "\"Hiragino Mincho ProN\", \"Yu Mincho\", \"YuMincho\", \"Noto Serif JP\", serif"
  },
  {
    id: "gothic",
    label: "ゴシック",
    family: "\"Hiragino Sans\", \"Yu Gothic\", \"YuGothic\", \"Noto Sans JP\", sans-serif"
  },
  {
    id: "maru",
    label: "丸ゴシック",
    family: "\"Hiragino Maru Gothic ProN\", \"Yu Gothic\", \"YuGothic\", sans-serif"
  },
  {
    id: "kyokasho",
    label: "教科書体",
    family: "\"Yu Kyokasho\", \"Hiragino Mincho ProN\", \"Yu Mincho\", serif"
  },
  {
    id: "brush",
    label: "筆文字風",
    family: "\"Klee\", \"Klee One\", \"Hiragino Mincho ProN\", \"Yu Mincho\", serif"
  }
];
const DEFAULT_DISPLAY_COUNT = 12;
const DEFAULT_SLOT_COUNT = 15;
const DEFAULT_MOVE_COUNT = 1;
const DEFAULT_TYPING_INTERVAL_MS = 240;
const DEFAULT_ROTATE_INTERVAL_MS = 18000;
const REFRESH_INTERVAL_MS = 7000;
const EFFECT_POLL_INTERVAL_MS = 2500;
const PARALLAX_VIEWER_STEP_MS = 4200;
const PARALLAX_CAMERA_X = 0.16;
const PARALLAX_CAMERA_Z = 0.34;
const PARALLAX_FOCAL_LENGTH = 1.65;
const PARALLAX_FAR_Z = 4.8;
const PARALLAX_NEAR_Z = 1.35;
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
const WIND_GUST_MS = 2200;
const WIND_PIVOT = "50% -18vh";
const TANZAKU_GLOW_MS = 3200;
const DEFAULT_MILKY_WAY_PROJECTION_GAIN = 1.75;
const LAYOUT_STORAGE_KEY = "tanabataProjectionLayout.v1";
const LAYOUT_PRESET_STORAGE_KEY = "tanabataProjectionLayoutPreset.v1";
const APPEARANCE_STORAGE_KEY = "tanabataProjectionAppearance.v1";
const DEFAULT_TANZAKU_BOUNDS = { width: 9, height: 42 };
const PLACEMENT_MIN_CANDIDATES = 12;
const PLACEMENT_CANDIDATE_RATIO = 1.2;
const PLACEMENT_COLUMNS = 6;
const PLACEMENT_ROWS = [
  { y: 8, offset: 0 },
  { y: 28, offset: 0.5 },
  { y: 48, offset: 0 }
];

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
  milkyWayGain: DEFAULT_MILKY_WAY_PROJECTION_GAIN,
  cloudCount: 3,
  cloudOriginX: -32,
  cloudOriginY: 12,
  cloudSeed: "tanabata-clouds",
  experimentalParallaxEnabled: false,
  parallaxStrength: 1,
  parallaxMarkerEnabled: false,
  parallaxPopoutStrength: 0,
  viewportMargin: 0
};

function getProjectionPlaneMetricsForMargin(margin) {
  const numericMargin = Number(margin);
  const safeMargin = Math.max(0, Math.min(24, Number.isFinite(numericMargin) ? numericMargin : 0));
  const marginPx = Math.min(window.innerWidth, window.innerHeight) * (safeMargin / 100);
  return {
    marginPx,
    width: Math.max(1, window.innerWidth - (marginPx * 2)),
    height: Math.max(1, window.innerHeight - (marginPx * 2))
  };
}

function getVanishingPointLimitForMargin(margin, axis) {
  return 1;
}

function clampVanishingPointForMargin(value, margin, axis) {
  const limit = getVanishingPointLimitForMargin(margin, axis);
  const safeValue = Number.isFinite(value) ? value : 0;
  return Math.max(-limit, Math.min(limit, safeValue));
}

let nextZOrder = 1;
let slots = Array.from({ length: getSlotCount() }, (_, index) => createSlot(index));

let knownApprovedIds = new Set();
let initialSeeded = false;
let rotationStarted = false;
let rotationInProgress = false;
let rotationTimer = null;
let rotationTimerIntervalMs = null;
let windLoopStarted = false;
let nextRotationOrder = 1;
let backlog = [];
let activeDrag = null;
let currentWishes = [];
let latestEffectId = null;
let specialEffectInProgress = false;
let layoutMenuPointerToggled = false;
let projectionEventSource = null;
let projectionUpdateTimer = null;

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
  return {
    fontId: normalizeTanzakuFontId(settings.fontId),
    fontSize: normalizeTanzakuFontSize(settings.fontSize),
    oracleBoatSize: normalizeOracleBoatSize(settings.oracleBoatSize)
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

function normalizeTanzakuFontSize(value) {
  const size = Number(value);
  if (!Number.isFinite(size)) return 100;
  return Math.max(80, Math.min(140, Math.round(size / 5) * 5));
}

function getTanzakuFontOption(fontId) {
  return tanzakuFontOptions.find((option) => option.id === fontId) || tanzakuFontOptions[0];
}

function applyAppearanceSettings(settings = loadAppearanceSettings()) {
  const fontId = normalizeTanzakuFontId(settings.fontId);
  const fontSize = normalizeTanzakuFontSize(settings.fontSize);
  const oracleBoatSize = normalizeOracleBoatSize(settings.oracleBoatSize);
  const font = getTanzakuFontOption(fontId);

  document.documentElement.style.setProperty("--projection-tanzaku-font-family", font.family);
  document.documentElement.style.setProperty("--projection-tanzaku-font-scale", (fontSize / 100).toFixed(2));
  projectionStage.style.setProperty("--oracle-boat-size", (oracleBoatSize / 100).toFixed(2));

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
}

function syncAppearanceSettingsFromControls() {
  const nextSettings = normalizeAppearanceSettings({
    fontId: normalizeTanzakuFontId(tanzakuFontSelect?.value),
    fontSize: normalizeTanzakuFontSize(tanzakuFontSizeInput?.value),
    oracleBoatSize: normalizeOracleBoatSize(oracleBoatSizeInput?.value)
  });
  applyAppearanceSettings(nextSettings);
  saveAppearanceSettings(nextSettings);
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

  if (tanzakuFontSizeInput) {
    tanzakuFontSizeInput.addEventListener("input", syncAppearanceSettingsFromControls);
    tanzakuFontSizeInput.addEventListener("change", syncAppearanceSettingsFromControls);
  }

  applyAppearanceSettings();
}

function getCurrentLayout() {
  return slots.map((slot) => ({
    x: Number(slot.meta.x),
    y: Number(slot.meta.y)
  }));
}

function getCurrentAppearanceSettings() {
  return normalizeAppearanceSettings({
    fontId: tanzakuFontSelect?.value,
    fontSize: tanzakuFontSizeInput?.value,
    oracleBoatSize: oracleBoatSizeInput?.value
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
    ? `保存済み ${formatLayoutPresetDate(preset.savedAt)} / ${preset.layout.length}スロット / ${preset.appearance ? "表示設定あり" : "配置のみ"}`
    : "保存なし";
}

function saveLayoutPreset() {
  try {
    const preset = {
      savedAt: new Date().toISOString(),
      slotCount: getSlotCount(),
      layout: getCurrentLayout(),
      appearance: getCurrentAppearanceSettings()
    };
    localStorage.setItem(LAYOUT_PRESET_STORAGE_KEY, JSON.stringify(preset));
    updateLayoutMenuState("配置と表示設定を保存しました");
  } catch {
    updateLayoutMenuState("保存できませんでした");
  }
}

function applyLayoutPreset() {
  const preset = loadLayoutPreset();
  if (!preset) {
    updateLayoutMenuState("保存配置がありません");
    return;
  }

  let appliedCount = 0;
  preset.layout.forEach((entry, index) => {
    const slot = slots[index];
    if (!slot || typeof entry?.x !== "number" || typeof entry?.y !== "number") return;
    updateSlotPosition(slot, entry.x, entry.y, { persist: false });
    appliedCount += 1;
  });
  if (preset.appearance) {
    applyAppearanceSettings(preset.appearance);
    saveAppearanceSettings(preset.appearance);
  }
  saveLayout();
  updateLayoutMenuState(`${appliedCount}スロットの配置と表示設定を呼び出しました`);
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
  const milkyWayGain = Number(settings.projectionMilkyWayGain);
  const nextMilkyWayGain = Number.isFinite(milkyWayGain) && milkyWayGain > 0 ? milkyWayGain : DEFAULT_MILKY_WAY_PROJECTION_GAIN;
  const cloudCount = Number(settings.projectionCloudCount);
  const nextCloudCount = Number.isInteger(cloudCount) ? Math.max(0, Math.min(12, cloudCount)) : 3;
  const cloudOriginX = Number(settings.projectionCloudOriginX);
  const nextCloudOriginX = Number.isFinite(cloudOriginX) ? Math.max(-80, Math.min(120, cloudOriginX)) : -32;
  const cloudOriginY = Number(settings.projectionCloudOriginY);
  const nextCloudOriginY = Number.isFinite(cloudOriginY) ? Math.max(-20, Math.min(100, cloudOriginY)) : 12;
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

  return {
    displayCount: nextDisplayCount,
    slotCount: nextSlotCount,
    moveCount: Math.min(nextMoveCount, nextDisplayCount),
    typingIntervalMs: nextTypingIntervalMs,
    rotateIntervalMs: nextRotateIntervalMs,
    milkyWayGain: nextMilkyWayGain,
    cloudCount: nextCloudCount,
    cloudOriginX: nextCloudOriginX,
    cloudOriginY: nextCloudOriginY,
    cloudSeed,
    experimentalParallaxEnabled,
    parallaxStrength: nextParallaxStrength,
    parallaxVanishingPointX: nextParallaxVanishingPointX,
    parallaxVanishingPointY: nextParallaxVanishingPointY,
    parallaxMarkerEnabled,
    parallaxPopoutStrength: nextParallaxPopoutStrength,
    viewportMargin: nextViewportMargin
  };
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
    leaveTimer: null,
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
      tilt: `${((index % 5) - 2) * 3}deg`
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

function renderCloudLayer() {
  if (!cloudLayer) return;

  const random = createSeededRandom(projectionSettings.cloudSeed);
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < projectionSettings.cloudCount; index += 1) {
    const cloud = document.createElement("span");
    cloud.className = "cloud";
    const spreadX = (random() - 0.5) * 36;
    const spreadY = (random() - 0.5) * 48;
    const width = 38 + random() * 28;
    const height = 9 + random() * 8;
    const opacity = 0.36 + random() * 0.34;
    const duration = 46 + random() * 34;
    const delay = -random() * duration;
    const scale = 0.82 + random() * 0.46;
    cloud.style.setProperty("--cloud-x", `${(projectionSettings.cloudOriginX + spreadX).toFixed(2)}vw`);
    cloud.style.setProperty("--cloud-y", `${(projectionSettings.cloudOriginY + spreadY).toFixed(2)}vh`);
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

function createParallaxScene() {
  const path = [
    { x: 0, z: 0 },
    { x: -1, z: 0 },
    { x: 0, z: 0 },
    { x: 1, z: 0 },
    { x: 0, z: 0 },
    { x: 0, z: 1 },
    { x: 0, z: 0 },
    { x: 0, z: -1 },
    { x: 0, z: 0 }
  ];
  const scene = {
    enabled: false,
    startedAt: 0,
    frameRequested: false,
    viewerX: 0,
    viewerZ: 0,
    strength: 1,
    vanishingPointX: 0,
    vanishingPointY: 0,
    popoutStrength: 0,
    viewportMargin: 0,
    markerEnabled: false
  };

  function smooth(value) {
    return value * value * (3 - (2 * value));
  }

  function sample(now) {
    const totalSegments = path.length - 1;
    const elapsed = Number.isFinite(now - scene.startedAt)
      ? (now - scene.startedAt) % (totalSegments * PARALLAX_VIEWER_STEP_MS)
      : 0;
    const segment = Math.min(totalSegments - 1, Math.max(0, Math.floor(elapsed / PARALLAX_VIEWER_STEP_MS)));
    const from = path[segment];
    const to = path[segment + 1];
    if (!from || !to) {
      scene.viewerX = 0;
      scene.viewerZ = 0;
      return;
    }
    const progress = smooth((elapsed - (segment * PARALLAX_VIEWER_STEP_MS)) / PARALLAX_VIEWER_STEP_MS);
    scene.viewerX = from.x + ((to.x - from.x) * progress);
    scene.viewerZ = from.z + ((to.z - from.z) * progress);
  }

  function getLayerZ(depth) {
    return PARALLAX_FAR_Z - ((PARALLAX_FAR_Z - PARALLAX_NEAR_Z) * depth);
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
    const size = axis === "y" ? window.innerHeight : window.innerWidth;
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

  function projectLayer(baseX, baseY, depth) {
    const plane = getProjectionPlaneMetrics();
    const vanishingPoint = getInnerPlaneVanishingPoint(plane);
    const popoutDepth = (depth - 0.5) * scene.popoutStrength;
    const layerZ = Math.max(0.62, getLayerZ(depth) - (popoutDepth * 0.68));
    const cameraX = scene.viewerX * PARALLAX_CAMERA_X * scene.strength;
    const cameraZ = scene.viewerZ * PARALLAX_CAMERA_Z * scene.strength;
    const safeZ = Math.max(0.72, layerZ - cameraZ);
    const worldX = (baseX - vanishingPoint.x) * layerZ / PARALLAX_FOCAL_LENGTH;
    const worldY = (baseY - vanishingPoint.y) * layerZ / PARALLAX_FOCAL_LENGTH;
    const shiftedX = vanishingPoint.x + ((worldX - cameraX) * PARALLAX_FOCAL_LENGTH / safeZ);
    const shiftedY = vanishingPoint.y + (worldY * PARALLAX_FOCAL_LENGTH / safeZ);
    const popoutScale = Math.max(0.72, 1 + (popoutDepth * 0.22));
    const radialX = (baseX - vanishingPoint.x) * plane.width * popoutDepth * 0.09;
    const radialY = (baseY - vanishingPoint.y) * plane.height * popoutDepth * 0.09;
    const scale = (layerZ / safeZ) * popoutScale;
    return {
      offsetXPx: ((shiftedX - baseX) * plane.width * 0.5) + radialX,
      offsetYPx: ((shiftedY - baseY) * plane.height * 0.5) + radialY,
      scale
    };
  }

  function applyViewportMargin() {
    projectionStage.style.setProperty("--projection-margin", `${scene.viewportMargin.toFixed(2)}vmin`);
    projectionStage.style.setProperty("--projection-frame-opacity", scene.markerEnabled && scene.viewportMargin > 0 ? "0.72" : "0");
  }

  function applyVanishingPointMarker() {
    if (!vanishingPointMarker) return;
    const x = ((scene.vanishingPointX + 1) / 2) * window.innerWidth;
    const y = ((scene.vanishingPointY + 1) / 2) * window.innerHeight;
    vanishingPointMarker.style.setProperty("--vanishing-point-marker-left", `${x.toFixed(2)}px`);
    vanishingPointMarker.style.setProperty("--vanishing-point-marker-top", `${y.toFixed(2)}px`);
    vanishingPointMarker.hidden = !(scene.enabled && scene.markerEnabled);
  }

  function applySlot(slot) {
    if (!slot?.element) return;
    const depth = getSlotDepth(slot);
    const baseX = (slot.meta.x - 50) / 50;
    const baseY = (slot.meta.y - 50) / 50;
    const projected = projectLayer(baseX, baseY, depth);
    const depthScale = getSlotDepthScale(slot, depth);
    slot.element.style.setProperty("--parallax-x", `${projected.offsetXPx.toFixed(2)}px`);
    slot.element.style.setProperty("--parallax-y", `${projected.offsetYPx.toFixed(2)}px`);
    slot.element.style.setProperty("--depth-scale", Math.max(0.82, depthScale * projected.scale).toFixed(3));
  }

  function applyBamboo() {
    const foreground = 0.86;
    const rear = 0.62;
    const leftProjected = projectLayer(-0.9, 0.16, foreground);
    const rightProjected = projectLayer(0.86, 0.12, rear);
    projectionStage.style.setProperty("--bamboo-left-parallax-x", `${leftProjected.offsetXPx.toFixed(2)}px`);
    projectionStage.style.setProperty("--bamboo-left-parallax-y", `${leftProjected.offsetYPx.toFixed(2)}px`);
    projectionStage.style.setProperty("--bamboo-right-parallax-x", `${rightProjected.offsetXPx.toFixed(2)}px`);
    projectionStage.style.setProperty("--bamboo-right-parallax-y", `${rightProjected.offsetYPx.toFixed(2)}px`);
    projectionStage.style.setProperty("--bamboo-left-parallax-scale", Math.max(0.9, leftProjected.scale).toFixed(3));
    projectionStage.style.setProperty("--bamboo-right-parallax-scale", Math.max(0.9, rightProjected.scale).toFixed(3));
  }

  function applyOracle() {
    projectionStage.style.setProperty("--viewer-oracle-x", `${(scene.viewerX * 34).toFixed(2)}px`);
    projectionStage.style.setProperty("--viewer-oracle-near", Math.max(0, scene.viewerZ).toFixed(3));
    projectionStage.style.setProperty("--viewer-oracle-far", Math.max(0, -scene.viewerZ).toFixed(3));
  }

  function reset() {
    scene.viewerX = 0;
    scene.viewerZ = 0;
    projectionStage.classList.remove("projection-stage--parallax");
    projectionStage.style.removeProperty("--bamboo-left-parallax-x");
    projectionStage.style.removeProperty("--bamboo-left-parallax-y");
    projectionStage.style.removeProperty("--bamboo-right-parallax-x");
    projectionStage.style.removeProperty("--bamboo-right-parallax-y");
    projectionStage.style.removeProperty("--bamboo-left-parallax-scale");
    projectionStage.style.removeProperty("--bamboo-right-parallax-scale");
    projectionStage.style.removeProperty("--viewer-oracle-x");
    projectionStage.style.removeProperty("--viewer-oracle-near");
    projectionStage.style.removeProperty("--viewer-oracle-far");
    applyViewportMargin();
    applyVanishingPointMarker();
    slots.forEach((slot) => {
      if (!slot.element) return;
      slot.element.style.setProperty("--parallax-x", "0px");
      slot.element.style.setProperty("--parallax-y", "0px");
      updateSlotDepth(slot);
    });
  }

  function frame(now) {
    scene.frameRequested = false;
    if (!scene.enabled) return;
    sample(now);
    projectionStage.classList.add("projection-stage--parallax");
    applyViewportMargin();
    applyVanishingPointMarker();
    applyBamboo();
    applyOracle();
    slots.forEach(applySlot);
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
    setViewportMargin(margin) {
      const nextMargin = Number(margin);
      scene.viewportMargin = Math.max(0, Math.min(24, Number.isFinite(nextMargin) ? nextMargin : 0));
      clampSceneVanishingPoints();
      applyViewportMargin();
      applyVanishingPointMarker();
      this.refresh();
    },
    setMarkerEnabled(enabled) {
      scene.markerEnabled = enabled === true;
      applyVanishingPointMarker();
    },
    refresh() {
      applyViewportMargin();
      applyVanishingPointMarker();
      if (scene.enabled) {
        applyBamboo();
        slots.forEach(applySlot);
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
      burstAtSlot() {}
    };
  }

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return {
      resize() {},
      setMeteorShowerActive() {},
      setMilkyWayGain() {},
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

  const scene = {
    width: 1,
    height: 1,
    dpr: 1,
    startTime: performance.now(),
    milkyWayGain: DEFAULT_MILKY_WAY_PROJECTION_GAIN,
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
        phase: 0.4
      },
      {
        name: "アルタイル",
        x: 0.73,
        y: 0.57,
        radius: 2.8,
        color: "255, 244, 196",
        halo: "255, 218, 130",
        phase: 2.2
      }
    ],
    milkyStars: Array.from({ length: 340 }, (_, index) => {
      const along = seededNoise(index * 19 + 3);
      const coreBias = Math.pow(seededNoise(index * 23 + 11), 2.2);
      const side = centeredNoise(index * 29 + 7) >= 0 ? 1 : -1;
      return {
        along,
        offset: side * coreBias,
        seed: index * 47,
        radius: 0.8 + seededNoise(index * 31 + 5) * 2.15,
        alpha: 0.22 + seededNoise(index * 37 + 13) * 0.5,
        phase: seededNoise(index * 41 + 17) * Math.PI * 2,
        warm: seededNoise(index * 43 + 23) > 0.72
      };
    }),
    milkyClouds: Array.from({ length: 15 }, (_, index) => ({
      along: (index + seededNoise(index * 17 + 5) * 0.7) / 15,
      offset: centeredNoise(index * 31 + 9) * 0.46,
      width: 0.08 + seededNoise(index * 37 + 13) * 0.08,
      height: 0.28 + seededNoise(index * 41 + 3) * 0.32,
      alpha: 0.16 + seededNoise(index * 43 + 19) * 0.1,
      phase: seededNoise(index * 47 + 29) * Math.PI * 2
    }))
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

    drawSoftParticle(x, y, star.radius * 7.5, star.halo, 0.24 * pulse);
    drawSoftParticle(x, y, star.radius * 2.2, star.color, 0.92 * pulse);

    context.save();
    context.strokeStyle = `rgba(${star.color}, ${0.58 * pulse})`;
    context.lineWidth = 1.2;
    context.shadowColor = `rgba(${star.halo}, ${0.7 * pulse})`;
    context.shadowBlur = 16;
    context.beginPath();
    context.moveTo(x - star.radius * 5.6, y);
    context.lineTo(x + star.radius * 5.6, y);
    context.moveTo(x, y - star.radius * 5.6);
    context.lineTo(x, y + star.radius * 5.6);
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

    const streamPulse = 0.74 + Math.sin(time * 0.42) * 0.16;
    const bandGradient = context.createLinearGradient(0, -bandThickness, 0, bandThickness);
    bandGradient.addColorStop(0, "rgba(180, 215, 255, 0)");
    bandGradient.addColorStop(0.18, `rgba(98, 218, 232, ${0.06 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(0.38, `rgba(190, 242, 255, ${0.17 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(0.5, `rgba(255, 250, 222, ${0.22 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(0.62, `rgba(235, 246, 255, ${0.15 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(0.84, `rgba(116, 126, 255, ${0.055 * streamPulse * scene.milkyWayGain})`);
    bandGradient.addColorStop(1, "rgba(180, 215, 255, 0)");
    context.fillStyle = bandGradient;
    context.beginPath();
    context.ellipse(0, 0, bandLength * 0.5, bandThickness, 0, 0, Math.PI * 2);
    context.fill();

    scene.milkyClouds.forEach((cloud) => {
      const x = (cloud.along - 0.5) * bandLength;
      const y = cloud.offset * bandThickness;
      const pulse = 0.68 + Math.sin(time * 0.5 - cloud.along * 7 + cloud.phase) * 0.32;
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
      const flow = 0.55 + Math.sin(time * 0.78 - star.along * 9.5 + star.phase) * 0.3;
      const shimmer = 0.85 + Math.sin(time * 1.7 + star.phase + star.seed) * 0.15;
      const alpha = Math.min(0.92, star.alpha * Math.max(0.18, flow) * shimmer * scene.milkyWayGain);
      const color = star.warm ? "255, 240, 185" : "226, 250, 255";
      drawSoftParticle(x, y, star.radius, color, alpha);
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
  if (slot.leaveTimer) {
    clearTimeout(slot.leaveTimer);
    slot.leaveTimer = null;
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
  card.style.setProperty("--x", `${slot.meta.x}`);
  card.style.setProperty("--y", `${slot.meta.y}`);
  card.style.setProperty("--z", `${slot.meta.z}`);
  card.style.setProperty("--delay", slot.meta.delay);
  card.style.setProperty("--tilt", slot.meta.tilt);
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
    slot.element.style.setProperty("--x", `${x}`);
    slot.element.style.setProperty("--y", `${y}`);
  }
  updateSlotDepth(slot);
  if (persist) {
    saveLayout();
  }
}

function bringSlotToFront(slot) {
  slot.meta.z = nextZOrder++;
  if (slot.element) {
    slot.element.style.setProperty("--z", `${slot.meta.z}`);
  }
  updateSlotDepth(slot);
}

function getSlotDepth(slot) {
  const yDepth = Math.max(0, Math.min(1, slot.meta.y / 78));
  const zDepth = Math.max(0, Math.min(1, slot.meta.z / Math.max(nextZOrder, 1)));
  return Math.max(0, Math.min(1, (yDepth * 0.55) + (zDepth * 0.45)));
}

function getSlotDepthScale(slot, depth = getSlotDepth(slot)) {
  return 0.94 + depth * 0.1;
}

function updateSlotDepth(slot) {
  if (!slot?.element) return;
  const depth = getSlotDepth(slot);
  const scale = getSlotDepthScale(slot, depth);
  const brightness = 0.86 + depth * 0.18;
  slot.element.style.setProperty("--depth", depth.toFixed(3));
  slot.element.style.setProperty("--depth-scale", scale.toFixed(3));
  slot.element.style.setProperty("--depth-brightness", brightness.toFixed(3));
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

function pointerToPercent(clientX, clientY) {
  const marginPx = Math.min(window.innerWidth, window.innerHeight) * (projectionSettings.viewportMargin / 100);
  const width = Math.max(1, window.innerWidth - (marginPx * 2));
  const height = Math.max(1, window.innerHeight - (marginPx * 2));
  return {
    x: Math.max(0, Math.min(100, ((clientX - marginPx) / width) * 100)),
    y: Math.max(0, Math.min(100, ((clientY - marginPx) / height) * 100))
  };
}

function getCurrentProjectionPlaneMetrics() {
  const marginPx = Math.min(window.innerWidth, window.innerHeight) * (projectionSettings.viewportMargin / 100);
  return {
    marginPx,
    width: Math.max(1, window.innerWidth - (marginPx * 2)),
    height: Math.max(1, window.innerHeight - (marginPx * 2))
  };
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

function getOverlapArea(a, b) {
  const right = Math.min(a.x + a.width, b.x + b.width);
  const left = Math.max(a.x, b.x);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  const top = Math.max(a.y, b.y);
  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

function getCandidatePlacementScore(targetSlot, candidate) {
  const candidateBounds = getSlotBounds(targetSlot, candidate);
  return getDisplaySlots()
    .filter((slot) => slot !== targetSlot && slot.wish)
    .reduce((score, slot) => {
      const slotBounds = getSlotBounds(slot);
      const overlap = getOverlapArea(candidateBounds, slotBounds);
      const dx = candidate.x - slot.meta.x;
      const dy = candidate.y - slot.meta.y;
      const distance = Math.sqrt((dx * dx) + (dy * dy));
      return score + (overlap * 1000) - distance;
    }, 0);
}

function createPlacementCandidates() {
  const targetCount = Math.max(
    PLACEMENT_MIN_CANDIDATES,
    Math.ceil(projectionSettings.slotCount * PLACEMENT_CANDIDATE_RATIO)
  );
  const rowCount = Math.max(1, Math.ceil(targetCount / PLACEMENT_COLUMNS));
  const candidates = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = PLACEMENT_ROWS[rowIndex % PLACEMENT_ROWS.length];
    const cycle = Math.floor(rowIndex / PLACEMENT_ROWS.length);
    const y = Math.min(58, row.y + (cycle * 8));

    for (let columnIndex = 0; columnIndex < PLACEMENT_COLUMNS; columnIndex += 1) {
      const columnWidth = 80 / (PLACEMENT_COLUMNS - 1);
      const shiftedColumn = columnIndex + row.offset;
      const x = Math.min(86, 10 + (shiftedColumn * columnWidth));
      candidates.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2))
      });
    }
  }

  return candidates.slice(0, targetCount);
}

function placeSlotWhereVisible(targetSlot) {
  if (initiallyStoredLayoutIndexes.has(targetSlot.index)) return;

  const best = createPlacementCandidates()
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
  const hidden = slot.mode === "waiting" && slot.state !== "leaving";

  slot.element.classList.toggle("tanzaku--waiting", slot.mode === "waiting" && slot.state !== "leaving");
  slot.element.classList.toggle("tanzaku--display", slot.mode === "display");
  slot.element.classList.toggle("tanzaku--typing", slot.state === "typing");
  slot.element.classList.toggle("tanzaku--leaving", slot.state === "leaving");
  slot.element.classList.toggle("tanzaku--dragging", slot.dragging);
  slot.element.classList.toggle("tanzaku--empty", !hasWish);
  slot.element.style.opacity = hidden || !hasWish ? "0" : "1";
  slot.element.style.pointerEvents = hidden ? "none" : "auto";
  slot.element.style.setProperty("--x", `${slot.meta.x}`);
  slot.element.style.setProperty("--y", `${slot.meta.y}`);
  slot.element.style.setProperty("--z", `${slot.meta.z}`);
  updateSlotDepth(slot);

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

function playWindGust(slot) {
  if (!slot.element || !slot.wish || slot.mode !== "display" || slot.state === "leaving" || slot.dragging) return;

  if (slot.gustAnimation) {
    slot.gustAnimation.cancel();
    slot.gustAnimation = null;
  }

  const tilt = getSlotTiltValue(slot);
  const swing = 6.5 + (slot.meta.y / 100) * 1.5;

  slot.gustAnimation = slot.element.animate(
    [
      { transform: `translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0) rotate(${tilt}deg)`, transformOrigin: WIND_PIVOT },
      { transform: `translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0) rotate(${tilt + swing}deg)`, transformOrigin: WIND_PIVOT, offset: 0.44 },
      { transform: `translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0) rotate(${tilt}deg)`, transformOrigin: WIND_PIVOT }
    ],
    {
      duration: WIND_GUST_MS,
      easing: "cubic-bezier(0.22, 0.74, 0.24, 1)",
      fill: "none"
    }
  );

  slot.gustAnimation.onfinish = () => {
    slot.gustAnimation = null;
  };
  slot.gustAnimation.oncancel = () => {
    slot.gustAnimation = null;
  };
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
    const delay = Math.round(waveProgress * WIND_SWEEP_MS);

    slot.gustTimer = setTimeout(() => {
      slot.gustTimer = null;
      playWindGust(slot);
    }, delay);
  });
}

function startWindLoop() {
  if (windLoopStarted) return;
  windLoopStarted = true;

  METEOR_DELAYS_MS.forEach((meteorDelay) => {
    const firstDelay = (meteorDelay - WIND_LEAD_MS + METEOR_CYCLE_MS) % METEOR_CYCLE_MS;
    setTimeout(() => {
      triggerWindGust();
      setInterval(triggerWindGust, METEOR_CYCLE_MS);
    }, firstDelay);
  });
}

function renderSlots() {
  emptyState.hidden = slots.some((slot) => Boolean(slot.wish));
  parallaxScene.refresh();
}

function mount() {
  stage.replaceChildren(...slots.map((slot) => slot.element));
  renderSlots();
  saveLayout();
}

function rebuildSlots(wishes = []) {
  slots.forEach(clearSlotTimers);
  slots = Array.from({ length: getSlotCount() }, (_, index) => createSlot(index));
  slots.forEach((slot) => buildSlotElement(slot));
  mount();
  seedSlots(wishes);
}

function applyProjectionSettings(settings, wishes = []) {
  const nextSettings = normalizeProjectionSettings(settings);
  const slotShapeChanged =
    nextSettings.displayCount !== projectionSettings.displayCount ||
    nextSettings.slotCount !== projectionSettings.slotCount;
  projectionSettings = nextSettings;
  effectsScene.setMilkyWayGain(projectionSettings.milkyWayGain);
  renderCloudLayer();
  parallaxScene.setStrength(projectionSettings.parallaxStrength);
  parallaxScene.setViewportMargin(projectionSettings.viewportMargin);
  parallaxScene.setVanishingPoint(
    projectionSettings.parallaxVanishingPointX,
    projectionSettings.parallaxVanishingPointY
  );
  parallaxScene.setPopoutStrength(projectionSettings.parallaxPopoutStrength);
  parallaxScene.setMarkerEnabled(projectionSettings.parallaxMarkerEnabled);
  parallaxScene.setEnabled(projectionSettings.experimentalParallaxEnabled);

  if (slotShapeChanged) {
    rebuildSlots(wishes);
  }

  return slotShapeChanged;
}

function seedSlots(wishes) {
  const initial = wishes.slice(0, getSlotCount());
  backlog = wishes.slice(getSlotCount()).reverse();

  slots.forEach((slot, index) => {
    clearSlotTimers(slot);
    slot.mode = index < projectionSettings.displayCount ? "display" : "waiting";
    slot.state = null;
    slot.dragging = false;
    slot.wish = initial[index] || null;
    slot.rotationOrder = slot.wish ? getSlotCount() - index : null;
    refreshSlot(slot);
  });

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
    let index = 0;
    const typingIntervalMs = getTypingIntervalMs(wishText, projectionSettings.typingIntervalMs);
    slot.typingTimer = setInterval(() => {
      index += 1;
      slot.textNode.textContent = chars.slice(0, index).join("");
      if (index >= chars.length) {
        clearInterval(slot.typingTimer);
        slot.typingTimer = null;
        slot.state = null;
        refreshSlot(slot);
        resolve();
      }
    }, typingIntervalMs);
  });
}

function startLeaving(slot) {
  clearSlotTimers(slot);
  slot.state = "leaving";
  if (slot.element) {
    slot.element.classList.remove("tanzaku--glowing");
  }
  refreshSlot(slot);

  return new Promise((resolve) => {
    slot.leaveTimer = setTimeout(() => {
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

function promoteWaitingSlotToDisplay(targetSlot, wish, { animate = true, foreground = false } = {}) {
  if (!targetSlot) return Promise.resolve();
  targetSlot.mode = "display";
  targetSlot.state = null;
  targetSlot.dragging = false;
  targetSlot.rotationOrder = nextRotationOrder;
  nextRotationOrder += 1;
  if (foreground) {
    placeSlotWhereVisible(targetSlot);
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

  await moveDisplaySlotToWaiting(source);
  await promoteWaitingSlotToDisplay(target, nextWish, { animate: true });
}

async function rotateWindows() {
  for (let index = 0; index < projectionSettings.moveCount; index += 1) {
    await rotateWindow();
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
  layer.remove();
  document.body.classList.remove("projection-effect-meteor-shower");
  document.body.classList.remove("projection-effect-active");

  specialEffectInProgress = false;
  rotationStarted = false;
  seedSlots(currentWishes);
  renderSlots();
  ensureRotationStarted(currentWishes);
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
  const rect = card.getBoundingClientRect();

  activeDrag = {
    slot,
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top
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

  const { slot, offsetX, offsetY } = activeDrag;
  const x = event.clientX - offsetX;
  const y = event.clientY - offsetY;
  const next = pointerToPercent(x, y);
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
  currentWishes = nextWishes;
  if (specialEffectInProgress) {
    return;
  }

  const settingsChanged = applyProjectionSettings(result.settings, nextWishes);
  if (settingsChanged) {
    renderSlots();
    ensureRotationStarted(nextWishes);
    return;
  }

  await reconcileApprovedWishes(nextWishes);
  renderSlots();
  ensureRotationStarted(nextWishes);
}

slots.forEach((slot) => buildSlotElement(slot));
mount();
startWindLoop();
connectProjectionEvents();

setInterval(() => loadWishes().catch(() => {}), REFRESH_INTERVAL_MS);
setInterval(() => checkProjectionEffect().catch(() => {}), EFFECT_POLL_INTERVAL_MS);
window.addEventListener("resize", () => {
  webglEffectsScene.resize();
  effectsScene.resize();
  renderSlots();
});
loadWishes()
  .then(() => checkProjectionEffect())
  .catch(() => {});
