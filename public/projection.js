const stage = document.querySelector("#tanzaku-stage");
const emptyState = document.querySelector("#empty-state");

const colors = ["ivory", "crimson", "aqua", "violet", "gold", "leaf"];
const DEFAULT_DISPLAY_COUNT = 12;
const DEFAULT_MOVE_COUNT = 1;
const WAITING_COUNT = 3;
const ROTATE_INTERVAL_MS = 18000;
const REFRESH_INTERVAL_MS = 7000;
const TYPE_INTERVAL_MS = 46;
const LEAVE_ANIMATION_MS = 1100;
const METEOR_CYCLE_MS = 80000;
const METEOR_DELAYS_MS = [0, 26000, 52000];
const WIND_LEAD_MS = 3200;
const WIND_SWEEP_MS = 2200;
const WIND_GUST_MS = 2200;
const WIND_PIVOT = "50% -18vh";
const LAYOUT_STORAGE_KEY = "tanabataProjectionLayout.v1";

let savedLayout = loadSavedLayout();
let projectionSettings = {
  displayCount: DEFAULT_DISPLAY_COUNT,
  moveCount: DEFAULT_MOVE_COUNT
};
let slots = Array.from({ length: getSlotCount() }, (_, index) => createSlot(index));

let knownApprovedIds = new Set();
let initialSeeded = false;
let rotationStarted = false;
let windLoopStarted = false;
let backlog = [];
let activeDrag = null;

function loadSavedLayout() {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLayout() {
  try {
    savedLayout = slots.map((slot) => ({ x: slot.meta.x, y: slot.meta.y }));
    localStorage.setItem(
      LAYOUT_STORAGE_KEY,
      JSON.stringify(savedLayout)
    );
  } catch {
    // Ignore storage failures in private mode / kiosk restrictions.
  }
}

function getSlotCount() {
  return projectionSettings.displayCount + WAITING_COUNT;
}

function normalizeProjectionSettings(settings = {}) {
  const displayCount = Number(settings.projectionDisplayCount);
  const nextDisplayCount = Number.isInteger(displayCount) && displayCount > 0 ? displayCount : DEFAULT_DISPLAY_COUNT;
  const moveCount = Number(settings.projectionMoveCount);
  const nextMoveCount = Number.isInteger(moveCount) && moveCount > 0 ? moveCount : DEFAULT_MOVE_COUNT;

  return {
    displayCount: nextDisplayCount,
    moveCount: Math.min(nextMoveCount, nextDisplayCount)
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
    dragging: false,
    meta: {
      x: typeof stored.x === "number" ? stored.x : 8 + ((index * 19) % 84),
      y: typeof stored.y === "number" ? stored.y : 8 + ((index * 23) % 58),
      delay: `${(index % 6) * -0.7}s`,
      tilt: `${((index % 5) - 2) * 3}deg`
    }
  };
}

function getLineCount(wish) {
  return wish?.text ? wish.text.split("\n").length : 1;
}

function pickRandom(items) {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
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

function buildSlotElement(slot) {
  const card = document.createElement("article");
  card.className = `tanzaku tanzaku-${colors[slot.index % colors.length]}`;
  card.style.setProperty("--x", `${slot.meta.x}`);
  card.style.setProperty("--y", `${slot.meta.y}`);
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

function pointerToPercent(clientX, clientY) {
  return {
    x: Math.max(0, Math.min(100, (clientX / window.innerWidth) * 100)),
    y: Math.max(0, Math.min(100, (clientY / window.innerHeight) * 100))
  };
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
  const displayCountChanged = nextSettings.displayCount !== projectionSettings.displayCount;
  projectionSettings = nextSettings;

  if (displayCountChanged) {
    rebuildSlots(wishes);
  }

  return displayCountChanged;
}

function seedSlots(wishes) {
  const initial = wishes.slice(0, getSlotCount());
  backlog = wishes.slice(getSlotCount());

  slots.forEach((slot, index) => {
    clearSlotTimers(slot);
    slot.mode = index < projectionSettings.displayCount ? "display" : "waiting";
    slot.state = null;
    slot.dragging = false;
    slot.wish = initial[index] || null;
    refreshSlot(slot);
  });

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
    return;
  }

  let index = 0;
  slot.typingTimer = setInterval(() => {
    index += 1;
    slot.textNode.textContent = chars.slice(0, index).join("");
    if (index >= chars.length) {
      clearSlotTimers(slot);
      slot.state = null;
      refreshSlot(slot);
    }
  }, TYPE_INTERVAL_MS);
}

function startLeaving(slot) {
  clearSlotTimers(slot);
  slot.state = "leaving";
  refreshSlot(slot);

  slot.leaveTimer = setTimeout(() => {
    slot.state = null;
    slot.mode = "waiting";
    slot.dragging = false;
    refreshSlot(slot);
  }, LEAVE_ANIMATION_MS);
}

function assignWish(slot, wish, { animate = false } = {}) {
  slot.wish = wish || null;
  if (!wish) {
    refreshSlot(slot);
    return;
  }

  if (animate && slot.mode === "display") {
    startTyping(slot, wish.text);
    return;
  }

  refreshSlot(slot);
  slot.textNode.textContent = wish.text;
  slot.textNode.dataset.lines = String(getLineCount(wish));
}

function getDisplaySlots() {
  return slots.filter((slot) => slot.mode === "display" && slot.state !== "leaving" && !slot.dragging);
}

function getWaitingSlots() {
  return slots.filter((slot) => slot.mode === "waiting" && slot.state !== "leaving");
}

function moveDisplaySlotToWaiting(sourceSlot) {
  if (!sourceSlot || sourceSlot.mode !== "display" || !sourceSlot.wish) return;
  startLeaving(sourceSlot);
}

function promoteWaitingSlotToDisplay(targetSlot, wish, animate = true) {
  if (!targetSlot) return;
  targetSlot.mode = "display";
  targetSlot.state = null;
  targetSlot.dragging = false;
  assignWish(targetSlot, wish, { animate });
}

function pullFromBacklog() {
  if (!backlog.length) return null;
  const index = Math.floor(Math.random() * backlog.length);
  return backlog.splice(index, 1)[0];
}

function introduceNewWish(wish) {
  const target = pickRandom(getWaitingSlots());
  const source = pickRandom(getDisplaySlots());

  if (!target || !source || source === target) {
    backlog.push(wish);
    return;
  }

  const displacedWish = target.wish;
  if (displacedWish) backlog.push(displacedWish);

  moveDisplaySlotToWaiting(source);
  promoteWaitingSlotToDisplay(target, wish, true);
}

function rotateWindow() {
  const source = pickRandom(getDisplaySlots());
  const target = pickRandom(getWaitingSlots());
  if (!source || !target || source === target) return;

  const nextWish = target.wish || pullFromBacklog() || source.wish;
  if (!nextWish) return;

  moveDisplaySlotToWaiting(source);
  promoteWaitingSlotToDisplay(target, nextWish, true);
}

function rotateWindows() {
  for (let index = 0; index < projectionSettings.moveCount; index += 1) {
    rotateWindow();
  }
}

function reconcileApprovedWishes(wishes) {
  if (!initialSeeded && !slots.some((slot) => Boolean(slot.wish))) {
    seedSlots(wishes);
    return;
  }

  for (const wish of wishes) {
    if (!knownApprovedIds.has(wish.id)) {
      introduceNewWish(wish);
      knownApprovedIds.add(wish.id);
    }
  }
}

function ensureRotationStarted(wishes) {
  if (rotationStarted || !wishes.length) return;
  rotationStarted = true;
  setInterval(() => {
    rotateWindows();
    renderSlots();
  }, ROTATE_INTERVAL_MS);
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

async function loadWishes() {
  const response = await fetch("/api/approved", { cache: "no-store" });
  const result = await response.json();
  const nextWishes = result.wishes || [];
  const settingsChanged = applyProjectionSettings(result.settings, nextWishes);
  if (settingsChanged) {
    renderSlots();
    ensureRotationStarted(nextWishes);
    return;
  }

  reconcileApprovedWishes(nextWishes);
  renderSlots();
  ensureRotationStarted(nextWishes);
}

slots.forEach((slot) => buildSlotElement(slot));
mount();
startWindLoop();

setInterval(() => loadWishes().catch(() => {}), REFRESH_INTERVAL_MS);
window.addEventListener("resize", renderSlots);
loadWishes().catch(() => {});
