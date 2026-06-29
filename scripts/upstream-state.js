const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");
const stateFile = path.join(rootDir, "data", "proxy-state.json");
const upstreams = ["127.0.0.1:3001", "127.0.0.1:3002"];
const defaultUpstream = upstreams[0];

function normalizeUpstream(value) {
  if (!value || typeof value !== "string") {
    return "";
  }
  const upstream = value.trim();
  return upstreams.includes(upstream) ? upstream : "";
}

function readActiveUpstream() {
  const envUpstream = normalizeUpstream(process.env.TANABATA_UPSTREAM);
  if (envUpstream) {
    return envUpstream;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    return normalizeUpstream(parsed.activeUpstream) || defaultUpstream;
  } catch {
    return defaultUpstream;
  }
}

function writeActiveUpstream(activeUpstream) {
  const upstream = normalizeUpstream(activeUpstream);
  if (!upstream) {
    throw new Error(`Unknown upstream: ${activeUpstream}`);
  }

  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(
    stateFile,
    `${JSON.stringify({ activeUpstream: upstream, updatedAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8"
  );
}

function getInactiveUpstream() {
  const active = readActiveUpstream();
  return upstreams.find((upstream) => upstream !== active) || upstreams[1];
}

function getPort(upstream) {
  return upstream.split(":")[1];
}

module.exports = {
  defaultUpstream,
  getInactiveUpstream,
  getPort,
  readActiveUpstream,
  upstreams,
  writeActiveUpstream
};
