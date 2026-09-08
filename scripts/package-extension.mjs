/**
 * Packages dist/ into a zip ready for AMO upload (web-ext sign / store submit).
 * AMO requires the archive to contain manifest.json at its root, so we zip the
 * *contents* of dist/ rather than the dist folder itself.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const AdmZip = require("adm-zip");

const root = path.resolve(import.meta.dirname, "..");
const distDir = path.join(root, "dist");
const manifestPath = path.join(distDir, "manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error(
    `✗ ${path.relative(root, manifestPath)} not found. Run "npm run build" first.`
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (!manifest.version) {
  console.error(`✗ manifest.json has no "version" field — cannot name the zip.`);
  process.exit(1);
}

const zip = new AdmZip();
for (const entry of fs.readdirSync(distDir, { recursive: true })) {
  const abs = path.join(distDir, entry);
  // Skip directories and macOS resource forks; adm-zip adds parent dirs implicitly.
  if (fs.statSync(abs).isDirectory() || entry.includes("__MACOSX")) continue;
  zip.addLocalFile(abs, path.dirname(entry) === "." ? "" : path.dirname(entry));
}

const outPath = path.join(root, `atrium-tabs-${manifest.version}.zip`);
zip.writeZip(outPath);
console.log(`✓ Packaged ${zip.getEntryCount()} files → ${path.basename(outPath)}`);
