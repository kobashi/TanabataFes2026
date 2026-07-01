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
const projectionEffectsForm = document.querySelector("#projection-effects-form");
const projectionEffectsState = document.querySelector("#projection-effects-state");
const PAGE_SIZE = 8;

let adminKey = localStorage.getItem("tanabataAdminKey") || "";
let eventSource = null;
let wishDetailsVisible = localStorage.getItem("tanabataAdminWishDetails") === "true";
let projectionSettingsDirty = false;
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

function setProjectionEffectsState(text) {
  if (projectionEffectsState) {
    projectionEffectsState.textContent = text;
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

async function refresh() {
  if (!adminKey) return;
  const [{ wishes }, { settings }] = await Promise.all([
    api("/api/wishes"),
    api("/api/admin/settings")
  ]);
  renderModerationSettings(settings);
  renderProjectionSettings(settings, { force: false });
  renderList("pending", wishes.filter((wish) => wish.status === "pending"));
  renderList("approved", wishes.filter((wish) => wish.status === "approved"));
  renderList("rejected", wishes.filter((wish) => wish.status === "rejected"));
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
  const displayMax = settings.projectionDisplayCountMax || 30;
  const slotMax = settings.projectionSlotCountMax || 60;
  const typingMin = settings.projectionTypingIntervalMsMin || 120;
  const typingMax = settings.projectionTypingIntervalMsMax || 1000;
  const rotateMin = settings.projectionRotateIntervalMsMin || 5000;
  const rotateMax = settings.projectionRotateIntervalMsMax || 120000;
  const effectMin = settings.projectionEffectIntervalMsMin || 60000;
  const effectMax = settings.projectionEffectIntervalMsMax || 1800000;

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
  projectionSlotCountInput.value = String(slotCount);
  projectionSlotCountInput.min = "1";
  projectionSlotCountInput.max = String(slotMax);
  projectionDisplayCountInput.value = String(displayCount);
  projectionDisplayCountInput.dataset.max = String(displayMax);
  projectionDisplayCountInput.max = String(Math.min(displayMax, slotCount));
  projectionMoveCountInput.value = String(moveCount);
  projectionMoveCountInput.max = String(displayCount);
  setProjectionSettingsState(`文字 ${typingIntervalMs}ms / 間隔 ${rotateIntervalMs}ms / 自動 ${effectAutoEnabled ? "ON" : "OFF"} / イベント ${effectIntervalMs}ms / スロット ${slotCount} / 表示 ${displayCount} / 移動 ${moveCount}`);
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
  setProjectionSettingsState("編集中");
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
  projectionMoveCountInput
) {
  projectionSettingsForm.addEventListener("input", markProjectionSettingsDirty);
  projectionSettingsForm.addEventListener("change", markProjectionSettingsDirty);

  projectionSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = projectionSettingsForm.querySelector("button");
    button.disabled = true;
    try {
      const { settings } = await api("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          projectionTypingIntervalMs: Number(projectionTypingIntervalInput.value),
          projectionRotateIntervalMs: Number(projectionRotateIntervalInput.value),
          projectionEffectAutoEnabled: projectionEffectAutoInput.checked,
          projectionEffectIntervalMs: Number(projectionEffectIntervalInput.value),
          projectionSlotCount: Number(projectionSlotCountInput.value),
          projectionDisplayCount: Number(projectionDisplayCountInput.value),
          projectionMoveCount: Number(projectionMoveCountInput.value)
        })
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
  connectLiveUpdates();
}).catch(() => {});
setInterval(() => refresh().catch(() => {}), 30000);
