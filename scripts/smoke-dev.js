const fs = require("node:fs");
const path = require("node:path");
const { getInactiveUpstream } = require("./upstream-state");

const devStateFile = path.join(__dirname, "..", "data", "dev-server-state.json");

function readDevTarget() {
  try {
    const parsed = JSON.parse(fs.readFileSync(devStateFile, "utf8"));
    const target = String(parsed.target || "");
    return /^http:\/\/(?:127\.0\.0\.1|localhost):\d{2,5}$/.test(target) ? target : "";
  } catch {
    return "";
  }
}

process.env.TARGET = process.env.TARGET || readDevTarget() || `http://${getInactiveUpstream()}`;

require("./smoke-test");
