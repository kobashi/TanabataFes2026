const fs = require("node:fs/promises");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");
const dataFile = path.join(rootDir, "data", "wishes.json");
const backupDir = path.join(rootDir, "data", "backups");

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function main() {
  await fs.mkdir(backupDir, { recursive: true });

  let raw = "[]\n";
  try {
    raw = await fs.readFile(dataFile, "utf8");
    JSON.parse(raw || "[]");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const backupFile = path.join(backupDir, `wishes-${timestamp()}.json`);
  await fs.writeFile(backupFile, raw.endsWith("\n") ? raw : `${raw}\n`, "utf8");
  console.log(backupFile);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
