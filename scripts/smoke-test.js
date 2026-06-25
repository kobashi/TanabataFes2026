const target = process.env.TARGET || `http://127.0.0.1:${process.env.PORT || 3000}`;
const adminKey = process.env.ADMIN_KEY || "tanabata2026";

async function check(path, options = {}) {
  const response = await fetch(new URL(path, target), options);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response;
}

async function main() {
  await check("/");
  await check("/admin");
  await check("/projection");
  await check("/api/health");
  await check("/api/approved");
  await check("/api/wishes", {
    headers: { "X-Admin-Key": adminKey }
  });
  console.log(`smoke ok: ${target}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
