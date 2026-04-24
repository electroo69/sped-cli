/**
 * Generates individual bin/*.js files for every default alias
 * AND updates package.json bin entries to match.
 * Each file simply requires the shared run-alias.js runner.
 * This lets npm create correctly-named .cmd / symlink shims
 * so that process.argv[1] resolves to the alias name.
 */

const fs = require("fs");
const path = require("path");

const aliases = require("../defaults/aliases.json");
const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = require(pkgPath);
const aliasDir = path.join(__dirname, "..", "bin", "aliases");

fs.mkdirSync(aliasDir, { recursive: true });

const CONTENT = '#!/usr/bin/env node\nrequire("../run-alias.js");\n';

// Preserve non-alias bin entries (sped, sped-setup, smol)
const coreBins = {};
for (const [name, binPath] of Object.entries(pkg.bin || {})) {
  if (!binPath.startsWith("bin/aliases/")) {
    coreBins[name] = binPath;
  }
}

let count = 0;
const aliasBins = {};
for (const name of Object.keys(aliases)) {
  fs.writeFileSync(path.join(aliasDir, `${name}.js`), CONTENT);
  aliasBins[name] = `bin/aliases/${name}.js`;
  count += 1;
}

// Merge: core bins first, then alias bins
pkg.bin = { ...coreBins, ...aliasBins };

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

process.stdout.write(`Generated ${count} alias bins in bin/aliases/\n`);
process.stdout.write(`Updated package.json with ${Object.keys(pkg.bin).length} total bin entries\n`);
