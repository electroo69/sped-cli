/**
 * Generates individual bin/*.js files for every default alias.
 * Each file simply requires the shared run-alias.js runner.
 * This lets npm create correctly-named .cmd / symlink shims
 * so that process.argv[1] resolves to the alias name.
 */

const fs = require("fs");
const path = require("path");

const aliases = require("../defaults/aliases.json");
const aliasDir = path.join(__dirname, "..", "bin", "aliases");

fs.mkdirSync(aliasDir, { recursive: true });

const CONTENT = '#!/usr/bin/env node\nrequire("../run-alias.js");\n';

let count = 0;
for (const name of Object.keys(aliases)) {
  fs.writeFileSync(path.join(aliasDir, `${name}.js`), CONTENT);
  count += 1;
}

process.stdout.write(`Generated ${count} alias bins in bin/aliases/\n`);
