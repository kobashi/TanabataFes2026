const form = document.querySelector("#wish-form");
const line1Input = document.querySelector("#wish-line-1");
const line2Input = document.querySelector("#wish-line-2");
const counter1 = document.querySelector("#counter-1");
const counter2 = document.querySelector("#counter-2");
const previewText = document.querySelector("#preview-text");
const message = document.querySelector("#message");

const MAX_LINE_LENGTH = 13;

function countCharacters(value) {
  return [...value].length;
}

function sanitizeLine(value) {
  return String(value || "")
    .replace(/\r\n/g, "")
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .trim();
}

function clampLine(value) {
  return [...sanitizeLine(value)].slice(0, MAX_LINE_LENGTH).join("");
}

function getDraftLines() {
  return [clampLine(line1Input.value), clampLine(line2Input.value)].filter((line, index) => {
    return index === 0 || line.length > 0 || clampLine(line2Input.value).length > 0;
  });
}

function renderCounters() {
  const line1 = clampLine(line1Input.value);
  const line2 = clampLine(line2Input.value);
  counter1.textContent = `${countCharacters(line1)} / ${MAX_LINE_LENGTH}`;
  counter2.textContent = `${countCharacters(line2)} / ${MAX_LINE_LENGTH}`;
}

function renderPreview() {
  const lines = getDraftLines();
  previewText.textContent = lines.join("\n");
  previewText.dataset.lines = String(lines.length || 1);
}

function syncField(input) {
  const clamped = clampLine(input.value);
  if (input.value !== clamped) {
    input.value = clamped;
  }
}

function preventEnterSubmit(event) {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
  }
}

function refresh() {
  syncField(line1Input);
  syncField(line2Input);
  renderCounters();
  renderPreview();
}

line1Input.addEventListener("input", refresh);
line2Input.addEventListener("input", refresh);
line1Input.addEventListener("keydown", preventEnterSubmit);
line2Input.addEventListener("keydown", preventEnterSubmit);

[line1Input, line2Input].forEach((input) => {
  input.addEventListener("paste", () => {
    window.requestAnimationFrame(refresh);
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  refresh();

  const lines = getDraftLines().filter((line) => line.length > 0);
  message.textContent = "";

  if (!lines.length) {
    message.textContent = "願い事を入力してください。";
    return;
  }

  if (lines.length > 2) {
    message.textContent = "願い事は2行までです。";
    return;
  }

  if (lines.some((line) => countCharacters(line) > MAX_LINE_LENGTH)) {
    message.textContent = "1行は13文字以内で入力してください。";
    return;
  }

  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "送信中";

  try {
    const response = await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "投稿できませんでした。");
    }
    line1Input.value = "";
    line2Input.value = "";
    refresh();
    message.textContent = "投稿しました。管理者の確認後、短冊に表示されます。";
  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "投稿する";
  }
});

refresh();
