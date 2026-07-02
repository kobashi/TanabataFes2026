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
const projectionPresetCards = document.querySelectorAll("[data-projection-preset]");
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");
const backupState = document.querySelector("#backup-state");
const backupList = document.querySelector("#backup-list");
const backupCreateButton = document.querySelector("#backup-create-button");
const backupRefreshButton = document.querySelector("#backup-refresh-button");
const PAGE_SIZE = 8;

let adminKey = localStorage.getItem("tanabataAdminKey") || "";
let eventSource = null;
let wishDetailsVisible = localStorage.getItem("tanabataAdminWishDetails") === "true";
let projectionSettingsDirty = false;
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

function setProjectionEffectsState(text) {
  if (projectionEffectsState) {
    projectionEffectsState.textContent = text;
  }
}

function presetSummary(preset) {
  if (!preset?.settings) return "";
  const settings = preset.settings;
  return `スロット ${settings.projectionSlotCount} / 表示 ${settings.projectionDisplayCount} / 移動 ${settings.projectionMoveCount} / 文字 ${settings.projectionTypingIntervalMs}ms / 間隔 ${settings.projectionRotateIntervalMs}ms`;
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
  setProjectionSettingsState("編集中");
}

function currentProjectionSettingsPayload() {
  return {
    projectionTypingIntervalMs: Number(projectionTypingIntervalInput.value),
    projectionRotateIntervalMs: Number(projectionRotateIntervalInput.value),
    projectionEffectAutoEnabled: projectionEffectAutoInput.checked,
    projectionEffectIntervalMs: Number(projectionEffectIntervalInput.value),
    projectionSlotCount: Number(projectionSlotCountInput.value),
    projectionDisplayCount: Number(projectionDisplayCountInput.value),
    projectionMoveCount: Number(projectionMoveCountInput.value)
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
