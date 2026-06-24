const keyForm = document.querySelector("#key-form");
const keyInput = document.querySelector("#admin-key");
const lists = {
  pending: document.querySelector("#pending-list"),
  approved: document.querySelector("#approved-list"),
  rejected: document.querySelector("#rejected-list")
};
const liveState = document.querySelector("#live-state");

let adminKey = localStorage.getItem("tanabataAdminKey") || "";
let eventSource = null;
keyInput.value = adminKey;

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

function makeButton(label, action, status) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.action = action;
  if (status) button.dataset.status = status;
  return button;
}

function renderList(status, wishes) {
  const root = lists[status];
  root.textContent = "";
  if (!wishes.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "該当なし";
    root.append(empty);
    return;
  }

  wishes.forEach((wish) => {
    const item = document.createElement("article");
    item.className = "admin-wish";
    item.dataset.id = wish.id;

    const text = document.createElement("p");
    text.className = "admin-wish-text";
    text.textContent = wish.text;

    const meta = document.createElement("p");
    meta.className = "admin-wish-meta";
    meta.textContent = `投稿 ${formatDate(wish.createdAt)}${wish.approvedAt ? ` / 承認 ${formatDate(wish.approvedAt)}` : ""}`;

    const actions = document.createElement("div");
    actions.className = "admin-actions";
    if (status !== "approved") actions.append(makeButton("承認", "status", "approved"));
    if (status !== "pending") actions.append(makeButton("保留", "status", "pending"));
    if (status !== "rejected") actions.append(makeButton("非表示", "status", "rejected"));
    actions.append(makeButton("削除", "delete"));

    item.append(text, meta, actions);
    root.append(item);
  });
}

async function refresh() {
  if (!adminKey) return;
  const { wishes } = await api("/api/wishes");
  renderList("pending", wishes.filter((wish) => wish.status === "pending"));
  renderList("approved", wishes.filter((wish) => wish.status === "approved"));
  renderList("rejected", wishes.filter((wish) => wish.status === "rejected"));
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

document.addEventListener("click", async (event) => {
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
  connectLiveUpdates();
}).catch(() => {});
setInterval(() => refresh().catch(() => {}), 30000);
