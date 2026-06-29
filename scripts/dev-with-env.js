const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { getInactiveUpstream, getPort } = require("./upstream-state");

function parseEnvFile(content) {
  const env = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equals = line.indexOf("=");
    if (equals === -1) continue;

    const key = line.slice(0, equals).trim();
    let value = line.slice(equals + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }
  return env;
}

const rootDir = path.join(__dirname, "..");
const envFile = path.join(rootDir, ".env");
const inheritedHost = process.env.HOST;
const inheritedPort = process.env.PORT;
const inheritedDataDir = process.env.DATA_DIR;
const inactiveUpstream = getInactiveUpstream();

if (fs.existsSync(envFile)) {
  const parsed = parseEnvFile(fs.readFileSync(envFile, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

process.env.HOST = inheritedHost || process.env.DEV_HOST || inactiveUpstream.split(":")[0];
process.env.PORT = inheritedPort || process.env.DEV_PORT || getPort(inactiveUpstream);
process.env.DATA_DIR = inheritedDataDir || process.env.DEV_DATA_DIR || "data";

const child = spawn(process.execPath, [path.join(rootDir, "server.js")], {
  stdio: "inherit",
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
