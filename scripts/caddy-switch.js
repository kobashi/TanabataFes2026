const { spawnSync } = require("node:child_process");

const upstream = process.argv[2] || process.env.TANABATA_UPSTREAM || "";

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!/^127\.0\.0\.1:\d{2,5}$/.test(upstream)) {
  fail("Usage: npm run proxy:switch -- 127.0.0.1:3001");
}

const port = Number(upstream.split(":")[1]);
if (port < 1024 || port > 65535) {
  fail("Upstream port must be between 1024 and 65535.");
}

const result = spawnSync("caddy", ["reload", "--config", "Caddyfile", "--adapter", "caddyfile"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    TANABATA_UPSTREAM: upstream
  },
  stdio: "inherit"
});

if (result.error) {
  fail(result.error.message);
}

process.exit(result.status ?? 1);
