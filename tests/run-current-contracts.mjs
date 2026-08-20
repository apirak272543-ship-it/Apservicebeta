import { readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { spawnSync } from "node:child_process";

const testsDirectory = new URL(".", import.meta.url);
const files = (await readdir(testsDirectory))
  .filter((file) => {
    const extension = extname(file);
    return (
      (extension === ".cjs" && file.endsWith("_contract_test.cjs")) ||
      file === "admin-login-media-navigation-contract.test.mjs"
    );
  })
  .sort();

if (files.length === 0) {
  throw new Error("No current Admin MPA contract tests were found.");
}

for (const file of files) {
  const testPath = join(testsDirectory.pathname, file);
  const result = spawnSync(process.execPath, [testPath], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Admin current-state contracts: ${files.length} passed`);
