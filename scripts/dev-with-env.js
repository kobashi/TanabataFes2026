const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { getPort, upstreams } = require("./upstream-state");

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
const devStateFile = path.join(rootDir, "data", "dev-server-state.json");
const inheritedHost = process.env.HOST;
const inheritedPort = process.env.PORT;
const inheritedDataDir = process.env.DATA_DIR;

if (fs.existsSync(envFile)) {
  const parsed = parseEnvFile(fs.readFileSync(envFile, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

function canListen(host, port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen({ host, port, exclusive: true }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort(host) {
  for (const upstream of upstreams) {
    const port = getPort(upstream);
    if (await canListen(host, Number(port))) {
      return port;
    }
  }
  throw new Error(`開発サーバーを起動できません。${host}:3001 と ${host}:3002 はどちらも使用中です。`);
}

async function main() {
  const host = inheritedHost || process.env.DEV_HOST || upstreams[0].split(":")[0];
  const explicitPort = inheritedPort || process.env.DEV_PORT;
  const port = explicitPort || await findAvailablePort(host);

  process.env.HOST = host;
  process.env.PORT = port;
  process.env.DATA_DIR = inheritedDataDir || process.env.DEV_DATA_DIR || "data";
  fs.mkdirSync(path.dirname(devStateFile), { recursive: true });
  fs.writeFileSync(
    devStateFile,
    `${JSON.stringify({ target: `http://${host}:${port}`, updatedAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8"
  );

  const child = spawn(process.execPath, [path.join(rootDir, "server.js")], {
    stdio: "inherit",
    env: process.env
  });

  child.on("error", (error) => {
    console.error(error.message || error);
    process.exit(1);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
