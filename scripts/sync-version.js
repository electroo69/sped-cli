#!/usr/bin/env node

/**
 * scripts/sync-version.js
 *
 * Single source of truth: package.json (version) + defaults/aliases.json (count).
 * Run this after changing the version in package.json:
 *
 *   node scripts/sync-version.js
 *
 * It updates: docs/index.html, README.md, bin/setup.js, skills/*.md,
 * sped_cli/app.config.ts, and sped_cli/content docs.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const pkg = require(path.join(ROOT, "package.json"));
const aliases = require(path.join(ROOT, "defaults", "aliases.json"));

const VERSION = pkg.version;
const COUNT = Object.keys(aliases).length;

console.log(`\n⚡ Syncing version=${VERSION}, aliases=${COUNT}\n`);

// Files to update with simple string replacements
const replacements = [
  // Replace version patterns like v1.x.x
  { pattern: /v\d+\.\d+\.\d+/g, replacement: `v${VERSION}` },
  // Replace "N aliases" or "N commands" or "N token-efficient"
  { pattern: /\d+ (token-efficient|aliases|commands)/g, replacement: (match) => {
    const word = match.replace(/^\d+ /, "");
    return `${COUNT} ${word}`;
  }},
  // Replace data-count="N" for stats counter
  { pattern: /data-count="\d+"/g, replacement: (match) => {
    if (match.includes("Shell Aliases") || match === match) {
      // Only replace the first stat (Shell Aliases)
      return match;
    }
    return match;
  }},
];

const FILES = [
  "docs/index.html",
  "README.md",
  "bin/setup.js",
  "sped_cli/app.config.ts",
  "sped_cli/content/1.getting-started/1.installation.md",
  "sped_cli/content/1.getting-started/2.quick-start.md",
  "sped_cli/content/2.essentials/4.ai-agents.md",
];

// Skill files — update count in these
const SKILL_FILES = [
  "skills/AGENTS.md",
  "skills/CLAUDE.md",
  "skills/GEMINI.md",
  "skills/.github/copilot-instructions.md",
  "skills/.windsurf/rules/smol-cli.md",
  "skills/.cursor/rules/smol-cli.mdc",
];

function updateFile(relPath) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⏭  ${relPath} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Replace version numbers (vX.X.X)
  content = content.replace(/v\d+\.\d+\.\d+/g, `v${VERSION}`);

  // Replace alias/command counts
  content = content.replace(/\b\d+ (token-efficient|aliases|commands|shell aliases)\b/gi, (match) => {
    const word = match.replace(/^\d+ /, "");
    return `${COUNT} ${word}`;
  });

  // Replace data-count for shell aliases stat
  content = content.replace(/data-count="\d+"(>0<\/div><div class="stat-label">Shell Aliases)/, 
    `data-count="${COUNT}"$1`);

  // Replace "all N sped-cli" pattern in setup.js
  content = content.replace(/all \d+ sped-cli/, `all ${COUNT} sped-cli`);

  // Replace "contain N shell aliases" pattern in universal prompt
  content = content.replace(/contain \d+ shell aliases/g, `contain ${COUNT} shell aliases`);

  // Replace "These contain N shell" pattern
  content = content.replace(/contain \d+ shell/g, `contain ${COUNT} shell`);

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`  ✅ ${relPath}`);
  } else {
    console.log(`  ⏭  ${relPath} (no changes)`);
  }
}

// Update all files
console.log("  Static files:");
FILES.forEach(updateFile);

console.log("\n  Skill files:");
SKILL_FILES.forEach(updateFile);

// Regenerate bins + package.json
console.log("\n  Regenerating bins...");
require("./generate-alias-bins");

console.log(`\n✨ Done! Version ${VERSION} with ${COUNT} aliases synced everywhere.\n`);
console.log("  Next steps:");
console.log("    git add -A");
console.log("    git commit -m \"bump: v" + VERSION + "\"");
console.log("    git push origin master");
console.log("    npm publish --access public --otp=YOUR_CODE\n");
