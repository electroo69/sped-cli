#!/usr/bin/env node

const path = require("path");

const { run } = require("../src/dispatcher");

const commandName = path.basename(process.argv[1], path.extname(process.argv[1]));

run([commandName, ...process.argv.slice(2)], {
  commandName,
  invokedAsStandalone: true
}).then((code) => {
  process.exitCode = typeof code === "number" ? code : 0;
}).catch((error) => {
  const message = error && error.message ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = typeof error?.exitCode === "number" ? error.exitCode : 1;
});
