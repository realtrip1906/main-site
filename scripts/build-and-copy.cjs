const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const dist = path.join(root, "dist");
const assets = path.join(dist, "assets");

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else copyFile(srcPath, destPath);
  }
}

try {
  console.log("Running vite build...");
  execSync("npx vite build", { stdio: "inherit" });

  // ensure dist exists
  if (!fs.existsSync(dist)) fs.mkdirSync(dist);

  // Copy root HTML files
  for (const f of fs.readdirSync(root)) {
    if (f.endsWith(".html")) {
      copyFile(path.join(root, f), path.join(dist, f));
    }
  }

  // Copy images and public folders
  copyDir(path.join(root, "images"), path.join(dist, "images"));
  copyDir(path.join(root, "public"), path.join(dist, "public"));

  // Copy key static files
  ["style.css", "pages.css", "favicon.ico", "robots.txt", "song.mp3"].forEach(
    (name) => {
      const src = path.join(root, name);
      if (fs.existsSync(src)) copyFile(src, path.join(dist, name));
    },
  );

  // Copy built main JS and CSS to stable filenames so old HTML pages can reference them
  if (fs.existsSync(assets)) {
    const assetFiles = fs.readdirSync(assets);
    const jsFile =
      assetFiles.find((n) => n.endsWith(".js") && n.startsWith("index-")) ||
      assetFiles.find((n) => n.endsWith(".js"));
    const cssFile =
      assetFiles.find((n) => n.endsWith(".css") && n.startsWith("index-")) ||
      assetFiles.find((n) => n.endsWith(".css"));
    if (jsFile) copyFile(path.join(assets, jsFile), path.join(dist, "main.js"));
    if (cssFile)
      copyFile(path.join(assets, cssFile), path.join(dist, "style.css"));
  }

  console.log("Static copy complete.");
} catch (err) {
  console.error("Build script failed:", err);
  process.exit(1);
}
