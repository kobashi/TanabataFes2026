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
const projectionTanzakuSwayStrengthInput = document.querySelector("#projection-tanzaku-sway-strength");
const projectionWindGustStrengthInput = document.querySelector("#projection-wind-gust-strength");
const projectionWindGustCycleSecondsInput = document.querySelector("#projection-wind-gust-cycle-seconds");
const projectionWindGustCycleJitterSecondsInput = document.querySelector("#projection-wind-gust-cycle-jitter-seconds");
const projectionDisplayCountInput = document.querySelector("#projection-display-count");
const projectionSlotCountInput = document.querySelector("#projection-slot-count");
const projectionMoveCountInput = document.querySelector("#projection-move-count");
const projectionTanzakuFontIdInput = document.querySelector("#projection-tanzaku-font-id");
const projectionColorEmojiFontEnabledInput = document.querySelector("#projection-color-emoji-font-enabled");
const projectionMilkyWayGainInput = document.querySelector("#projection-milky-way-gain");
const projectionMilkyWayTwinkleInput = document.querySelector("#projection-milky-way-twinkle");
const projectionMilkyWaySparkleInput = document.querySelector("#projection-milky-way-sparkle");
const projectionMilkyWaySpeedInput = document.querySelector("#projection-milky-way-speed");
const projectionMilkyWayParticleCountInput = document.querySelector("#projection-milky-way-particle-count");
const projectionMilkyWaySparkleRatioInput = document.querySelector("#projection-milky-way-sparkle-ratio");
const projectionMilkyWaySparklePeriodVarianceInput = document.querySelector("#projection-milky-way-sparkle-period-variance");
const projectionMilkyWaySparkleIntensityVarianceInput = document.querySelector("#projection-milky-way-sparkle-intensity-variance");
const projectionMilkyWaySparklePeriodSecondsInput = document.querySelector("#projection-milky-way-sparkle-period-seconds");
const projectionMilkyWaySparkleDutyRatioInput = document.querySelector("#projection-milky-way-sparkle-duty-ratio");
const projectionMilkyWaySeedInput = document.querySelector("#projection-milky-way-seed");
const projectionTanabataStarResponseIntensityInput = document.querySelector("#projection-tanabata-star-response-intensity");
const projectionTanabataStarResponsePhaseDegInput = document.querySelector("#projection-tanabata-star-response-phase-deg");
const projectionTanabataStarResponsePeriodSecondsInput = document.querySelector("#projection-tanabata-star-response-period-seconds");
const projectionCloudCountInput = document.querySelector("#projection-cloud-count");
const projectionCloudOriginYInput = document.querySelector("#projection-cloud-origin-y");
const projectionCloudSeedInput = document.querySelector("#projection-cloud-seed");
const projectionExperimentalParallaxInput = document.querySelector("#projection-experimental-parallax-enabled");
const projectionParallaxMarkerInput = document.querySelector("#projection-parallax-marker-enabled");
const projectionParallaxMotionModeInput = document.querySelector("#projection-parallax-motion-mode");
const projectionParallaxStrengthInput = document.querySelector("#projection-parallax-strength");
const projectionParallaxPopoutStrengthInput = document.querySelector("#projection-parallax-popout-strength");
const projectionParallaxDepthMultiplierInput = document.querySelector("#projection-parallax-depth-multiplier");
const projectionParallaxDepthReferenceIndexInput = document.querySelector("#projection-parallax-depth-reference-index");
const projectionParallaxViewerOffsetXInput = document.querySelector("#projection-parallax-viewer-offset-x");
const projectionParallaxViewerOffsetYInput = document.querySelector("#projection-parallax-viewer-offset-y");
const projectionParallaxViewerDistanceInput = document.querySelector("#projection-parallax-viewer-distance");
const projectionViewportMarginInput = document.querySelector("#projection-viewport-margin");
const projectionParallaxVanishingPointXInput = document.querySelector("#projection-parallax-vanishing-point-x");
const projectionParallaxVanishingPointYInput = document.querySelector("#projection-parallax-vanishing-point-y");
const projectionMilkyWayGainValue = document.querySelector("#projection-milky-way-gain-value");
const projectionMilkyWayTwinkleValue = document.querySelector("#projection-milky-way-twinkle-value");
const projectionMilkyWaySparkleValue = document.querySelector("#projection-milky-way-sparkle-value");
const projectionMilkyWaySpeedValue = document.querySelector("#projection-milky-way-speed-value");
const projectionMilkyWayParticleCountValue = document.querySelector("#projection-milky-way-particle-count-value");
const projectionMilkyWaySparkleRatioValue = document.querySelector("#projection-milky-way-sparkle-ratio-value");
const projectionMilkyWaySparklePeriodVarianceValue = document.querySelector("#projection-milky-way-sparkle-period-variance-value");
const projectionMilkyWaySparkleIntensityVarianceValue = document.querySelector("#projection-milky-way-sparkle-intensity-variance-value");
const projectionMilkyWaySparklePeriodSecondsValue = document.querySelector("#projection-milky-way-sparkle-period-seconds-value");
const projectionMilkyWaySparkleDutyRatioValue = document.querySelector("#projection-milky-way-sparkle-duty-ratio-value");
const projectionTanabataStarResponseIntensityValue = document.querySelector("#projection-tanabata-star-response-intensity-value");
const projectionTanabataStarResponsePhaseDegValue = document.querySelector("#projection-tanabata-star-response-phase-deg-value");
const projectionTanabataStarResponsePeriodSecondsValue = document.querySelector("#projection-tanabata-star-response-period-seconds-value");
const projectionTanzakuSwayStrengthValue = document.querySelector("#projection-tanzaku-sway-strength-value");
const projectionWindGustStrengthValue = document.querySelector("#projection-wind-gust-strength-value");
const projectionWindGustCycleSecondsValue = document.querySelector("#projection-wind-gust-cycle-seconds-value");
const projectionWindGustCycleJitterSecondsValue = document.querySelector("#projection-wind-gust-cycle-jitter-seconds-value");
const projectionCloudCountValue = document.querySelector("#projection-cloud-count-value");
const projectionParallaxStrengthValue = document.querySelector("#projection-parallax-strength-value");
const projectionParallaxPopoutStrengthValue = document.querySelector("#projection-parallax-popout-strength-value");
const projectionParallaxDepthMultiplierValue = document.querySelector("#projection-parallax-depth-multiplier-value");
const projectionParallaxDepthReferenceIndexValue = document.querySelector("#projection-parallax-depth-reference-index-value");
const projectionCloudOriginYValue = document.querySelector("#projection-cloud-origin-y-value");
const projectionParallaxViewerOffsetXValue = document.querySelector("#projection-parallax-viewer-offset-x-value");
const projectionParallaxViewerOffsetYValue = document.querySelector("#projection-parallax-viewer-offset-y-value");
const projectionParallaxViewerDistanceValue = document.querySelector("#projection-parallax-viewer-distance-value");
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
const PROJECTION_TANZAKU_FONT_LABELS = {
  mincho: "明朝",
  gothic: "角ゴシック",
  maru: "丸ゴシック",
  kyokasho: "教科書体",
  brush: "筆文字風"
};

let adminKey = localStorage.getItem("tanabataAdminKey") || "";
let eventSource = null;
let wishDetailsVisible = localStorage.getItem("tanabataAdminWishDetails") === "true";
let projectionSettingsDirty = false;
let projectionParallaxPreviewTimer = null;
let projectionParallaxPreviewRequestId = 0;
let projectionSettingsEditingUntil = 0;
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

  const xMin = Number(projectionParallaxVanishingPointXInput.dataset.serverMin ?? -1);
  const xMax = Number(projectionParallaxVanishingPointXInput.dataset.serverMax ?? 1);
  const yMin = Number(projectionParallaxVanishingPointYInput.dataset.serverMin ?? -1);
  const yMax = Number(projectionParallaxVanishingPointYInput.dataset.serverMax ?? 5);
  const safeXMin = Number.isFinite(xMin) ? xMin : -1;
  const safeXMax = Number.isFinite(xMax) ? xMax : 1;
  const safeYMin = Number.isFinite(yMin) ? yMin : -1;
  const safeYMax = Number.isFinite(yMax) ? yMax : 5;

  projectionParallaxVanishingPointXInput.min = safeXMin.toFixed(2);
  projectionParallaxVanishingPointXInput.max = safeXMax.toFixed(2);
  projectionParallaxVanishingPointXInput.value = String(clampNumber(
    projectionParallaxVanishingPointXInput.value,
    safeXMin,
    safeXMax,
    0
  ));
  projectionParallaxVanishingPointYInput.min = safeYMin.toFixed(2);
  projectionParallaxVanishingPointYInput.max = safeYMax.toFixed(2);
  projectionParallaxVanishingPointYInput.value = String(clampNumber(
    projectionParallaxVanishingPointYInput.value,
    safeYMin,
    safeYMax,
    0
  ));
}

function syncProjectionSliderOutputs() {
  syncProjectionVanishingPointRanges();
  if (projectionMilkyWayGainValue && projectionMilkyWayGainInput) {
    projectionMilkyWayGainValue.textContent = formatSliderValue(projectionMilkyWayGainInput.value);
  }
  if (projectionMilkyWayTwinkleValue && projectionMilkyWayTwinkleInput) {
    projectionMilkyWayTwinkleValue.textContent = formatSliderValue(projectionMilkyWayTwinkleInput.value);
  }
  if (projectionMilkyWaySparkleValue && projectionMilkyWaySparkleInput) {
    projectionMilkyWaySparkleValue.textContent = formatSliderValue(projectionMilkyWaySparkleInput.value);
  }
  if (projectionMilkyWaySpeedValue && projectionMilkyWaySpeedInput) {
    projectionMilkyWaySpeedValue.textContent = formatSliderValue(projectionMilkyWaySpeedInput.value);
  }
  if (projectionMilkyWayParticleCountValue && projectionMilkyWayParticleCountInput) {
    projectionMilkyWayParticleCountValue.textContent = formatSliderValue(projectionMilkyWayParticleCountInput.value);
  }
  if (projectionMilkyWaySparkleRatioValue && projectionMilkyWaySparkleRatioInput) {
    projectionMilkyWaySparkleRatioValue.textContent = `${Math.round(Number(projectionMilkyWaySparkleRatioInput.value) * 1000) / 10}%`;
  }
  if (projectionMilkyWaySparklePeriodVarianceValue && projectionMilkyWaySparklePeriodVarianceInput) {
    projectionMilkyWaySparklePeriodVarianceValue.textContent = formatSliderValue(projectionMilkyWaySparklePeriodVarianceInput.value);
  }
  if (projectionMilkyWaySparkleIntensityVarianceValue && projectionMilkyWaySparkleIntensityVarianceInput) {
    projectionMilkyWaySparkleIntensityVarianceValue.textContent = formatSliderValue(projectionMilkyWaySparkleIntensityVarianceInput.value);
  }
  if (projectionMilkyWaySparklePeriodSecondsValue && projectionMilkyWaySparklePeriodSecondsInput) {
    projectionMilkyWaySparklePeriodSecondsValue.textContent = `${formatSliderValue(projectionMilkyWaySparklePeriodSecondsInput.value)}秒`;
  }
  if (projectionMilkyWaySparkleDutyRatioValue && projectionMilkyWaySparkleDutyRatioInput) {
    projectionMilkyWaySparkleDutyRatioValue.textContent = `${Math.round(Number(projectionMilkyWaySparkleDutyRatioInput.value) * 100)}%`;
  }
  if (projectionTanabataStarResponseIntensityValue && projectionTanabataStarResponseIntensityInput) {
    projectionTanabataStarResponseIntensityValue.textContent = formatSliderValue(projectionTanabataStarResponseIntensityInput.value);
  }
  if (projectionTanabataStarResponsePhaseDegValue && projectionTanabataStarResponsePhaseDegInput) {
    projectionTanabataStarResponsePhaseDegValue.textContent = `${formatSliderValue(projectionTanabataStarResponsePhaseDegInput.value)}°`;
  }
  if (projectionTanabataStarResponsePeriodSecondsValue && projectionTanabataStarResponsePeriodSecondsInput) {
    projectionTanabataStarResponsePeriodSecondsValue.textContent = `${formatSliderValue(projectionTanabataStarResponsePeriodSecondsInput.value)}秒`;
  }
  if (projectionTanzakuSwayStrengthValue && projectionTanzakuSwayStrengthInput) {
    projectionTanzakuSwayStrengthValue.textContent = formatSliderValue(projectionTanzakuSwayStrengthInput.value);
  }
  if (projectionWindGustStrengthValue && projectionWindGustStrengthInput) {
    projectionWindGustStrengthValue.textContent = formatSliderValue(projectionWindGustStrengthInput.value);
  }
  if (projectionWindGustCycleSecondsValue && projectionWindGustCycleSecondsInput) {
    projectionWindGustCycleSecondsValue.textContent = `${formatSliderValue(projectionWindGustCycleSecondsInput.value)}秒`;
  }
  if (projectionWindGustCycleJitterSecondsValue && projectionWindGustCycleJitterSecondsInput) {
    projectionWindGustCycleJitterSecondsValue.textContent = `${formatSliderValue(projectionWindGustCycleJitterSecondsInput.value)}秒`;
  }
  if (projectionCloudCountValue && projectionCloudCountInput) {
    projectionCloudCountValue.textContent = formatSliderValue(projectionCloudCountInput.value);
  }
  if (projectionParallaxStrengthValue && projectionParallaxStrengthInput) {
    projectionParallaxStrengthValue.textContent = formatSliderValue(projectionParallaxStrengthInput.value);
  }
  if (projectionParallaxPopoutStrengthValue && projectionParallaxPopoutStrengthInput) {
    projectionParallaxPopoutStrengthValue.textContent = formatSliderValue(projectionParallaxPopoutStrengthInput.value);
  }
  if (projectionParallaxDepthMultiplierValue && projectionParallaxDepthMultiplierInput) {
    projectionParallaxDepthMultiplierValue.textContent = formatSliderValue(projectionParallaxDepthMultiplierInput.value);
  }
  if (projectionParallaxDepthReferenceIndexValue && projectionParallaxDepthReferenceIndexInput) {
    const referenceIndex = Number(projectionParallaxDepthReferenceIndexInput.value);
    projectionParallaxDepthReferenceIndexValue.textContent = referenceIndex > 0 ? String(referenceIndex) : "中央";
  }
  if (projectionCloudOriginYValue && projectionCloudOriginYInput) {
    projectionCloudOriginYValue.textContent = formatSliderValue(projectionCloudOriginYInput.value);
  }
  if (projectionParallaxViewerOffsetXValue && projectionParallaxViewerOffsetXInput) {
    projectionParallaxViewerOffsetXValue.textContent = formatSliderValue(projectionParallaxViewerOffsetXInput.value);
  }
  if (projectionParallaxViewerOffsetYValue && projectionParallaxViewerOffsetYInput) {
    projectionParallaxViewerOffsetYValue.textContent = formatSliderValue(projectionParallaxViewerOffsetYInput.value);
  }
  if (projectionParallaxViewerDistanceValue && projectionParallaxViewerDistanceInput) {
    projectionParallaxViewerDistanceValue.textContent = formatSliderValue(projectionParallaxViewerDistanceInput.value);
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
  const motionModeLabels = {
    display: "ディスプレイ",
    camera: "実カメラ",
    "camera-display": "実カメラ 上下",
    mapping: "壁投影"
  };
  const motionMode = motionModeLabels[settings.projectionParallaxMotionMode] || motionModeLabels.mapping;
  const fontLabel = PROJECTION_TANZAKU_FONT_LABELS[settings.projectionTanzakuFontId] || PROJECTION_TANZAKU_FONT_LABELS.mincho;
  return `スロット ${settings.projectionSlotCount} / 表示 ${settings.projectionDisplayCount} / 移動 ${settings.projectionMoveCount} / フォント ${fontLabel} / 絵文字 ${settings.projectionColorEmojiFontEnabled ? "ON" : "OFF"} / 文字 ${settings.projectionTypingIntervalMs}ms / 間隔 ${settings.projectionRotateIntervalMs}ms / 天の川 ${settings.projectionMilkyWayGain} / 雲 ${settings.projectionCloudCount} / 視差 ${settings.projectionExperimentalParallaxEnabled ? "ON" : "OFF"} / 笹舟 ${motionMode} / 左右 ${settings.projectionParallaxStrength} / 前後/上下 ${settings.projectionParallaxPopoutStrength ?? 0} / 鑑賞 ${settings.projectionParallaxViewerOffsetX ?? 0},${settings.projectionParallaxViewerOffsetY ?? 0},${settings.projectionParallaxViewerDistance ?? 2.5} / 余白 ${settings.projectionViewportMargin ?? 0} / 消失点 ${settings.projectionParallaxVanishingPointX},${settings.projectionParallaxVanishingPointY}`;
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
    !projectionTanzakuFontIdInput ||
    !projectionColorEmojiFontEnabledInput ||
    !projectionMilkyWayGainInput ||
    !projectionMilkyWayTwinkleInput ||
    !projectionMilkyWaySparkleInput ||
    !projectionMilkyWaySpeedInput ||
    !projectionMilkyWayParticleCountInput ||
    !projectionMilkyWaySparkleRatioInput ||
    !projectionMilkyWaySparklePeriodVarianceInput ||
    !projectionMilkyWaySparkleIntensityVarianceInput ||
    !projectionMilkyWaySparklePeriodSecondsInput ||
    !projectionMilkyWaySparkleDutyRatioInput ||
    !projectionMilkyWaySeedInput ||
    !projectionTanabataStarResponseIntensityInput ||
    !projectionTanabataStarResponsePhaseDegInput ||
    !projectionTanabataStarResponsePeriodSecondsInput ||
    !projectionTanzakuSwayStrengthInput ||
    !projectionWindGustStrengthInput ||
    !projectionWindGustCycleSecondsInput ||
    !projectionWindGustCycleJitterSecondsInput ||
    !projectionCloudCountInput ||
    !projectionCloudOriginYInput ||
    !projectionCloudSeedInput ||
    !projectionExperimentalParallaxInput ||
    !projectionParallaxMarkerInput ||
    !projectionParallaxMotionModeInput ||
    !projectionParallaxStrengthInput ||
    !projectionParallaxPopoutStrengthInput ||
    !projectionParallaxViewerOffsetXInput ||
    !projectionParallaxViewerOffsetYInput ||
    !projectionParallaxViewerDistanceInput ||
    !projectionViewportMarginInput ||
    !projectionParallaxVanishingPointXInput ||
    !projectionParallaxVanishingPointYInput ||
    !settings
  ) return;

  const activeElement = document.activeElement;
  const projectionFormHasFocus = Boolean(activeElement && projectionSettingsForm.contains(activeElement));
  if (!force && (projectionSettingsDirty || projectionFormHasFocus || Date.now() < projectionSettingsEditingUntil)) {
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
  const tanzakuFontId = PROJECTION_TANZAKU_FONT_LABELS[settings.projectionTanzakuFontId]
    ? settings.projectionTanzakuFontId
    : "mincho";
  const tanzakuFontLabel = PROJECTION_TANZAKU_FONT_LABELS[tanzakuFontId];
  const colorEmojiFontEnabled = settings.projectionColorEmojiFontEnabled === true;
  const milkyWayGain = Number(settings.projectionMilkyWayGain || 1.75);
  const milkyWayTwinkle = Number(settings.projectionMilkyWayTwinkle ?? 1);
  const milkyWaySparkle = Number(settings.projectionMilkyWaySparkle ?? 1);
  const milkyWaySpeed = Number(settings.projectionMilkyWaySpeed ?? 1);
  const milkyWayParticleCount = Number(settings.projectionMilkyWayParticleCount ?? 340);
  const milkyWaySparkleRatio = Number(settings.projectionMilkyWaySparkleRatio ?? 0.045);
  const milkyWaySparklePeriodVariance = Number(settings.projectionMilkyWaySparklePeriodVariance ?? 1);
  const milkyWaySparkleIntensityVariance = Number(settings.projectionMilkyWaySparkleIntensityVariance ?? 1);
  const milkyWaySparklePeriodSeconds = Number(settings.projectionMilkyWaySparklePeriodSeconds ?? 2.2);
  const milkyWaySparkleDutyRatio = Number(settings.projectionMilkyWaySparkleDutyRatio ?? 0.16);
  const milkyWaySeed = String(settings.projectionMilkyWaySeed || "tanabata-milky-way");
  const tanabataStarResponseIntensity = Number(settings.projectionTanabataStarResponseIntensity ?? 1);
  const tanabataStarResponsePhaseDeg = Number(settings.projectionTanabataStarResponsePhaseDeg ?? 166);
  const tanabataStarResponsePeriodSeconds = Number(settings.projectionTanabataStarResponsePeriodSeconds ?? 35);
  const tanzakuSwayStrength = Number(settings.projectionTanzakuSwayStrength ?? 1);
  const windGustStrength = Number(settings.projectionWindGustStrength ?? 1);
  const windGustCycleMs = Number(settings.projectionWindGustCycleMs ?? 30000);
  const windGustCycleJitterSeconds = Number(settings.projectionWindGustCycleJitterSeconds ?? 0);
  const cloudCount = Number(settings.projectionCloudCount ?? 3);
  const cloudOriginY = Number(settings.projectionCloudOriginY ?? 0);
  const cloudSeed = String(settings.projectionCloudSeed || "tanabata-clouds");
  const experimentalParallaxEnabled = settings.projectionExperimentalParallaxEnabled === true;
  const parallaxMarkerEnabled = settings.projectionParallaxMarkerEnabled === true;
  const parallaxMotionMode = ["display", "mapping", "camera", "camera-display"].includes(settings.projectionParallaxMotionMode)
    ? settings.projectionParallaxMotionMode
    : "mapping";
  const parallaxMotionModeLabels = {
    display: "ディスプレイ",
    camera: "実カメラ",
    "camera-display": "実カメラ 上下",
    mapping: "壁投影"
  };
  const parallaxMotionModeLabel = parallaxMotionModeLabels[parallaxMotionMode];
  const parallaxStrength = Number(settings.projectionParallaxStrength ?? 1);
  const parallaxPopoutStrength = Number(settings.projectionParallaxPopoutStrength ?? 0);
  const parallaxDepthMultiplier = Number(settings.projectionParallaxDepthMultiplier ?? 1);
  const parallaxDepthReferenceIndex = Number(settings.projectionParallaxDepthReferenceIndex ?? 0);
  const parallaxViewerOffsetX = Number(settings.projectionParallaxViewerOffsetX ?? 0);
  const parallaxViewerOffsetY = Number(settings.projectionParallaxViewerOffsetY ?? 0);
  const parallaxViewerDistance = Number(settings.projectionParallaxViewerDistance ?? 2.5);
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
  const milkyWayTwinkleMin = settings.projectionMilkyWayTwinkleMin ?? 0;
  const milkyWayTwinkleMax = settings.projectionMilkyWayTwinkleMax ?? 2.5;
  const milkyWaySparkleMin = settings.projectionMilkyWaySparkleMin ?? 0;
  const milkyWaySparkleMax = settings.projectionMilkyWaySparkleMax ?? 2.5;
  const milkyWaySpeedMin = settings.projectionMilkyWaySpeedMin ?? 0.2;
  const milkyWaySpeedMax = settings.projectionMilkyWaySpeedMax ?? 2.5;
  const milkyWayParticleCountMin = settings.projectionMilkyWayParticleCountMin ?? 80;
  const milkyWayParticleCountMax = settings.projectionMilkyWayParticleCountMax ?? 720;
  const milkyWaySparkleRatioMin = settings.projectionMilkyWaySparkleRatioMin ?? 0;
  const milkyWaySparkleRatioMax = settings.projectionMilkyWaySparkleRatioMax ?? 0.25;
  const milkyWaySparklePeriodVarianceMin = settings.projectionMilkyWaySparklePeriodVarianceMin ?? 0;
  const milkyWaySparklePeriodVarianceMax = settings.projectionMilkyWaySparklePeriodVarianceMax ?? 2.5;
  const milkyWaySparkleIntensityVarianceMin = settings.projectionMilkyWaySparkleIntensityVarianceMin ?? 0;
  const milkyWaySparkleIntensityVarianceMax = settings.projectionMilkyWaySparkleIntensityVarianceMax ?? 2.5;
  const milkyWaySparklePeriodSecondsMin = settings.projectionMilkyWaySparklePeriodSecondsMin ?? 0.5;
  const milkyWaySparklePeriodSecondsMax = settings.projectionMilkyWaySparklePeriodSecondsMax ?? 8;
  const milkyWaySparkleDutyRatioMin = settings.projectionMilkyWaySparkleDutyRatioMin ?? 0.03;
  const milkyWaySparkleDutyRatioMax = settings.projectionMilkyWaySparkleDutyRatioMax ?? 0.8;
  const tanabataStarResponseIntensityMin = settings.projectionTanabataStarResponseIntensityMin ?? 0;
  const tanabataStarResponseIntensityMax = settings.projectionTanabataStarResponseIntensityMax ?? 3;
  const tanabataStarResponsePhaseDegMin = settings.projectionTanabataStarResponsePhaseDegMin ?? 0;
  const tanabataStarResponsePhaseDegMax = settings.projectionTanabataStarResponsePhaseDegMax ?? 360;
  const tanabataStarResponsePeriodSecondsMin = settings.projectionTanabataStarResponsePeriodSecondsMin ?? 8;
  const tanabataStarResponsePeriodSecondsMax = settings.projectionTanabataStarResponsePeriodSecondsMax ?? 90;
  const tanzakuSwayStrengthMin = settings.projectionTanzakuSwayStrengthMin ?? 0;
  const tanzakuSwayStrengthMax = settings.projectionTanzakuSwayStrengthMax ?? 3;
  const windGustStrengthMin = settings.projectionWindGustStrengthMin ?? 0;
  const windGustStrengthMax = settings.projectionWindGustStrengthMax ?? 3;
  const windGustCycleSecondsMin = settings.projectionWindGustCycleSecondsMin ?? 3;
  const windGustCycleSecondsMax = settings.projectionWindGustCycleSecondsMax ?? 60;
  const windGustCycleJitterSecondsMin = settings.projectionWindGustCycleJitterSecondsMin ?? 0;
  const windGustCycleJitterSecondsMax = settings.projectionWindGustCycleJitterSecondsMax ?? 60;
  const cloudCountMin = settings.projectionCloudCountMin ?? 0;
  const cloudCountMax = settings.projectionCloudCountMax ?? 12;
  const cloudOriginYMin = settings.projectionCloudOriginYMin ?? -1;
  const cloudOriginYMax = settings.projectionCloudOriginYMax ?? 1;
  const parallaxStrengthMin = settings.projectionParallaxStrengthMin ?? 0;
  const parallaxStrengthMax = settings.projectionParallaxStrengthMax ?? 3;
  const parallaxPopoutStrengthMin = settings.projectionParallaxPopoutStrengthMin ?? 0;
  const parallaxPopoutStrengthMax = settings.projectionParallaxPopoutStrengthMax ?? 3;
  const parallaxDepthMultiplierMin = settings.projectionParallaxDepthMultiplierMin ?? 0;
  const parallaxDepthMultiplierMax = settings.projectionParallaxDepthMultiplierMax ?? 3;
  const parallaxDepthReferenceIndexMin = settings.projectionParallaxDepthReferenceIndexMin ?? 0;
  const parallaxDepthReferenceIndexMax = settings.projectionParallaxDepthReferenceIndexMax ?? slotMax;
  const parallaxViewerOffsetXMin = settings.projectionParallaxViewerOffsetXMin ?? -2;
  const parallaxViewerOffsetXMax = settings.projectionParallaxViewerOffsetXMax ?? 2;
  const parallaxViewerOffsetYMin = settings.projectionParallaxViewerOffsetYMin ?? -2;
  const parallaxViewerOffsetYMax = settings.projectionParallaxViewerOffsetYMax ?? 2;
  const parallaxViewerDistanceMin = settings.projectionParallaxViewerDistanceMin ?? 0.5;
  const parallaxViewerDistanceMax = settings.projectionParallaxViewerDistanceMax ?? 8;
  const viewportMarginMin = settings.projectionViewportMarginMin ?? 0;
  const viewportMarginMax = settings.projectionViewportMarginMax ?? 24;
  const parallaxVanishingPointXMin = settings.projectionParallaxVanishingPointXMin ?? settings.projectionParallaxVanishingPointMin ?? -1;
  const parallaxVanishingPointXMax = settings.projectionParallaxVanishingPointXMax ?? settings.projectionParallaxVanishingPointMax ?? 1;
  const parallaxVanishingPointYMin = settings.projectionParallaxVanishingPointYMin ?? settings.projectionParallaxVanishingPointMin ?? -1;
  const parallaxVanishingPointYMax = settings.projectionParallaxVanishingPointYMax ?? 5;
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
  projectionTanzakuFontIdInput.value = tanzakuFontId;
  projectionColorEmojiFontEnabledInput.checked = colorEmojiFontEnabled;
  projectionMilkyWayGainInput.value = String(milkyWayGain);
  projectionMilkyWayGainInput.min = String(milkyWayGainMin);
  projectionMilkyWayGainInput.max = String(milkyWayGainMax);
  projectionMilkyWayTwinkleInput.value = String(milkyWayTwinkle);
  projectionMilkyWayTwinkleInput.min = String(milkyWayTwinkleMin);
  projectionMilkyWayTwinkleInput.max = String(milkyWayTwinkleMax);
  projectionMilkyWaySparkleInput.value = String(milkyWaySparkle);
  projectionMilkyWaySparkleInput.min = String(milkyWaySparkleMin);
  projectionMilkyWaySparkleInput.max = String(milkyWaySparkleMax);
  projectionMilkyWaySpeedInput.value = String(milkyWaySpeed);
  projectionMilkyWaySpeedInput.min = String(milkyWaySpeedMin);
  projectionMilkyWaySpeedInput.max = String(milkyWaySpeedMax);
  projectionMilkyWayParticleCountInput.value = String(milkyWayParticleCount);
  projectionMilkyWayParticleCountInput.min = String(milkyWayParticleCountMin);
  projectionMilkyWayParticleCountInput.max = String(milkyWayParticleCountMax);
  projectionMilkyWaySparkleRatioInput.value = String(milkyWaySparkleRatio);
  projectionMilkyWaySparkleRatioInput.min = String(milkyWaySparkleRatioMin);
  projectionMilkyWaySparkleRatioInput.max = String(milkyWaySparkleRatioMax);
  projectionMilkyWaySparklePeriodVarianceInput.value = String(milkyWaySparklePeriodVariance);
  projectionMilkyWaySparklePeriodVarianceInput.min = String(milkyWaySparklePeriodVarianceMin);
  projectionMilkyWaySparklePeriodVarianceInput.max = String(milkyWaySparklePeriodVarianceMax);
  projectionMilkyWaySparkleIntensityVarianceInput.value = String(milkyWaySparkleIntensityVariance);
  projectionMilkyWaySparkleIntensityVarianceInput.min = String(milkyWaySparkleIntensityVarianceMin);
  projectionMilkyWaySparkleIntensityVarianceInput.max = String(milkyWaySparkleIntensityVarianceMax);
  projectionMilkyWaySparklePeriodSecondsInput.value = String(milkyWaySparklePeriodSeconds);
  projectionMilkyWaySparklePeriodSecondsInput.min = String(milkyWaySparklePeriodSecondsMin);
  projectionMilkyWaySparklePeriodSecondsInput.max = String(milkyWaySparklePeriodSecondsMax);
  projectionMilkyWaySparkleDutyRatioInput.value = String(milkyWaySparkleDutyRatio);
  projectionMilkyWaySparkleDutyRatioInput.min = String(milkyWaySparkleDutyRatioMin);
  projectionMilkyWaySparkleDutyRatioInput.max = String(milkyWaySparkleDutyRatioMax);
  projectionMilkyWaySeedInput.value = milkyWaySeed;
  projectionTanabataStarResponseIntensityInput.value = String(tanabataStarResponseIntensity);
  projectionTanabataStarResponseIntensityInput.min = String(tanabataStarResponseIntensityMin);
  projectionTanabataStarResponseIntensityInput.max = String(tanabataStarResponseIntensityMax);
  projectionTanabataStarResponsePhaseDegInput.value = String(tanabataStarResponsePhaseDeg);
  projectionTanabataStarResponsePhaseDegInput.min = String(tanabataStarResponsePhaseDegMin);
  projectionTanabataStarResponsePhaseDegInput.max = String(tanabataStarResponsePhaseDegMax);
  projectionTanabataStarResponsePeriodSecondsInput.value = String(tanabataStarResponsePeriodSeconds);
  projectionTanabataStarResponsePeriodSecondsInput.min = String(tanabataStarResponsePeriodSecondsMin);
  projectionTanabataStarResponsePeriodSecondsInput.max = String(tanabataStarResponsePeriodSecondsMax);
  projectionTanzakuSwayStrengthInput.value = String(tanzakuSwayStrength);
  projectionTanzakuSwayStrengthInput.min = String(tanzakuSwayStrengthMin);
  projectionTanzakuSwayStrengthInput.max = String(tanzakuSwayStrengthMax);
  projectionWindGustStrengthInput.value = String(windGustStrength);
  projectionWindGustStrengthInput.min = String(windGustStrengthMin);
  projectionWindGustStrengthInput.max = String(windGustStrengthMax);
  projectionWindGustCycleSecondsInput.value = String(windGustCycleMs / 1000);
  projectionWindGustCycleSecondsInput.min = String(windGustCycleSecondsMin);
  projectionWindGustCycleSecondsInput.max = String(windGustCycleSecondsMax);
  projectionWindGustCycleJitterSecondsInput.value = String(windGustCycleJitterSeconds);
  projectionWindGustCycleJitterSecondsInput.min = String(windGustCycleJitterSecondsMin);
  projectionWindGustCycleJitterSecondsInput.max = String(windGustCycleJitterSecondsMax);
  projectionCloudCountInput.value = String(cloudCount);
  projectionCloudCountInput.min = String(cloudCountMin);
  projectionCloudCountInput.max = String(cloudCountMax);
  projectionCloudOriginYInput.value = String(cloudOriginY);
  projectionCloudOriginYInput.min = String(cloudOriginYMin);
  projectionCloudOriginYInput.max = String(cloudOriginYMax);
  projectionCloudSeedInput.value = cloudSeed;
  projectionExperimentalParallaxInput.checked = experimentalParallaxEnabled;
  projectionParallaxMarkerInput.checked = parallaxMarkerEnabled;
  projectionParallaxMotionModeInput.value = parallaxMotionMode;
  projectionParallaxStrengthInput.value = String(parallaxStrength);
  projectionParallaxStrengthInput.min = String(parallaxStrengthMin);
  projectionParallaxStrengthInput.max = String(parallaxStrengthMax);
  projectionParallaxPopoutStrengthInput.value = String(parallaxPopoutStrength);
  projectionParallaxPopoutStrengthInput.min = String(parallaxPopoutStrengthMin);
  projectionParallaxPopoutStrengthInput.max = String(parallaxPopoutStrengthMax);
  projectionParallaxDepthMultiplierInput.value = String(parallaxDepthMultiplier);
  projectionParallaxDepthMultiplierInput.min = String(parallaxDepthMultiplierMin);
  projectionParallaxDepthMultiplierInput.max = String(parallaxDepthMultiplierMax);
  projectionParallaxDepthReferenceIndexInput.value = String(Math.min(parallaxDepthReferenceIndex, slotCount));
  projectionParallaxDepthReferenceIndexInput.min = String(parallaxDepthReferenceIndexMin);
  projectionParallaxDepthReferenceIndexInput.max = String(Math.min(parallaxDepthReferenceIndexMax, slotCount));
  projectionParallaxViewerOffsetXInput.value = String(parallaxViewerOffsetX);
  projectionParallaxViewerOffsetXInput.min = String(parallaxViewerOffsetXMin);
  projectionParallaxViewerOffsetXInput.max = String(parallaxViewerOffsetXMax);
  projectionParallaxViewerOffsetYInput.value = String(parallaxViewerOffsetY);
  projectionParallaxViewerOffsetYInput.min = String(parallaxViewerOffsetYMin);
  projectionParallaxViewerOffsetYInput.max = String(parallaxViewerOffsetYMax);
  projectionParallaxViewerDistanceInput.value = String(parallaxViewerDistance);
  projectionParallaxViewerDistanceInput.min = String(parallaxViewerDistanceMin);
  projectionParallaxViewerDistanceInput.max = String(parallaxViewerDistanceMax);
  projectionViewportMarginInput.value = String(viewportMargin);
  projectionViewportMarginInput.min = String(viewportMarginMin);
  projectionViewportMarginInput.max = String(viewportMarginMax);
  projectionParallaxVanishingPointXInput.dataset.serverMin = String(parallaxVanishingPointXMin);
  projectionParallaxVanishingPointXInput.dataset.serverMax = String(parallaxVanishingPointXMax);
  projectionParallaxVanishingPointYInput.dataset.serverMin = String(parallaxVanishingPointYMin);
  projectionParallaxVanishingPointYInput.dataset.serverMax = String(parallaxVanishingPointYMax);
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
  syncProjectionCountInputs();
  setProjectionSettingsState(`フォント ${tanzakuFontLabel} / 絵文字 ${colorEmojiFontEnabled ? "ON" : "OFF"} / 文字 ${typingIntervalMs}ms / 間隔 ${rotateIntervalMs}ms / 自動 ${effectAutoEnabled ? "ON" : "OFF"} / イベント ${effectIntervalMs}ms / 風 ${tanzakuSwayStrength},${windGustStrength},${formatSliderValue(windGustCycleMs / 1000)}秒+${windGustCycleJitterSeconds}秒 / 天の川 ${milkyWayGain},${milkyWayTwinkle},${milkyWaySparkle},${milkyWaySpeed},${milkyWayParticleCount},${milkyWaySparkleRatio},${milkyWaySparklePeriodVariance},${milkyWaySparkleIntensityVariance},${milkyWaySparklePeriodSeconds}秒,${Math.round(milkyWaySparkleDutyRatio * 100)}% / 星呼応 ${tanabataStarResponseIntensity},${tanabataStarResponsePhaseDeg},${tanabataStarResponsePeriodSeconds} / 雲 ${cloudCount} / 高さ ${cloudOriginY} / 視差 ${experimentalParallaxEnabled ? "ON" : "OFF"} / マーカー ${parallaxMarkerEnabled ? "ON" : "OFF"} / 笹舟 ${parallaxMotionModeLabel} / 左右 ${parallaxStrength} / 前後/上下 ${parallaxPopoutStrength} / 奥行 ${parallaxDepthMultiplier},${parallaxDepthReferenceIndex || "中央"} / 鑑賞 ${parallaxViewerOffsetX},${parallaxViewerOffsetY},${parallaxViewerDistance} / 余白 ${viewportMargin} / 消失点 ${parallaxVanishingPointX},${parallaxVanishingPointY} / スロット ${slotCount} / 表示 ${displayCount} / 入替 ${moveCount}`);
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
  updateProjectionStepperButtons();
}

function updateProjectionStepperButtons() {
  document.querySelectorAll("[data-stepper-target][data-stepper-delta]").forEach((button) => {
    const input = document.getElementById(button.dataset.stepperTarget || "");
    if (!input) {
      button.disabled = true;
      return;
    }
    const value = Number(input.value);
    const min = Number(input.min);
    const max = Number(input.max);
    const delta = Number(button.dataset.stepperDelta);
    if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(delta)) {
      button.disabled = true;
      return;
    }
    button.disabled = delta < 0 ? value <= min : value >= max;
  });
}

function stepProjectionCountInput(targetId, delta) {
  const input = document.getElementById(targetId || "");
  if (!input) return;

  const step = Number(input.step) || 1;
  const min = Number(input.min) || 1;
  const max = Number(input.max) || min;
  const current = Number(input.value) || min;
  const nextValue = Math.round(clampNumber(current + (delta * step), min, max, current));
  if (Number(input.value) === nextValue) {
    updateProjectionStepperButtons();
    return;
  }
  input.value = String(nextValue);
  syncProjectionCountInputs();
  markProjectionSettingsDirty();
}

function markProjectionSettingsDirty() {
  projectionSettingsDirty = true;
  projectionSettingsEditingUntil = Date.now() + 1800;
  syncProjectionSliderOutputs();
  setProjectionSettingsState("編集中");
}

function isProjectionParallaxPreviewInput(target) {
  return [
    projectionExperimentalParallaxInput,
    projectionParallaxMarkerInput,
    projectionParallaxMotionModeInput,
    projectionParallaxStrengthInput,
    projectionParallaxPopoutStrengthInput,
    projectionParallaxDepthMultiplierInput,
    projectionParallaxDepthReferenceIndexInput,
    projectionParallaxViewerOffsetXInput,
    projectionParallaxViewerOffsetYInput,
    projectionParallaxViewerDistanceInput,
    projectionViewportMarginInput,
    projectionParallaxVanishingPointXInput,
    projectionParallaxVanishingPointYInput
  ].includes(target);
}

function currentProjectionParallaxPayload() {
  return {
    projectionExperimentalParallaxEnabled: projectionExperimentalParallaxInput.checked,
    projectionParallaxMarkerEnabled: projectionParallaxMarkerInput.checked,
    projectionParallaxMotionMode: projectionParallaxMotionModeInput.value,
    projectionParallaxStrength: Number(projectionParallaxStrengthInput.value),
    projectionParallaxPopoutStrength: Number(projectionParallaxPopoutStrengthInput.value),
    projectionParallaxDepthMultiplier: Number(projectionParallaxDepthMultiplierInput.value),
    projectionParallaxDepthReferenceIndex: Number(projectionParallaxDepthReferenceIndexInput.value),
    projectionParallaxViewerOffsetX: Number(projectionParallaxViewerOffsetXInput.value),
    projectionParallaxViewerOffsetY: Number(projectionParallaxViewerOffsetYInput.value),
    projectionParallaxViewerDistance: Number(projectionParallaxViewerDistanceInput.value),
    projectionViewportMargin: Number(projectionViewportMarginInput.value),
    projectionParallaxVanishingPointX: Number(projectionParallaxVanishingPointXInput.value),
    projectionParallaxVanishingPointY: Number(projectionParallaxVanishingPointYInput.value)
  };
}

function scheduleProjectionParallaxPreview() {
  projectionSettingsEditingUntil = Date.now() + 1800;
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
    projectionTanzakuFontId: projectionTanzakuFontIdInput.value,
    projectionColorEmojiFontEnabled: projectionColorEmojiFontEnabledInput.checked,
    projectionSlotCount: Number(projectionSlotCountInput.value),
    projectionDisplayCount: Number(projectionDisplayCountInput.value),
    projectionMoveCount: Number(projectionMoveCountInput.value),
    projectionMilkyWayGain: Number(projectionMilkyWayGainInput.value),
    projectionMilkyWayTwinkle: Number(projectionMilkyWayTwinkleInput.value),
    projectionMilkyWaySparkle: Number(projectionMilkyWaySparkleInput.value),
    projectionMilkyWaySpeed: Number(projectionMilkyWaySpeedInput.value),
    projectionMilkyWayParticleCount: Number(projectionMilkyWayParticleCountInput.value),
    projectionMilkyWaySparkleRatio: Number(projectionMilkyWaySparkleRatioInput.value),
    projectionMilkyWaySparklePeriodVariance: Number(projectionMilkyWaySparklePeriodVarianceInput.value),
    projectionMilkyWaySparkleIntensityVariance: Number(projectionMilkyWaySparkleIntensityVarianceInput.value),
    projectionMilkyWaySparklePeriodSeconds: Number(projectionMilkyWaySparklePeriodSecondsInput.value),
    projectionMilkyWaySparkleDutyRatio: Number(projectionMilkyWaySparkleDutyRatioInput.value),
    projectionMilkyWaySeed: projectionMilkyWaySeedInput.value.trim(),
    projectionTanabataStarResponseIntensity: Number(projectionTanabataStarResponseIntensityInput.value),
    projectionTanabataStarResponsePhaseDeg: Number(projectionTanabataStarResponsePhaseDegInput.value),
    projectionTanabataStarResponsePeriodSeconds: Number(projectionTanabataStarResponsePeriodSecondsInput.value),
    projectionTanzakuSwayStrength: Number(projectionTanzakuSwayStrengthInput.value),
    projectionWindGustStrength: Number(projectionWindGustStrengthInput.value),
    projectionWindGustCycleMs: Math.round(Number(projectionWindGustCycleSecondsInput.value) * 1000),
    projectionWindGustCycleJitterSeconds: Number(projectionWindGustCycleJitterSecondsInput.value),
    projectionCloudCount: Number(projectionCloudCountInput.value),
    projectionCloudOriginY: Number(projectionCloudOriginYInput.value),
    projectionCloudSeed: projectionCloudSeedInput.value.trim(),
    projectionExperimentalParallaxEnabled: projectionExperimentalParallaxInput.checked,
    projectionParallaxMarkerEnabled: projectionParallaxMarkerInput.checked,
    projectionParallaxMotionMode: projectionParallaxMotionModeInput.value,
    projectionParallaxStrength: Number(projectionParallaxStrengthInput.value),
    projectionParallaxPopoutStrength: Number(projectionParallaxPopoutStrengthInput.value),
    projectionParallaxDepthMultiplier: Number(projectionParallaxDepthMultiplierInput.value),
    projectionParallaxDepthReferenceIndex: Number(projectionParallaxDepthReferenceIndexInput.value),
    projectionParallaxViewerOffsetX: Number(projectionParallaxViewerOffsetXInput.value),
    projectionParallaxViewerOffsetY: Number(projectionParallaxViewerOffsetYInput.value),
    projectionParallaxViewerDistance: Number(projectionParallaxViewerDistanceInput.value),
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
  projectionTanzakuFontIdInput &&
  projectionColorEmojiFontEnabledInput &&
  projectionMilkyWayGainInput &&
  projectionMilkyWayTwinkleInput &&
  projectionMilkyWaySparkleInput &&
  projectionMilkyWaySpeedInput &&
  projectionMilkyWayParticleCountInput &&
  projectionMilkyWaySparkleRatioInput &&
  projectionMilkyWaySparklePeriodVarianceInput &&
  projectionMilkyWaySparkleIntensityVarianceInput &&
  projectionMilkyWaySparklePeriodSecondsInput &&
  projectionMilkyWaySparkleDutyRatioInput &&
  projectionMilkyWaySeedInput &&
  projectionTanabataStarResponseIntensityInput &&
  projectionTanabataStarResponsePhaseDegInput &&
  projectionTanabataStarResponsePeriodSecondsInput &&
  projectionCloudCountInput &&
  projectionCloudOriginYInput &&
  projectionCloudSeedInput &&
  projectionExperimentalParallaxInput &&
  projectionParallaxMarkerInput &&
  projectionParallaxMotionModeInput &&
  projectionParallaxStrengthInput &&
  projectionParallaxPopoutStrengthInput &&
  projectionParallaxDepthMultiplierInput &&
  projectionParallaxDepthReferenceIndexInput &&
  projectionParallaxViewerOffsetXInput &&
  projectionParallaxViewerOffsetYInput &&
  projectionParallaxViewerDistanceInput &&
  projectionViewportMarginInput &&
  projectionParallaxVanishingPointXInput &&
  projectionParallaxVanishingPointYInput
) {
  projectionSettingsForm.addEventListener("click", (event) => {
    const button = event.target.closest("[data-stepper-target][data-stepper-delta]");
    if (!button || !projectionSettingsForm.contains(button)) return;
    stepProjectionCountInput(button.dataset.stepperTarget, Number(button.dataset.stepperDelta));
  });
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
  projectionSettingsForm.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("input, select, textarea")) return;
    projectionSettingsEditingUntil = Date.now() + 1800;
  });
  projectionSettingsForm.addEventListener("focusin", (event) => {
    if (!event.target.closest("input, select, textarea")) return;
    projectionSettingsEditingUntil = Date.now() + 1800;
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
