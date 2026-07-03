const keyForm = document.querySelector("#key-form");
const keyInput = document.querySelector("#admin-key");
const lists = {
  pending: document.querySelector("#pending-list"),
  approved: document.querySelector("#approved-list"),
  rejected: document.querySelector("#rejected-list")
};
const pagers = {
  pending: document.querySelector("#pending-pager"),
  approved: document.querySelector("#approved-pager"),
  rejected: document.querySelector("#rejected-pager")
};
const liveState = document.querySelector("#live-state");
const moderationForm = document.querySelector("#moderation-form");
const moderationState = document.querySelector("#moderation-state");
const detailsToggle = document.querySelector("#wish-details-toggle");
const projectionSettingsForm = document.querySelector("#projection-settings-form");
const projectionSettingsState = document.querySelector("#projection-settings-state");
const projectionTypingIntervalInput = document.querySelector("#projection-typing-interval-ms");
const projectionRotateIntervalInput = document.querySelector("#projection-rotate-interval-ms");
const projectionEffectAutoInput = document.querySelector("#projection-effect-auto-enabled");
const projectionEffectIntervalInput = document.querySelector("#projection-effect-interval-ms");
const projectionDisplayCountInput = document.querySelector("#projection-display-count");
const projectionSlotCountInput = document.querySelector("#projection-slot-count");
const projectionMoveCountInput = document.querySelector("#projection-move-count");
const projectionMilkyWayGainInput = document.querySelector("#projection-milky-way-gain");
const projectionCloudCountInput = document.querySelector("#projection-cloud-count");
const projectionCloudOriginXInput = document.querySelector("#projection-cloud-origin-x");
const projectionCloudOriginYInput = document.querySelector("#projection-cloud-origin-y");
const projectionCloudSeedInput = document.querySelector("#projection-cloud-seed");
const projectionExperimentalParallaxInput = document.querySelector("#projection-experimental-parallax-enabled");
const projectionParallaxMarkerInput = document.querySelector("#projection-parallax-marker-enabled");
const projectionParallaxStrengthInput = document.querySelector("#projection-parallax-strength");
const projectionParallaxPopoutStrengthInput = document.querySelector("#projection-parallax-popout-strength");
const projectionViewportMarginInput = document.querySelector("#projection-viewport-margin");
const projectionParallaxVanishingPointXInput = document.querySelector("#projection-parallax-vanishing-point-x");
const projectionParallaxVanishingPointYInput = document.querySelector("#projection-parallax-vanishing-point-y");
const projectionParallaxStrengthValue = document.querySelector("#projection-parallax-strength-value");
const projectionParallaxPopoutStrengthValue = document.querySelector("#projection-parallax-popout-strength-value");
const projectionViewportMarginValue = document.querySelector("#projection-viewport-margin-value");
const projectionParallaxVanishingPointXValue = document.querySelector("#projection-parallax-vanishing-point-x-value");
const projectionParallaxVanishingPointYValue = document.querySelector("#projection-parallax-vanishing-point-y-value");
const projectionEffectsForm = document.querySelector("#projection-effects-form");
const projectionEffectsState = document.querySelector("#projection-effects-state");
const projectionPresetCards = document.querySelectorAll("[data-projection-preset]");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");
const backupState = document.querySelector("#backup-state");
const backupList = document.querySelector("#backup-list");
const backupCreateButton = document.querySelector("#backup-create-button");
const backupRefreshButton = document.querySelector("#backup-refresh-button");
const fieldOverviewState = document.querySelector("#field-overview-state");
const fieldStats = document.querySelector("#field-stats");
const bulkApprovePendingButton = document.querySelector("#bulk-approve-pending-button");
const bulkRejectPendingButton = document.querySelector("#bulk-reject-pending-button");
const PAGE_SIZE = 8;

let adminKey = localStorage.getItem("tanabataAdminKey") || "";
let eventSource = null;
let wishDetailsVisible = localStorage.getItem("tanabataAdminWishDetails") === "true";
let projectionSettingsDirty = false;
let projectionParallaxPreviewTimer = null;
let projectionParallaxPreviewRequestId = 0;
let activeAdminTab = localStorage.getItem("tanabataAdminTab") || "connection";
const pages = {
  pending: 1,
  approved: 1,
  rejected: 1
};
keyInput.value = adminKey;
if (detailsToggle) {
  detailsToggle.checked = wishDetailsVisible;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": adminKey,
      ...(options.headers || {})
    }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "操作に失敗しました。");
  }
  return result;
}

function setModerationState(text) {
  if (moderationState) {
    moderationState.textContent = text;
  }
}

function setProjectionSettingsState(text) {
  if (projectionSettingsState) {
    projectionSettingsState.textContent = text;
  }
}

function formatSliderValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2).replace(/\.?0+$/, "") : "0";
}

function clampNumber(value, min, max, fallback = min) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function syncProjectionVanishingPointRanges() {
  if (
    !projectionParallaxVanishingPointXInput ||
    !projectionParallaxVanishingPointYInput
  ) return;

  const serverMin = Number(projectionParallaxVanishingPointXInput.dataset.serverMin ?? -3);
  const serverMax = Number(projectionParallaxVanishingPointXInput.dataset.serverMax ?? 3);
  const serverLimit = Math.max(
    Number.isFinite(serverMin) ? Math.abs(serverMin) : 3,
    Number.isFinite(serverMax) ? Math.abs(serverMax) : 3,
    1
  );
  const limit = Math.min(serverLimit, 1);
  const min = -limit;
  const max = limit;

  [projectionParallaxVanishingPointXInput, projectionParallaxVanishingPointYInput].forEach((input) => {
    input.min = min.toFixed(2);
    input.max = max.toFixed(2);
    input.value = String(clampNumber(input.value, min, max, 0));
  });
}

function syncProjectionSliderOutputs() {
  syncProjectionVanishingPointRanges();
  if (projectionParallaxStrengthValue && projectionParallaxStrengthInput) {
    projectionParallaxStrengthValue.textContent = formatSliderValue(projectionParallaxStrengthInput.value);
  }
  if (projectionParallaxPopoutStrengthValue && projectionParallaxPopoutStrengthInput) {
    projectionParallaxPopoutStrengthValue.textContent = formatSliderValue(projectionParallaxPopoutStrengthInput.value);
  }
  if (projectionViewportMarginValue && projectionViewportMarginInput) {
    projectionViewportMarginValue.textContent = formatSliderValue(projectionViewportMarginInput.value);
  }
  if (projectionParallaxVanishingPointXValue && projectionParallaxVanishingPointXInput) {
    projectionParallaxVanishingPointXValue.textContent = formatSliderValue(projectionParallaxVanishingPointXInput.value);
  }
  if (projectionParallaxVanishingPointYValue && projectionParallaxVanishingPointYInput) {
    projectionParallaxVanishingPointYValue.textContent = formatSliderValue(projectionParallaxVanishingPointYInput.value);
  }
}

function setProjectionEffectsState(text) {
  if (projectionEffectsState) {
    projectionEffectsState.textContent = text;
  }
}

function presetSummary(preset) {
  if (!preset?.settings) return "";
  const settings = preset.settings;
  return `スロット ${settings.projectionSlotCount} / 表示 ${settings.projectionDisplayCount} / 移動 ${settings.projectionMoveCount} / 文字 ${settings.projectionTypingIntervalMs}ms / 間隔 ${settings.projectionRotateIntervalMs}ms / 天の川 ${settings.projectionMilkyWayGain} / 雲 ${settings.projectionCloudCount} / 視差 ${settings.projectionExperimentalParallaxEnabled ? "ON" : "OFF"} / 強度 ${settings.projectionParallaxStrength} / 飛び出し ${settings.projectionParallaxPopoutStrength ?? 0} / 余白 ${settings.projectionViewportMargin ?? 0} / 消失点 ${settings.projectionParallaxVanishingPointX},${settings.projectionParallaxVanishingPointY}`;
}

function renderProjectionPresets(presets = []) {
  projectionPresetCards.forEach((card) => {
    const index = Number(card.dataset.projectionPreset);
    const preset = presets[index] || null;
    const state = card.querySelector(".projection-preset-state");
    const loadButton = card.querySelector("button[data-preset-action='load']");
    const clearButton = card.querySelector("button[data-preset-action='clear']");
    card.classList.toggle("projection-preset--saved", Boolean(preset));
    card.classList.toggle("projection-preset--empty", !preset);
    if (state) {
      state.textContent = preset
        ? `保存済み ${formatDate(preset.savedAt)} / ${presetSummary(preset)}`
        : "未保存";
    }
    if (loadButton) loadButton.disabled = !preset;
    if (clearButton) clearButton.disabled = !preset;
  });
}

function setBackupState(text) {
  if (backupState) {
    backupState.textContent = text;
  }
}

function setFieldOverviewState(text) {
  if (fieldOverviewState) {
    fieldOverviewState.textContent = text;
  }
}

function modeLabel(mode) {
  return {
    manual: "手動確認",
    auto: "自動承認",
    ai: "AI自動モデレート"
  }[mode] || "未設定";
}

function makeButton(label, action, status) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.action = action;
  if (status) button.dataset.status = status;
  return button;
}

function makePagerButton(label, status, page, disabled) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.pageStatus = status;
  button.dataset.page = String(page);
  button.disabled = disabled;
  return button;
}

function setActiveAdminTab(tabName) {
  activeAdminTab = tabName;
  localStorage.setItem("tanabataAdminTab", tabName);
  adminTabs.forEach((button) => {
    const active = button.dataset.adminTab === tabName;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  adminPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.adminPanel === tabName);
  });
  if (tabName === "backup") {
    refreshBackups().catch(() => {});
  }
}

function setWishDetailsVisible(visible) {
  wishDetailsVisible = Boolean(visible);
  localStorage.setItem("tanabataAdminWishDetails", String(wishDetailsVisible));
  if (detailsToggle) {
    detailsToggle.checked = wishDetailsVisible;
  }
  document.body.dataset.adminWishDetails = wishDetailsVisible ? "visible" : "hidden";
}

function renderPager(status, total, currentPage, totalPages) {
  const root = pagers[status];
  if (!root) return;

  root.textContent = "";
  if (totalPages <= 1) return;

  const prev = makePagerButton("前へ", status, currentPage - 1, currentPage <= 1);
  const next = makePagerButton("次へ", status, currentPage + 1, currentPage >= totalPages);

  const info = document.createElement("span");
  info.className = "admin-pager-info";
  info.textContent = `${currentPage} / ${totalPages}（全${total}件）`;

  root.append(prev, info, next);
}

function renderList(status, wishes) {
  const root = lists[status];
  root.textContent = "";
  const totalPages = Math.max(1, Math.ceil(wishes.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(pages[status] || 1, 1), totalPages);
  pages[status] = currentPage;

  if (!wishes.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "該当なし";
    root.append(empty);
    renderPager(status, 0, 1, 1);
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleWishes = wishes.slice(start, start + PAGE_SIZE);

  visibleWishes.forEach((wish) => {
    const item = document.createElement("article");
    item.className = "admin-wish";
    item.dataset.id = wish.id;

    const text = document.createElement("p");
    text.className = "admin-wish-text";
    text.textContent = wish.text;

    const meta = document.createElement("p");
    meta.className = "admin-wish-meta";
    const moderationNote = wish.moderation?.reason ? ` / ${wish.moderation.reason}` : "";
    meta.textContent = `投稿 ${formatDate(wish.createdAt)}${wish.approvedAt ? ` / 承認 ${formatDate(wish.approvedAt)}` : ""}${moderationNote}`;
    meta.hidden = !wishDetailsVisible;

    const actions = document.createElement("div");
    actions.className = "admin-actions";
    if (status !== "approved") actions.append(makeButton("承認", "status", "approved"));
    if (status !== "pending") actions.append(makeButton("保留", "status", "pending"));
    if (status !== "rejected") actions.append(makeButton("非表示", "status", "rejected"));
    actions.append(makeButton("削除", "delete"));

    item.append(text, meta, actions);
    root.append(item);
  });

  renderPager(status, wishes.length, currentPage, totalPages);
}

function statusSummary(byStatus = {}) {
  const pending = byStatus.pending || 0;
  const approved = byStatus.approved || 0;
  const rejected = byStatus.rejected || 0;
  return `承認待ち ${pending} / 投影中 ${approved} / 非表示 ${rejected}`;
}

function countWishesByStatus(wishes = []) {
  return wishes.reduce((counts, wish) => {
    counts[wish.status] = (counts[wish.status] || 0) + 1;
    return counts;
  }, {});
}

function minutesSince(value) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
}

function formatElapsedMinutes(minutes) {
  if (minutes === null) return "なし";
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}時間${rest}分前` : `${hours}時間前`;
}

function makeFieldStat(label, value, tone = "") {
  const item = document.createElement("article");
  item.className = "field-stat";
  if (tone) item.dataset.tone = tone;

  const title = document.createElement("span");
  title.className = "field-stat-label";
  title.textContent = label;

  const number = document.createElement("strong");
  number.className = "field-stat-value";
  number.textContent = value;

  item.append(title, number);
  return item;
}

function renderFieldOverview(wishes = [], settings = {}) {
  if (!fieldStats) return;

  const counts = countWishesByStatus(wishes);
  const pending = counts.pending || 0;
  const approved = counts.approved || 0;
  const rejected = counts.rejected || 0;
  const cautionPending = wishes.filter((wish) => {
    return wish.status === "pending" && wish.moderation?.reason && wish.moderation.reason !== "手動確認待ち";
  }).length;
  const latestWish = [...wishes].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];
  const oldestPending = wishes
    .filter((wish) => wish.status === "pending")
    .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))[0];
  const latestMinutes = minutesSince(latestWish?.createdAt);
  const waitingMinutes = minutesSince(oldestPending?.createdAt);

  fieldStats.textContent = "";
  fieldStats.append(
    makeFieldStat("承認待ち", `${pending}件`, pending ? "warn" : "ok"),
    makeFieldStat("投影中", `${approved}件`, approved ? "ok" : ""),
    makeFieldStat("非表示", `${rejected}件`),
    makeFieldStat("注意つき", `${cautionPending}件`, cautionPending ? "danger" : "ok"),
    makeFieldStat("最終投稿", formatElapsedMinutes(latestMinutes)),
    makeFieldStat("最長待ち", formatElapsedMinutes(waitingMinutes), waitingMinutes >= 10 ? "warn" : "")
  );

  if (bulkApprovePendingButton) {
    bulkApprovePendingButton.disabled = pending === 0;
  }
  if (bulkRejectPendingButton) {
    bulkRejectPendingButton.disabled = pending === 0;
  }

  const mode = modeLabel(settings.moderationMode);
  setFieldOverviewState(`${mode} / 合計 ${wishes.length}件 / 承認待ち ${pending}件`);
}

function renderBackups(backups = []) {
  if (!backupList) return;

  backupList.textContent = "";
  if (!backups.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "バックアップはまだありません";
    backupList.append(empty);
    setBackupState("0件");
    return;
  }

  backups.forEach((backup) => {
    const item = document.createElement("article");
    item.className = "backup-item";

    const title = document.createElement("h3");
    title.textContent = formatDate(backup.createdAt) || backup.revision;

    const meta = document.createElement("p");
    meta.className = "admin-wish-meta";
    meta.textContent = `リビジョン ${backup.revision} / ${backup.wishCount}件 / ${statusSummary(backup.byStatus)} / ${backup.reason}`;

    const actions = document.createElement("div");
    actions.className = "admin-actions";
    const restoreButton = document.createElement("button");
    restoreButton.type = "button";
    restoreButton.textContent = "復元";
    restoreButton.dataset.backupRestore = backup.revision;
    actions.append(restoreButton);

    item.append(title, meta, actions);
    backupList.append(item);
  });

  setBackupState(`${backups.length}件`);
}

async function refreshBackups() {
  if (!adminKey) return;
  const { backups } = await api("/api/admin/backups");
  renderBackups(backups || []);
}

async function refresh() {
  if (!adminKey) return;
  const [{ wishes }, { settings }] = await Promise.all([
    api("/api/wishes"),
    api("/api/admin/settings")
  ]);
  renderModerationSettings(settings);
  renderFieldOverview(wishes, settings);
  renderProjectionSettings(settings, { force: false });
  renderList("pending", wishes.filter((wish) => wish.status === "pending"));
  renderList("approved", wishes.filter((wish) => wish.status === "approved"));
  renderList("rejected", wishes.filter((wish) => wish.status === "rejected"));
  if (activeAdminTab === "backup") {
    await refreshBackups();
  }
}

function renderModerationSettings(settings) {
  if (!moderationForm || !settings) return;

  moderationForm.querySelectorAll("input[name='moderation-mode']").forEach((input) => {
    input.checked = input.value === settings.moderationMode;
    input.disabled = input.value === "ai" && !settings.aiAvailable;
  });

  const aiNote = settings.aiAvailable ? "" : " / AIは未設定";
  setModerationState(`${modeLabel(settings.moderationMode)}${aiNote}`);
}

function renderProjectionSettings(settings, { force = false } = {}) {
  if (
    !projectionSettingsForm ||
    !projectionTypingIntervalInput ||
    !projectionRotateIntervalInput ||
    !projectionEffectAutoInput ||
    !projectionEffectIntervalInput ||
    !projectionDisplayCountInput ||
    !projectionSlotCountInput ||
    !projectionMoveCountInput ||
    !projectionMilkyWayGainInput ||
    !projectionCloudCountInput ||
    !projectionCloudOriginXInput ||
    !projectionCloudOriginYInput ||
    !projectionCloudSeedInput ||
    !projectionExperimentalParallaxInput ||
    !projectionParallaxMarkerInput ||
    !projectionParallaxStrengthInput ||
    !projectionParallaxPopoutStrengthInput ||
    !projectionViewportMarginInput ||
    !projectionParallaxVanishingPointXInput ||
    !projectionParallaxVanishingPointYInput ||
    !settings
  ) return;

  if (!force && projectionSettingsDirty) {
    setProjectionSettingsState("編集中");
    return;
  }

  const displayCount = settings.projectionDisplayCount || 12;
  const slotCount = settings.projectionSlotCount || displayCount + 3;
  const moveCount = settings.projectionMoveCount || 1;
  const typingIntervalMs = settings.projectionTypingIntervalMs || 240;
  const rotateIntervalMs = settings.projectionRotateIntervalMs || 18000;
  const effectAutoEnabled = settings.projectionEffectAutoEnabled === true;
  const effectIntervalMs = settings.projectionEffectIntervalMs || 300000;
  const milkyWayGain = Number(settings.projectionMilkyWayGain || 1.75);
  const cloudCount = Number(settings.projectionCloudCount ?? 3);
  const cloudOriginX = Number(settings.projectionCloudOriginX ?? -32);
  const cloudOriginY = Number(settings.projectionCloudOriginY ?? 12);
  const cloudSeed = String(settings.projectionCloudSeed || "tanabata-clouds");
  const experimentalParallaxEnabled = settings.projectionExperimentalParallaxEnabled === true;
  const parallaxMarkerEnabled = settings.projectionParallaxMarkerEnabled === true;
  const parallaxStrength = Number(settings.projectionParallaxStrength ?? 1);
  const parallaxPopoutStrength = Number(settings.projectionParallaxPopoutStrength ?? 0);
  const viewportMargin = Number(settings.projectionViewportMargin ?? 0);
  const parallaxVanishingPointX = Number(settings.projectionParallaxVanishingPointX ?? 0);
  const parallaxVanishingPointY = Number(settings.projectionParallaxVanishingPointY ?? 0);
  const displayMax = settings.projectionDisplayCountMax || 30;
  const slotMax = settings.projectionSlotCountMax || 60;
  const typingMin = settings.projectionTypingIntervalMsMin || 120;
  const typingMax = settings.projectionTypingIntervalMsMax || 1000;
  const rotateMin = settings.projectionRotateIntervalMsMin || 5000;
  const rotateMax = settings.projectionRotateIntervalMsMax || 120000;
  const effectMin = settings.projectionEffectIntervalMsMin || 60000;
  const effectMax = settings.projectionEffectIntervalMsMax || 1800000;
  const milkyWayGainMin = settings.projectionMilkyWayGainMin || 0.5;
  const milkyWayGainMax = settings.projectionMilkyWayGainMax || 4;
  const cloudCountMin = settings.projectionCloudCountMin ?? 0;
  const cloudCountMax = settings.projectionCloudCountMax ?? 12;
  const cloudOriginXMin = settings.projectionCloudOriginXMin ?? -80;
  const cloudOriginXMax = settings.projectionCloudOriginXMax ?? 120;
  const cloudOriginYMin = settings.projectionCloudOriginYMin ?? -20;
  const cloudOriginYMax = settings.projectionCloudOriginYMax ?? 100;
  const parallaxStrengthMin = settings.projectionParallaxStrengthMin ?? 0;
  const parallaxStrengthMax = settings.projectionParallaxStrengthMax ?? 3;
  const parallaxPopoutStrengthMin = settings.projectionParallaxPopoutStrengthMin ?? 0;
  const parallaxPopoutStrengthMax = settings.projectionParallaxPopoutStrengthMax ?? 3;
  const viewportMarginMin = settings.projectionViewportMarginMin ?? 0;
  const viewportMarginMax = settings.projectionViewportMarginMax ?? 24;
  const parallaxVanishingPointMin = settings.projectionParallaxVanishingPointMin ?? -1;
  const parallaxVanishingPointMax = settings.projectionParallaxVanishingPointMax ?? 1;
  renderProjectionPresets(settings.projectionPresets || []);

  projectionTypingIntervalInput.value = String(typingIntervalMs);
  projectionTypingIntervalInput.min = String(typingMin);
  projectionTypingIntervalInput.max = String(typingMax);
  projectionRotateIntervalInput.value = String(rotateIntervalMs);
  projectionRotateIntervalInput.min = String(rotateMin);
  projectionRotateIntervalInput.max = String(rotateMax);
  projectionEffectAutoInput.checked = effectAutoEnabled;
  projectionEffectIntervalInput.value = String(effectIntervalMs);
  projectionEffectIntervalInput.min = String(effectMin);
  projectionEffectIntervalInput.max = String(effectMax);
  projectionMilkyWayGainInput.value = String(milkyWayGain);
  projectionMilkyWayGainInput.min = String(milkyWayGainMin);
  projectionMilkyWayGainInput.max = String(milkyWayGainMax);
  projectionCloudCountInput.value = String(cloudCount);
  projectionCloudCountInput.min = String(cloudCountMin);
  projectionCloudCountInput.max = String(cloudCountMax);
  projectionCloudOriginXInput.value = String(cloudOriginX);
  projectionCloudOriginXInput.min = String(cloudOriginXMin);
  projectionCloudOriginXInput.max = String(cloudOriginXMax);
  projectionCloudOriginYInput.value = String(cloudOriginY);
  projectionCloudOriginYInput.min = String(cloudOriginYMin);
  projectionCloudOriginYInput.max = String(cloudOriginYMax);
  projectionCloudSeedInput.value = cloudSeed;
  projectionExperimentalParallaxInput.checked = experimentalParallaxEnabled;
  projectionParallaxMarkerInput.checked = parallaxMarkerEnabled;
  projectionParallaxStrengthInput.value = String(parallaxStrength);
  projectionParallaxStrengthInput.min = String(parallaxStrengthMin);
  projectionParallaxStrengthInput.max = String(parallaxStrengthMax);
  projectionParallaxPopoutStrengthInput.value = String(parallaxPopoutStrength);
  projectionParallaxPopoutStrengthInput.min = String(parallaxPopoutStrengthMin);
  projectionParallaxPopoutStrengthInput.max = String(parallaxPopoutStrengthMax);
  projectionViewportMarginInput.value = String(viewportMargin);
  projectionViewportMarginInput.min = String(viewportMarginMin);
  projectionViewportMarginInput.max = String(viewportMarginMax);
  projectionParallaxVanishingPointXInput.dataset.serverMin = String(parallaxVanishingPointMin);
  projectionParallaxVanishingPointXInput.dataset.serverMax = String(parallaxVanishingPointMax);
  projectionParallaxVanishingPointYInput.dataset.serverMin = String(parallaxVanishingPointMin);
  projectionParallaxVanishingPointYInput.dataset.serverMax = String(parallaxVanishingPointMax);
  syncProjectionVanishingPointRanges();
  projectionParallaxVanishingPointXInput.value = String(clampNumber(
    parallaxVanishingPointX,
    Number(projectionParallaxVanishingPointXInput.min),
    Number(projectionParallaxVanishingPointXInput.max),
    0
  ));
  projectionParallaxVanishingPointYInput.value = String(clampNumber(
    parallaxVanishingPointY,
    Number(projectionParallaxVanishingPointYInput.min),
    Number(projectionParallaxVanishingPointYInput.max),
    0
  ));
  syncProjectionSliderOutputs();
  projectionSlotCountInput.value = String(slotCount);
  projectionSlotCountInput.min = "1";
  projectionSlotCountInput.max = String(slotMax);
  projectionDisplayCountInput.value = String(displayCount);
  projectionDisplayCountInput.dataset.max = String(displayMax);
  projectionDisplayCountInput.max = String(Math.min(displayMax, slotCount));
  projectionMoveCountInput.value = String(moveCount);
  projectionMoveCountInput.max = String(displayCount);
  setProjectionSettingsState(`文字 ${typingIntervalMs}ms / 間隔 ${rotateIntervalMs}ms / 自動 ${effectAutoEnabled ? "ON" : "OFF"} / イベント ${effectIntervalMs}ms / 天の川 ${milkyWayGain} / 雲 ${cloudCount} @ ${cloudOriginX},${cloudOriginY} / 視差 ${experimentalParallaxEnabled ? "ON" : "OFF"} / マーカー ${parallaxMarkerEnabled ? "ON" : "OFF"} / 強度 ${parallaxStrength} / 飛び出し ${parallaxPopoutStrength} / 余白 ${viewportMargin} / 消失点 ${parallaxVanishingPointX},${parallaxVanishingPointY} / スロット ${slotCount} / 表示 ${displayCount} / 移動 ${moveCount}`);
}

function setLiveState(text) {
  if (liveState) {
    liveState.textContent = text;
  }
}

function connectLiveUpdates() {
  if (!adminKey) return;

  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  const url = `/api/admin/events?adminKey=${encodeURIComponent(adminKey)}`;
  eventSource = new EventSource(url);
  setLiveState("接続中");

  eventSource.addEventListener("ready", () => {
    setLiveState("待機中");
  });

  eventSource.addEventListener("update", () => {
    refresh().catch(() => {});
  });

  eventSource.onerror = () => {
    setLiveState("再接続中");
  };
}

keyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  adminKey = keyInput.value.trim();
  localStorage.setItem("tanabataAdminKey", adminKey);
  await refresh();
  connectLiveUpdates();
});

adminTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveAdminTab(button.dataset.adminTab);
  });
});

if (detailsToggle) {
  detailsToggle.addEventListener("change", () => {
    setWishDetailsVisible(detailsToggle.checked);
    refresh().catch(() => {});
  });
}

if (moderationForm) {
  moderationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selected = moderationForm.querySelector("input[name='moderation-mode']:checked");
    if (!selected) return;

    const button = moderationForm.querySelector("button");
    button.disabled = true;
    try {
      const { settings } = await api("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ moderationMode: selected.value })
      });
      renderModerationSettings(settings);
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
    }
  });
}

function syncProjectionCountInputs() {
  if (!projectionDisplayCountInput || !projectionSlotCountInput || !projectionMoveCountInput) return;

  const slotCount = Number(projectionSlotCountInput.value) || 1;
  const displayMax = Number(projectionDisplayCountInput.dataset.max) || 30;
  const displayLimit = Math.min(displayMax, slotCount);
  projectionDisplayCountInput.max = String(displayLimit);
  if (Number(projectionDisplayCountInput.value) > displayLimit) {
    projectionDisplayCountInput.value = String(displayLimit);
  }

  const displayCount = Number(projectionDisplayCountInput.value) || 1;
  projectionMoveCountInput.max = String(displayCount);
  if (Number(projectionMoveCountInput.value) > displayCount) {
    projectionMoveCountInput.value = String(displayCount);
  }
}

function markProjectionSettingsDirty() {
  projectionSettingsDirty = true;
  syncProjectionSliderOutputs();
  setProjectionSettingsState("編集中");
}

function isProjectionParallaxPreviewInput(target) {
  return [
    projectionExperimentalParallaxInput,
    projectionParallaxMarkerInput,
    projectionParallaxStrengthInput,
    projectionParallaxPopoutStrengthInput,
    projectionViewportMarginInput,
    projectionParallaxVanishingPointXInput,
    projectionParallaxVanishingPointYInput
  ].includes(target);
}

function currentProjectionParallaxPayload() {
  return {
    projectionExperimentalParallaxEnabled: projectionExperimentalParallaxInput.checked,
    projectionParallaxMarkerEnabled: projectionParallaxMarkerInput.checked,
    projectionParallaxStrength: Number(projectionParallaxStrengthInput.value),
    projectionParallaxPopoutStrength: Number(projectionParallaxPopoutStrengthInput.value),
    projectionViewportMargin: Number(projectionViewportMarginInput.value),
    projectionParallaxVanishingPointX: Number(projectionParallaxVanishingPointXInput.value),
    projectionParallaxVanishingPointY: Number(projectionParallaxVanishingPointYInput.value)
  };
}

function scheduleProjectionParallaxPreview() {
  syncProjectionSliderOutputs();
  setProjectionSettingsState(projectionSettingsDirty ? "編集中 / 視差プレビュー反映待ち" : "視差プレビュー反映待ち");
  if (projectionParallaxPreviewTimer) {
    clearTimeout(projectionParallaxPreviewTimer);
  }
  projectionParallaxPreviewTimer = window.setTimeout(async () => {
    projectionParallaxPreviewTimer = null;
    const requestId = ++projectionParallaxPreviewRequestId;
    setProjectionSettingsState(projectionSettingsDirty ? "編集中 / 視差プレビュー反映中" : "視差プレビュー反映中");
    try {
      const { settings } = await api("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(currentProjectionParallaxPayload())
      });
      if (requestId !== projectionParallaxPreviewRequestId) return;
      if (projectionSettingsDirty) {
        setProjectionSettingsState("編集中");
      } else {
        renderProjectionSettings(settings);
      }
    } catch (error) {
      if (requestId === projectionParallaxPreviewRequestId) {
        setProjectionSettingsState("視差プレビュー反映失敗");
        alert(error.message);
      }
    }
  }, 300);
}

function currentProjectionSettingsPayload() {
  return {
    projectionTypingIntervalMs: Number(projectionTypingIntervalInput.value),
    projectionRotateIntervalMs: Number(projectionRotateIntervalInput.value),
    projectionEffectAutoEnabled: projectionEffectAutoInput.checked,
    projectionEffectIntervalMs: Number(projectionEffectIntervalInput.value),
    projectionSlotCount: Number(projectionSlotCountInput.value),
    projectionDisplayCount: Number(projectionDisplayCountInput.value),
    projectionMoveCount: Number(projectionMoveCountInput.value),
    projectionMilkyWayGain: Number(projectionMilkyWayGainInput.value),
    projectionCloudCount: Number(projectionCloudCountInput.value),
    projectionCloudOriginX: Number(projectionCloudOriginXInput.value),
    projectionCloudOriginY: Number(projectionCloudOriginYInput.value),
    projectionCloudSeed: projectionCloudSeedInput.value.trim(),
    projectionExperimentalParallaxEnabled: projectionExperimentalParallaxInput.checked,
    projectionParallaxMarkerEnabled: projectionParallaxMarkerInput.checked,
    projectionParallaxStrength: Number(projectionParallaxStrengthInput.value),
    projectionParallaxPopoutStrength: Number(projectionParallaxPopoutStrengthInput.value),
    projectionViewportMargin: Number(projectionViewportMarginInput.value),
    projectionParallaxVanishingPointX: Number(projectionParallaxVanishingPointXInput.value),
    projectionParallaxVanishingPointY: Number(projectionParallaxVanishingPointYInput.value)
  };
}

if (projectionDisplayCountInput && projectionSlotCountInput && projectionMoveCountInput) {
  projectionDisplayCountInput.addEventListener("input", () => {
    markProjectionSettingsDirty();
    syncProjectionCountInputs();
  });
  projectionSlotCountInput.addEventListener("input", () => {
    markProjectionSettingsDirty();
    syncProjectionCountInputs();
  });
}

if (
  projectionSettingsForm &&
  projectionTypingIntervalInput &&
  projectionRotateIntervalInput &&
  projectionEffectAutoInput &&
  projectionEffectIntervalInput &&
  projectionDisplayCountInput &&
  projectionSlotCountInput &&
  projectionMoveCountInput &&
  projectionMilkyWayGainInput &&
  projectionCloudCountInput &&
  projectionCloudOriginXInput &&
  projectionCloudOriginYInput &&
  projectionCloudSeedInput &&
  projectionExperimentalParallaxInput &&
  projectionParallaxMarkerInput &&
  projectionParallaxStrengthInput &&
  projectionParallaxPopoutStrengthInput &&
  projectionViewportMarginInput &&
  projectionParallaxVanishingPointXInput &&
  projectionParallaxVanishingPointYInput
) {
  projectionSettingsForm.addEventListener("input", (event) => {
    if (isProjectionParallaxPreviewInput(event.target)) {
      scheduleProjectionParallaxPreview();
      return;
    }
    markProjectionSettingsDirty();
  });
  projectionSettingsForm.addEventListener("change", (event) => {
    if (isProjectionParallaxPreviewInput(event.target)) {
      scheduleProjectionParallaxPreview();
      return;
    }
    markProjectionSettingsDirty();
  });

  projectionSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = projectionSettingsForm.querySelector("button");
    if (projectionParallaxPreviewTimer) {
      clearTimeout(projectionParallaxPreviewTimer);
      projectionParallaxPreviewTimer = null;
    }
    projectionParallaxPreviewRequestId += 1;
    button.disabled = true;
    try {
      const { settings } = await api("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(currentProjectionSettingsPayload())
      });
      projectionSettingsDirty = false;
      renderProjectionSettings(settings, { force: true });
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
    }
  });
}

if (projectionEffectsForm) {
  projectionEffectsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = projectionEffectsForm.querySelector("button");
    button.disabled = true;
    setProjectionEffectsState("流星群を開始中");
    try {
      await api("/api/admin/effects/meteor-shower", { method: "POST" });
      setProjectionEffectsState("流星群を送信しました");
    } catch (error) {
      setProjectionEffectsState("送信失敗");
      alert(error.message);
    } finally {
      setTimeout(() => setProjectionEffectsState("待機中"), 5000);
      button.disabled = false;
    }
  });
}

document.addEventListener("click", async (event) => {
  const presetButton = event.target.closest("button[data-preset-action]");
  if (!presetButton) return;

  const action = presetButton.dataset.presetAction;
  const index = Number(presetButton.dataset.presetIndex);
  if (action === "clear") {
    const ok = window.confirm(`プリセット${index + 1}をクリアします。`);
    if (!ok) return;
  }

  presetButton.disabled = true;
  let succeeded = false;
  const payload = {
    projectionPresetAction: action,
    projectionPresetIndex: index
  };
  if (action === "save" && projectionSettingsForm) {
    Object.assign(payload, currentProjectionSettingsPayload());
  }
  try {
    const { settings } = await api("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    succeeded = true;
    projectionSettingsDirty = false;
    renderProjectionSettings(settings, { force: true });
    setProjectionSettingsState(action === "save" ? "プリセット保存済み" : action === "load" ? "プリセット読込済み" : "プリセットクリア済み");
  } catch (error) {
    alert(error.message);
  } finally {
    if (!succeeded || action === "save") {
      presetButton.disabled = false;
    }
  }
});

if (backupRefreshButton) {
  backupRefreshButton.addEventListener("click", async () => {
    backupRefreshButton.disabled = true;
    try {
      await refreshBackups();
    } catch (error) {
      setBackupState("取得失敗");
      alert(error.message);
    } finally {
      backupRefreshButton.disabled = false;
    }
  });
}

if (backupCreateButton) {
  backupCreateButton.addEventListener("click", async () => {
    backupCreateButton.disabled = true;
    setBackupState("作成中");
    try {
      const { backups } = await api("/api/admin/backups", { method: "POST" });
      renderBackups(backups || []);
      setBackupState("作成しました");
    } catch (error) {
      setBackupState("作成失敗");
      alert(error.message);
    } finally {
      backupCreateButton.disabled = false;
    }
  });
}

async function bulkUpdatePending(nextStatus, button) {
  const label = nextStatus === "approved" ? "投影" : "非表示";
  const ok = window.confirm(`承認待ちの願い事をまとめて${label}にします。`);
  if (!ok) return;

  button.disabled = true;
  setFieldOverviewState(`一括${label}中`);
  try {
    const { updatedCount } = await api("/api/admin/wishes/bulk-status", {
      method: "POST",
      body: JSON.stringify({ fromStatus: "pending", status: nextStatus })
    });
    await refresh();
    setFieldOverviewState(`${updatedCount}件を${label}にしました`);
  } catch (error) {
    setFieldOverviewState(`一括${label}失敗`);
    button.disabled = false;
    alert(error.message);
  } finally {
    if (button.disabled) {
      await refresh().catch(() => {});
    }
  }
}

if (bulkApprovePendingButton) {
  bulkApprovePendingButton.addEventListener("click", () => {
    bulkUpdatePending("approved", bulkApprovePendingButton);
  });
}

if (bulkRejectPendingButton) {
  bulkRejectPendingButton.addEventListener("click", () => {
    bulkUpdatePending("rejected", bulkRejectPendingButton);
  });
}

document.addEventListener("click", async (event) => {
  const restoreButton = event.target.closest("button[data-backup-restore]");
  if (restoreButton) {
    const revision = restoreButton.dataset.backupRestore;
    const ok = window.confirm(`バックアップ ${revision} を復元します。現在の願い事は復元前に自動バックアップされます。`);
    if (!ok) return;

    restoreButton.disabled = true;
    setBackupState("復元中");
    try {
      const { backups } = await api("/api/admin/backups/restore", {
        method: "POST",
        body: JSON.stringify({ revision })
      });
      renderBackups(backups || []);
      await refresh();
      setBackupState("復元しました");
    } catch (error) {
      setBackupState("復元失敗");
      alert(error.message);
    } finally {
      restoreButton.disabled = false;
    }
    return;
  }

  const pagerButton = event.target.closest("button[data-page-status]");
  if (pagerButton) {
    const status = pagerButton.dataset.pageStatus;
    if (Object.prototype.hasOwnProperty.call(pages, status)) {
      pages[status] = Number(pagerButton.dataset.page) || 1;
      await refresh();
    }
    return;
  }

  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = button.closest(".admin-wish");
  if (!item) return;

  button.disabled = true;
  try {
    if (button.dataset.action === "delete") {
      await api(`/api/wishes/${item.dataset.id}`, { method: "DELETE" });
    } else {
      await api(`/api/wishes/${item.dataset.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: button.dataset.status })
      });
    }
    await refresh();
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
  }
});

refresh().then(() => {
  setWishDetailsVisible(wishDetailsVisible);
  setActiveAdminTab(activeAdminTab);
  connectLiveUpdates();
}).catch(() => {});
setInterval(() => refresh().catch(() => {}), 30000);
