const stage = document.querySelector("#tanzaku-stage");
const projectionStage = document.querySelector(".projection-stage");
const emptyState = document.querySelector("#empty-state");
const layoutMenuTrigger = document.querySelector("#layout-menu-trigger");
const layoutMenu = document.querySelector("#layout-menu");
const layoutMenuState = document.querySelector("#layout-menu-state");
const layoutSaveButton = document.querySelector("#layout-save-button");
const layoutLoadButton = document.querySelector("#layout-load-button");

const colors = ["ivory", "crimson", "aqua", "violet", "gold", "leaf"];
const DEFAULT_DISPLAY_COUNT = 12;
const DEFAULT_SLOT_COUNT = 15;
const DEFAULT_MOVE_COUNT = 1;
const DEFAULT_TYPING_INTERVAL_MS = 240;
const DEFAULT_ROTATE_INTERVAL_MS = 18000;
const REFRESH_INTERVAL_MS = 7000;
const EFFECT_POLL_INTERVAL_MS = 2500;
const TYPE_INTERVAL_MIN_RATIO = 0.2;
const TYPE_LENGTH_SLOW_MAX = 40;
const TYPE_INTERVAL_CURVE = 2.2;
const LEAVE_ANIMATION_MS = 1100;
const METEOR_SHOWER_ACTIVE_MS = 12000;
const METEOR_SHOWER_FADE_MS = 2600;
const EFFECT_LEAVE_START_MS = 2600;
const EFFECT_LEAVE_STAGGER_MS = 260;
const METEOR_CYCLE_MS = 80000;
const METEOR_DELAYS_MS = [0, 26000, 52000];
const WIND_LEAD_MS = 3200;
const WIND_SWEEP_MS = 2200;
const WIND_GUST_MS = 2200;
const WIND_PIVOT = "50% -18vh";
const LAYOUT_STORAGE_KEY = "tanabataProjectionLayout.v1";
const LAYOUT_PRESET_STORAGE_KEY = "tanabataProjectionLayoutPreset.v1";
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
  rotateIntervalMs: DEFAULT_ROTATE_INTERVAL_MS
};
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

function loadSavedLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getCurrentLayout() {
  return slots.map((slot) => ({
    x: Number(slot.meta.x),
    y: Number(slot.meta.y)
  }));
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
    return parsed;
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
    ? `保存済み ${formatLayoutPresetDate(preset.savedAt)} / ${preset.layout.length}スロット`
    : "保存なし";
}

function saveLayoutPreset() {
  try {
    const preset = {
      savedAt: new Date().toISOString(),
      slotCount: getSlotCount(),
      layout: getCurrentLayout()
    };
    localStorage.setItem(LAYOUT_PRESET_STORAGE_KEY, JSON.stringify(preset));
    updateLayoutMenuState("現在配置を保存しました");
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
  saveLayout();
  updateLayoutMenuState(`${appliedCount}スロットの配置を呼び出しました`);
}

function setLayoutMenuOpen(open) {
  if (!layoutMenu || !layoutMenuTrigger) return;
  layoutMenu.hidden = !open;
  layoutMenuTrigger.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    updateLayoutMenuState();
  }
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

  return {
    displayCount: nextDisplayCount,
    slotCount: nextSlotCount,
    moveCount: Math.min(nextMoveCount, nextDisplayCount),
    typingIntervalMs: nextTypingIntervalMs,
    rotateIntervalMs: nextRotateIntervalMs
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
  return card;
}

function updateSlotPosition(slot, x, y, { persist = true } = {}) {
  slot.meta.x = x;
  slot.meta.y = y;
  if (slot.element) {
    slot.element.style.setProperty("--x", `${x}`);
    slot.element.style.setProperty("--y", `${y}`);
  }
  if (persist) {
    saveLayout();
  }
}

function bringSlotToFront(slot) {
  slot.meta.z = nextZOrder++;
  if (slot.element) {
    slot.element.style.setProperty("--z", `${slot.meta.z}`);
  }
}

function pointerToPercent(clientX, clientY) {
  return {
    x: Math.max(0, Math.min(100, (clientX / window.innerWidth) * 100)),
    y: Math.max(0, Math.min(100, (clientY / window.innerHeight) * 100))
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
  return {
    x: position.x,
    y: position.y,
    width: (rect.width / window.innerWidth) * 100 || DEFAULT_TANZAKU_BOUNDS.width,
    height: (rect.height / window.innerHeight) * 100 || DEFAULT_TANZAKU_BOUNDS.height
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
      { transform: `rotate(${tilt}deg)`, transformOrigin: WIND_PIVOT },
      { transform: `rotate(${tilt + swing}deg)`, transformOrigin: WIND_PIVOT, offset: 0.44 },
      { transform: `rotate(${tilt}deg)`, transformOrigin: WIND_PIVOT }
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
        clearSlotTimers(slot);
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
  projectionStage.append(layer);

  await wait(EFFECT_LEAVE_START_MS);

  const leavingSlots = getDisplaySlots()
    .filter((slot) => slot.wish)
    .sort((a, b) => (a.rotationOrder ?? 0) - (b.rotationOrder ?? 0));

  const leavePromises = leavingSlots.map((slot, index) => {
    return wait(index * EFFECT_LEAVE_STAGGER_MS).then(() => startLeaving(slot));
  });

  await Promise.all(leavePromises);
  await wait(Math.max(0, METEOR_SHOWER_ACTIVE_MS - EFFECT_LEAVE_START_MS));

  layer.classList.add("meteor-shower-field--ending");
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
  layoutMenuTrigger.addEventListener("click", (event) => {
    event.stopPropagation();
    setLayoutMenuOpen(layoutMenu.hidden);
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

document.addEventListener("click", () => {
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

setInterval(() => loadWishes().catch(() => {}), REFRESH_INTERVAL_MS);
setInterval(() => checkProjectionEffect().catch(() => {}), EFFECT_POLL_INTERVAL_MS);
window.addEventListener("resize", renderSlots);
loadWishes()
  .then(() => checkProjectionEffect())
  .catch(() => {});
