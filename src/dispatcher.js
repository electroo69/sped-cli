const fs = require("fs/promises");
const path = require("path");
const { createReadStream } = require("fs");
const { spawn } = require("child_process");

const {
  addAlias,
  getDefaultConfig,
  initProjectConfig,
  loadConfig,
  pathExists,
  removeAlias,
  resetConfig
} = require("./config");
const { detectEnvironment, hasDependency } = require("./detect");
const { suggestAlias } = require("./suggest");

const PACKAGE = require("../package.json");

const MANAGEMENT_COMMANDS = new Set(["init", "add", "ls", "rm", "reset", "help"]);
const IGNORE_DIRS = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", ".turbo", ".cache"]);
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".go", ".rb", ".java", ".rs", ".php"]);

class CliError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function out(stream, message = "") {
  stream.write(`${message}\n`);
}

function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n");
}

function splitLines(text) {
  const lines = normalizeLineEndings(text).split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

function parsePositiveInt(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const numeric = Number.parseInt(String(value), 10);
  if (Number.isNaN(numeric) || numeric <= 0) {
    throw new CliError(`Expected a positive number, received "${value}"`);
  }

  return numeric;
}

function quotePreview(value) {
  const text = String(value);
  return /[\s"'`]/.test(text) ? `"${text.replace(/"/g, '\\"')}"` : text;
}

function quoteShell(value) {
  const text = String(value);
  if (process.platform === "win32") {
    if (/^[\w./:=@-]+$/.test(text)) {
      return text;
    }
    return `"${text.replace(/"/g, '""')}"`;
  }

  if (/^[\w./:=@-]+$/.test(text)) {
    return text;
  }

  return `'${text.replace(/'/g, `'\\''`)}'`;
}

function formatCommand(command, args = []) {
  return [command, ...args.map(quotePreview)].join(" ");
}

function getCommandPrefix(context, alias) {
  if (context.invokedAsStandalone) {
    return context.commandName || alias;
  }

  return `${context.commandName || "sped"} ${alias}`;
}

function formatUsage(context, alias, args = "") {
  const suffix = args ? ` ${args}` : "";
  return `Usage: ${getCommandPrefix(context, alias)}${suffix}`;
}

function parseInvocation(argv) {
  const [alias, ...rest] = argv;
  const flags = {
    deleteConfirmed: false,
    dryRun: false,
    explain: false
  };
  const args = [];
  let passthrough = false;

  for (const part of rest) {
    if (passthrough) {
      args.push(part);
      continue;
    }

    if (part === "--") {
      passthrough = true;
      args.push(part);
      continue;
    }

    if (part === "--dry") {
      flags.dryRun = true;
      continue;
    }

    if (part === "--explain") {
      flags.explain = true;
      continue;
    }

    if (part === "--force" || part === "-f" || part === "--yes") {
      flags.deleteConfirmed = true;
      continue;
    }

    args.push(part);
  }

  return { alias, args, flags };
}

function expandTemplate(template, args) {
  let highestIndex = 0;
  const command = String(template).replace(/{{(\d+)(?:\|([^}]+))?}}/g, (_, rawIndex, defaultValue) => {
    const index = Number(rawIndex);
    highestIndex = Math.max(highestIndex, index);
    const value = args[index - 1];
    if ((value === undefined || value === "") && defaultValue !== undefined) {
      return quoteShell(defaultValue);
    }
    if (value === undefined) {
      throw new CliError(`Missing argument ${index} for alias template`);
    }
    return quoteShell(value);
  });

  const rest = args.slice(highestIndex).filter((value) => value !== "--").map(quoteShell);
  return rest.length > 0 ? `${command} ${rest.join(" ")}` : command;
}

async function execCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      shell: false,
      stdio: options.stdio || "inherit",
      windowsHide: true
    });

    child.on("error", (error) => {
      reject(new CliError(error.message, 1));
    });

    child.on("exit", (code) => {
      resolve(typeof code === "number" ? code : 1);
    });
  });
}

async function execShell(command, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd: options.cwd,
      env: options.env,
      shell: true,
      stdio: options.stdio || "inherit",
      windowsHide: true
    });

    child.on("error", (error) => {
      reject(new CliError(error.message, 1));
    });

    child.on("exit", (code) => {
      resolve(typeof code === "number" ? code : 1);
    });
  });
}

async function readTextFile(filePath) {
  const buffer = await fs.readFile(filePath);
  if (buffer.includes(0)) {
    throw new CliError(`${filePath} appears to be a binary file`);
  }
  return buffer.toString("utf8");
}

function humanSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

async function ensureFile(filePath) {
  if (!(await pathExists(filePath))) {
    throw new CliError(`File not found: ${filePath}`);
  }
}

async function isDirectory(targetPath) {
  try {
    return (await fs.stat(targetPath)).isDirectory();
  } catch {
    return false;
  }
}

async function ensureTextFile(filePath) {
  await ensureFile(filePath);
  return readTextFile(filePath);
}

async function walkFiles(startDir, entries = []) {
  const dirents = await fs.readdir(startDir, { withFileTypes: true });

  for (const dirent of dirents) {
    const targetPath = path.join(startDir, dirent.name);
    if (dirent.isSymbolicLink()) {
      continue;
    }

    if (dirent.isDirectory()) {
      if (IGNORE_DIRS.has(dirent.name)) {
        continue;
      }
      await walkFiles(targetPath, entries);
      continue;
    }

    entries.push(targetPath);
  }

  return entries;
}

function globToRegex(pattern) {
  const escaped = String(pattern)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}

async function grepInFiles(files, matcher, cwd, stdout) {
  let hitCount = 0;

  for (const filePath of files) {
    let text;
    try {
      text = await readTextFile(filePath);
    } catch {
      continue;
    }

    const lines = splitLines(text);
    for (let index = 0; index < lines.length; index += 1) {
      if (matcher(lines[index], filePath)) {
        out(stdout, `${path.relative(cwd, filePath) || path.basename(filePath)}:${index + 1}:${lines[index]}`);
        hitCount += 1;
      }
    }
  }

  return hitCount;
}

function simpleMime(filePath, isBinary) {
  const extension = path.extname(filePath).toLowerCase();
  if (isBinary) {
    return `binary${extension ? ` (${extension})` : ""}`;
  }
  if (!extension) {
    return "text";
  }
  return `text (${extension})`;
}

function describeTask(task) {
  if (task.preview) {
    return `${task.description}\n${task.preview}`;
  }
  return task.description;
}

async function runTask(task, flags, stdout) {
  if (flags.explain) {
    out(stdout, describeTask(task));
    return 0;
  }

  if (flags.dryRun) {
    out(stdout, task.preview || task.description);
    return 0;
  }

  return task.run();
}

function createTask(description, preview, run) {
  return { description, preview, run };
}

function pmRun(pm, scriptName, extraArgs = []) {
  if (pm === "yarn") {
    return {
      command: "yarn",
      args: ["run", scriptName, ...extraArgs]
    };
  }

  if (extraArgs.length > 0) {
    return {
      command: pm,
      args: ["run", scriptName, "--", ...extraArgs]
    };
  }

  return {
    command: pm,
    args: ["run", scriptName]
  };
}

function pmInstall(pm, pkg) {
  if (pm === "yarn") {
    return { command: "yarn", args: pkg ? ["add", pkg] : ["install"] };
  }
  if (pm === "pnpm") {
    return { command: "pnpm", args: pkg ? ["add", pkg] : ["install"] };
  }
  return { command: "npm", args: pkg ? ["install", pkg] : ["install"] };
}

function pmUpdate(pm) {
  if (pm === "yarn") {
    return { command: "yarn", args: ["upgrade"] };
  }
  if (pm === "pnpm") {
    return { command: "pnpm", args: ["update"] };
  }
  return { command: "npm", args: ["update"] };
}

function pmCleanInstall(pm) {
  if (pm === "yarn") {
    return { command: "yarn", args: ["install", "--frozen-lockfile"] };
  }
  if (pm === "pnpm") {
    return { command: "pnpm", args: ["install", "--frozen-lockfile"] };
  }
  return { command: "npm", args: ["ci"] };
}

function pmExec(pm, bin, args = []) {
  if (pm === "yarn") {
    return { command: "yarn", args: ["exec", bin, ...args] };
  }
  if (pm === "pnpm") {
    return { command: "pnpm", args: ["exec", bin, ...args] };
  }
  return { command: "npx", args: ["--no-install", bin, ...args] };
}

function chooseScript(scripts, names) {
  return names.find((name) => typeof scripts[name] === "string") || null;
}

function scriptIncludes(script, term) {
  return typeof script === "string" && script.includes(term);
}

async function hasAnyFile(root, fileNames) {
  for (const fileName of fileNames) {
    if (await pathExists(path.join(root, fileName))) {
      return true;
    }
  }
  return false;
}

function createCommandTask(description, commandSpec, cwd, env) {
  return createTask(
    description,
    formatCommand(commandSpec.command, commandSpec.args),
    () => execCommand(commandSpec.command, commandSpec.args, { cwd, env })
  );
}

function createSequenceTask(description, steps) {
  return createTask(
    description,
    steps.map((step) => step.preview).join(" && "),
    async () => {
      for (const step of steps) {
        const code = await step.run();
        if (code !== 0) {
          return code;
        }
      }
      return 0;
    }
  );
}

function createTestRunnerTask(description, envInfo, coverage, env) {
  const pm = envInfo.packageManager;
  let commandSpec = null;

  switch (envInfo.testRunner) {
    case "vitest":
      commandSpec = pmExec(pm, "vitest", coverage ? ["run", "--coverage"] : ["run"]);
      break;
    case "jest":
      commandSpec = pmExec(pm, "jest", coverage ? ["--coverage"] : []);
      break;
    case "playwright":
      commandSpec = pmExec(pm, "playwright", ["test"]);
      break;
    case "mocha":
      commandSpec = coverage ? pmExec(pm, "c8", ["mocha"]) : pmExec(pm, "mocha");
      break;
    case "ava":
      commandSpec = pmExec(pm, "ava", coverage ? ["--tap"] : []);
      break;
    case "node:test":
      commandSpec = {
        command: "node",
        args: coverage ? ["--test", "--experimental-test-coverage"] : ["--test"]
      };
      break;
    default:
      throw new CliError("No test script or supported test runner found");
  }

  return createCommandTask(description, commandSpec, envInfo.root, env);
}

function createFileTailTask(ctx) {
  const file = ctx.args[0];
  if (!file) {
    throw new CliError(`Usage: ${getCommandPrefix(ctx, "t")} <file> [n] or ${getCommandPrefix(ctx, "t")}`);
  }

  const lineCount = parsePositiveInt(ctx.args[1], 50);
  const filePath = path.resolve(ctx.cwd, file);
  return createTask(
    "Show the last lines of a file",
    `tail -n ${lineCount} ${quotePreview(file)}`,
    async () => {
      const lines = splitLines(await ensureTextFile(filePath));
      const slice = lines.slice(Math.max(0, lines.length - lineCount));
      if (slice.length > 0) {
        out(ctx.stdout, slice.join("\n"));
      }
      return 0;
    }
  );
}

async function resolveLifecycleTask(alias, ctx) {
  const envInfo = await detectEnvironment(ctx.cwd, ctx.config);
  const scripts = envInfo.scripts;
  const packageJson = envInfo.packageJson;
  const root = envInfo.root;
  const pm = envInfo.packageManager;

  if (alias === "t" && ctx.args.length > 0) {
    return createFileTailTask(ctx);
  }

  if (alias === "t") {
    const script = chooseScript(scripts, ["test"]);
    if (script) {
      return createCommandTask("Run all tests", pmRun(pm, script), root, ctx.env);
    }
    return createTestRunnerTask("Run all tests", envInfo, false, ctx.env);
  }

  if (alias === "tu") {
    const script = chooseScript(scripts, ["test:unit", "unit", "unit:test"]);
    if (script) {
      return createCommandTask("Run unit tests", pmRun(pm, script), root, ctx.env);
    }
    return createTestRunnerTask("Run unit tests", envInfo, false, ctx.env);
  }

  if (alias === "tc") {
    const script = chooseScript(scripts, ["test:coverage", "coverage", "coverage:test"]);
    if (script) {
      return createCommandTask("Run test coverage", pmRun(pm, script), root, ctx.env);
    }
    return createTestRunnerTask("Run test coverage", envInfo, true, ctx.env);
  }

  if (alias === "lint") {
    const script = chooseScript(scripts, ["lint"]);
    if (script) {
      return createCommandTask("Run the linter", pmRun(pm, script), root, ctx.env);
    }

    if (await hasAnyFile(root, ["eslint.config.js", "eslint.config.mjs", ".eslintrc", ".eslintrc.js", ".eslintrc.json"]) || hasDependency(packageJson, "eslint")) {
      return createCommandTask("Run the linter", pmExec(pm, "eslint", ["." ]), root, ctx.env);
    }

    if (hasDependency(packageJson, "@biomejs/biome")) {
      return createCommandTask("Run the linter", pmExec(pm, "biome", ["check", "."]), root, ctx.env);
    }

    throw new CliError("No lint script or linter configuration found");
  }

  if (alias === "fix") {
    const script = chooseScript(scripts, ["fix", "lint:fix"]);
    if (script) {
      return createCommandTask("Run auto-fixes", pmRun(pm, script), root, ctx.env);
    }

    if (scriptIncludes(scripts.lint, "eslint")) {
      return createCommandTask("Run auto-fixes", pmRun(pm, "lint", ["--fix"]), root, ctx.env);
    }

    if (await hasAnyFile(root, ["eslint.config.js", "eslint.config.mjs", ".eslintrc", ".eslintrc.js", ".eslintrc.json"]) || hasDependency(packageJson, "eslint")) {
      return createCommandTask("Run auto-fixes", pmExec(pm, "eslint", [".", "--fix"]), root, ctx.env);
    }

    if (hasDependency(packageJson, "@biomejs/biome")) {
      return createCommandTask("Run auto-fixes", pmExec(pm, "biome", ["check", "--write", "."]), root, ctx.env);
    }

    if (await hasAnyFile(root, ["prettier.config.js", "prettier.config.cjs", ".prettierrc", ".prettierrc.json"]) || hasDependency(packageJson, "prettier")) {
      return createCommandTask("Run auto-fixes", pmExec(pm, "prettier", [".", "--write"]), root, ctx.env);
    }

    throw new CliError("No fixer script or formatter configuration found");
  }

  if (alias === "fmt") {
    const script = chooseScript(scripts, ["format", "fmt"]);
    if (script) {
      return createCommandTask("Format the codebase", pmRun(pm, script), root, ctx.env);
    }

    if (hasDependency(packageJson, "prettier") || await hasAnyFile(root, ["prettier.config.js", "prettier.config.cjs", ".prettierrc", ".prettierrc.json"])) {
      return createCommandTask("Format the codebase", pmExec(pm, "prettier", [".", "--write"]), root, ctx.env);
    }

    if (hasDependency(packageJson, "@biomejs/biome")) {
      return createCommandTask("Format the codebase", pmExec(pm, "biome", ["format", "--write", "."]), root, ctx.env);
    }

    throw new CliError("No format script or formatter configuration found");
  }

  if (alias === "b") {
    const script = chooseScript(scripts, ["build"]);
    if (!script) {
      throw new CliError("No build script found");
    }
    return createCommandTask("Build the project", pmRun(pm, script), root, ctx.env);
  }

  if (alias === "dev") {
    const script = chooseScript(scripts, ["dev", "start"]);
    if (!script) {
      throw new CliError("No dev or start script found");
    }
    return createCommandTask("Start the dev server", pmRun(pm, script), root, ctx.env);
  }

  if (alias === "check") {
    const script = chooseScript(scripts, ["check"]);
    if (script) {
      return createCommandTask("Run lint, type checks, and tests", pmRun(pm, script), root, ctx.env);
    }

    const steps = [];
    try {
      steps.push(await resolveLifecycleTask("lint", ctx));
    } catch {
      // Optional.
    }

    const typecheckScript = chooseScript(scripts, ["typecheck", "types"]);
    if (typecheckScript) {
      steps.push(createCommandTask("Run type checks", pmRun(pm, typecheckScript), root, ctx.env));
    } else if (await pathExists(path.join(root, "tsconfig.json"))) {
      steps.push(createCommandTask("Run type checks", pmExec(pm, "tsc", ["--noEmit"]), root, ctx.env));
    }

    try {
      steps.push(await resolveLifecycleTask("t", { ...ctx, args: [] }));
    } catch {
      // Optional.
    }

    if (steps.length === 0) {
      throw new CliError("Could not determine a check command");
    }

    return createSequenceTask("Run lint, type checks, and tests", steps);
  }

  throw new CliError(`Unsupported lifecycle alias: ${alias}`);
}

async function createBuiltinTask(alias, ctx) {
  if (["t", "tu", "tc", "lint", "fix", "fmt", "b", "dev", "check"].includes(alias)) {
    return resolveLifecycleTask(alias, ctx);
  }

  switch (alias) {
    case "h": {
      const file = ctx.args[0];
      if (!file) {
        throw new CliError(formatUsage(ctx, "h", "<file> [n]"));
      }
      const count = parsePositiveInt(ctx.args[1], 50);
      const filePath = path.resolve(ctx.cwd, file);
      return createTask(
        "Show the first lines of a file",
        `head -n ${count} ${quotePreview(file)}`,
        async () => {
          const lines = splitLines(await ensureTextFile(filePath));
          const slice = lines.slice(0, count);
          if (slice.length > 0) {
            out(ctx.stdout, slice.join("\n"));
          }
          return 0;
        }
      );
    }
    case "l": {
      const file = ctx.args[0];
      if (!file) {
        throw new CliError(formatUsage(ctx, "l", "<file>"));
      }
      const filePath = path.resolve(ctx.cwd, file);
      return createTask(
        "Print a file with line numbers",
        `cat -n ${quotePreview(file)}`,
        async () => {
          const lines = splitLines(await ensureTextFile(filePath));
          const width = String(Math.max(lines.length, 1)).length;
          const body = lines
            .map((line, index) => `${String(index + 1).padStart(width, " ")} | ${line}`)
            .join("\n");
          if (body) {
            out(ctx.stdout, body);
          }
          return 0;
        }
      );
    }
    case "v": {
      const file = ctx.args[0];
      if (!file) {
        throw new CliError(formatUsage(ctx, "v", "<file>"));
      }
      const filePath = path.resolve(ctx.cwd, file);
      return createTask(
        "View a file in a pager",
        `less ${quotePreview(file)}`,
        async () => {
          await ensureFile(filePath);
          if (!ctx.stdout.isTTY) {
            ctx.stdout.write(await ensureTextFile(filePath));
            return 0;
          }

          const pager = process.platform === "win32" ? "more.com" : "less";
          try {
            return await new Promise((resolve, reject) => {
              const child = spawn(pager, [], {
                stdio: ["pipe", "inherit", "inherit"],
                windowsHide: true
              });

              child.on("error", reject);
              child.on("exit", (code) => resolve(typeof code === "number" ? code : 1));

              createReadStream(filePath).pipe(child.stdin);
            });
          } catch {
            ctx.stdout.write(await ensureTextFile(filePath));
            return 0;
          }
        }
      );
    }
    case "e": {
      const file = ctx.args[0];
      if (!file) {
        throw new CliError(formatUsage(ctx, "e", "<file>"));
      }
      const filePath = path.resolve(ctx.cwd, file);
      const editor = process.env.EDITOR || process.env.VISUAL;
      const preview = editor ? `${editor} ${quotePreview(file)}` : `open ${quotePreview(file)}`;
      return createTask(
        "Open a file in your editor",
        preview,
        async () => {
          if (editor) {
            return execShell(`${editor} ${quoteShell(filePath)}`, { cwd: ctx.cwd, env: ctx.env });
          }
          if (process.platform === "win32") {
            return execCommand("notepad", [filePath], { cwd: ctx.cwd, env: ctx.env });
          }
          if (process.platform === "darwin") {
            return execCommand("open", ["-t", filePath], { cwd: ctx.cwd, env: ctx.env });
          }
          return execCommand("xdg-open", [filePath], { cwd: ctx.cwd, env: ctx.env });
        }
      );
    }
    case "w":
    case "a": {
      const file = ctx.args[0];
      if (!file || ctx.args.length < 2) {
        throw new CliError(formatUsage(ctx, alias, "<file> <content>"));
      }
      const filePath = path.resolve(ctx.cwd, file);
      const content = ctx.args.slice(1).join(" ");
      return createTask(
        alias === "w" ? "Write content to a file" : "Append content to a file",
        `${alias === "w" ? "write" : "append"} ${quotePreview(file)} ${quotePreview(content)}`,
        async () => {
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          if (alias === "w") {
            await fs.writeFile(filePath, content, "utf8");
          } else {
            await fs.appendFile(filePath, content, "utf8");
          }
          return 0;
        }
      );
    }
    case "x": {
      const file = ctx.args[0];
      if (!file) {
        throw new CliError(formatUsage(ctx, "x", "<file>"));
      }
      const filePath = path.resolve(ctx.cwd, file);
      return createTask(
        "Check whether a file exists",
        `test -e ${quotePreview(file)}`,
        async () => ((await pathExists(filePath)) ? 0 : 1)
      );
    }
    case "i": {
      const file = ctx.args[0];
      if (!file) {
        throw new CliError(formatUsage(ctx, "i", "<file>"));
      }
      const filePath = path.resolve(ctx.cwd, file);
      return createTask(
        "Show file information",
        `stat ${quotePreview(file)}`,
        async () => {
          await ensureFile(filePath);
          const stats = await fs.stat(filePath);
          if (stats.isDirectory()) {
            out(ctx.stdout, `path: ${filePath}`);
            out(ctx.stdout, `size: ${humanSize(stats.size)}`);
            out(ctx.stdout, "type: directory");
            return 0;
          }
          const buffer = await fs.readFile(filePath);
          const isBinary = buffer.includes(0);
          const text = isBinary ? null : buffer.toString("utf8");
          const lines = text === null ? "n/a" : String(splitLines(text).length);
          out(ctx.stdout, `path: ${filePath}`);
          out(ctx.stdout, `size: ${humanSize(stats.size)}`);
          out(ctx.stdout, `lines: ${lines}`);
          out(ctx.stdout, `type: ${simpleMime(filePath, isBinary)}`);
          return 0;
        }
      );
    }
    case "d": {
      const file = ctx.args[0];
      if (!file) {
        throw new CliError(formatUsage(ctx, "d", "<file> --force"));
      }
      const filePath = path.resolve(ctx.cwd, file);
      return createTask(
        "Delete a file or directory",
        `rm ${quotePreview(file)}`,
        async () => {
          if (!ctx.flags.deleteConfirmed) {
            throw new CliError("Deletion requires --force, -f, or --yes");
          }
          await fs.rm(filePath, { recursive: true, force: true });
          return 0;
        }
      );
    }
    case "cp":
    case "mv": {
      const [source, destination] = ctx.args;
      if (!source || !destination) {
        throw new CliError(formatUsage(ctx, alias, "<src> <dst>"));
      }
      const sourcePath = path.resolve(ctx.cwd, source);
      const destinationPath = path.resolve(ctx.cwd, destination);
      return createTask(
        alias === "cp" ? "Copy a file or directory" : "Move a file or directory",
        `${alias} ${quotePreview(source)} ${quotePreview(destination)}`,
        async () => {
          await ensureFile(sourcePath);
          await fs.mkdir(path.dirname(destinationPath), { recursive: true });
          if (alias === "cp") {
            await fs.cp(sourcePath, destinationPath, { recursive: true, force: true });
            return 0;
          }
          try {
            await fs.rename(sourcePath, destinationPath);
          } catch (error) {
            if (error && error.code === "EXDEV") {
              await fs.cp(sourcePath, destinationPath, { recursive: true, force: true });
              await fs.rm(sourcePath, { recursive: true, force: true });
            } else {
              throw error;
            }
          }
          return 0;
        }
      );
    }
    case "sf": {
      if (ctx.args.length < 1) {
        throw new CliError(formatUsage(ctx, "sf", "<pattern>"));
      }
      const pattern = ctx.args.join(" ");
      const matcher = globToRegex(pattern);
      return createTask(
        "Find files matching a glob",
        `find . -name ${quotePreview(pattern)}`,
        async () => {
          const files = await walkFiles(ctx.cwd);
          const matches = files
            .map((filePath) => path.relative(ctx.cwd, filePath))
            .filter((relativePath) => matcher.test(relativePath.replace(/\\/g, "/")) || matcher.test(path.basename(relativePath)));
          for (const match of matches) {
            out(ctx.stdout, match);
          }
          return matches.length > 0 ? 0 : 1;
        }
      );
    }
    case "sg":
    case "sl": {
      if (ctx.args.length < 1 || (alias === "sl" && ctx.args.length < 2)) {
        throw new CliError(formatUsage(ctx, alias, `<term>${alias === "sl" ? " <dir>" : " [dir]"}`));
      }

      const lastArgPath = path.resolve(ctx.cwd, ctx.args[ctx.args.length - 1]);
      const scopedDir = alias === "sl"
        ? lastArgPath
        : (ctx.args.length > 1 && await isDirectory(lastArgPath)) ? lastArgPath : ctx.cwd;
      const termParts = alias === "sl"
        ? ctx.args.slice(0, -1)
        : (scopedDir === ctx.cwd ? ctx.args : ctx.args.slice(0, -1));
      const term = termParts.join(" ");

      if (!(await isDirectory(scopedDir))) {
        throw new CliError(`Directory not found: ${scopedDir}`);
      }

      return createTask(
        alias === "sg" ? "Search recursively for a term" : "Search for a term in a specific directory",
        `grep -rn ${quotePreview(term)} ${quotePreview(path.relative(ctx.cwd, scopedDir) || ".")}`,
        async () => {
          const files = await walkFiles(scopedDir);
          const hits = await grepInFiles(files, (line) => line.includes(term), ctx.cwd, ctx.stdout);
          return hits > 0 ? 0 : 1;
        }
      );
    }
    case "si": {
      if (ctx.args.length < 1) {
        throw new CliError(formatUsage(ctx, "si", "<term>"));
      }
      const term = ctx.args.join(" ");
      return createTask(
        "Search import statements",
        `grep -rn import ${quotePreview(term)} .`,
        async () => {
          const files = (await walkFiles(ctx.cwd)).filter((filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath).toLowerCase()));
          const importPattern = /^\s*(import\b|export\b.*\bfrom\b|const\b.*=\s*require\(|from\b.*\bimport\b)/;
          const hits = await grepInFiles(files, (line) => importPattern.test(line) && line.includes(term), ctx.cwd, ctx.stdout);
          return hits > 0 ? 0 : 1;
        }
      );
    }
    case "sc": {
      if (ctx.args.length < 1) {
        throw new CliError(formatUsage(ctx, "sc", "<pattern>"));
      }
      const pattern = ctx.args.join(" ");
      return createTask(
        "Search code symbols and definitions",
        `grep -rn ${quotePreview(pattern)} .`,
        async () => {
          const files = (await walkFiles(ctx.cwd)).filter((filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath).toLowerCase()));
          const definitionPattern = /\b(function|class|interface|type|enum|const|let|var|def|fn)\b/;
          const hits = await grepInFiles(files, (line) => definitionPattern.test(line) && line.includes(pattern), ctx.cwd, ctx.stdout);
          return hits > 0 ? 0 : 1;
        }
      );
    }
    case "gs":
    case "ga":
    case "gaf":
    case "gc":
    case "gca":
    case "gp":
    case "gpf":
    case "gpl":
    case "gd":
    case "gds":
    case "gco":
    case "gcb":
    case "gb":
    case "gl":
    case "gst":
    case "gstp": {
      const argsByAlias = {
        gs: ["status"],
        ga: ["add", "."],
        gaf: ["add", ...ctx.args],
        gc: ["commit", "-m", ctx.args.join(" ")],
        gca: ["commit", "-am", ctx.args.join(" ")],
        gp: ["push"],
        gpf: ["push", "--force-with-lease"],
        gpl: ["pull"],
        gd: ["diff"],
        gds: ["diff", "--staged"],
        gco: ["checkout", ctx.args[0]],
        gcb: ["checkout", "-b", ctx.args[0]],
        gb: ["branch"],
        gl: ["log", "--oneline", "-10"],
        gst: ["stash"],
        gstp: ["stash", "pop"]
      };

      if ((alias === "gaf" || alias === "gco" || alias === "gcb") && ctx.args.length < 1) {
        throw new CliError(formatUsage(ctx, alias, `<${alias === "gaf" ? "file" : "branch"}>`));
      }

      if ((alias === "gc" || alias === "gca") && ctx.args.length < 1) {
        throw new CliError(formatUsage(ctx, alias, "<msg>"));
      }

      return createCommandTask(
        `Run ${formatCommand("git", argsByAlias[alias].filter((value) => value !== undefined && value !== ""))}`,
        { command: "git", args: argsByAlias[alias].filter((value) => value !== undefined && value !== "") },
        ctx.cwd,
        ctx.env
      );
    }
    case "ni":
    case "nid":
    case "nr":
    case "nu":
    case "nc": {
      const envInfo = await detectEnvironment(ctx.cwd, ctx.config);
      const pm = envInfo.packageManager;
      let commandSpec;

      switch (alias) {
        case "ni":
          commandSpec = pmInstall(pm);
          break;
        case "nid":
          if (ctx.args.length < 1) {
            throw new CliError(formatUsage(ctx, "nid", "<pkg>"));
          }
          commandSpec = pmInstall(pm, ctx.args[0]);
          break;
        case "nr":
          if (ctx.args.length < 1) {
            throw new CliError(formatUsage(ctx, "nr", "<script>"));
          }
          commandSpec = pmRun(pm, ctx.args[0], ctx.args.slice(1).filter((value) => value !== "--"));
          break;
        case "nu":
          commandSpec = pmUpdate(pm);
          break;
        default:
          commandSpec = pmCleanInstall(pm);
          break;
      }

      return createCommandTask("Run a package manager command", commandSpec, envInfo.root, ctx.env);
    }
    case "nd": {
      if (ctx.args.length < 1) {
        throw new CliError(formatUsage(ctx, "nd", "<file>"));
      }
      return createCommandTask("Run a Node.js file", { command: "node", args: ctx.args.filter((value) => value !== "--") }, ctx.cwd, ctx.env);
    }
    case "py": {
      if (ctx.args.length < 1) {
        throw new CliError(formatUsage(ctx, "py", "<file>"));
      }
      const pythonBinary = process.platform === "win32" ? "python" : "python3";
      return createCommandTask("Run a Python file", { command: pythonBinary, args: ctx.args.filter((value) => value !== "--") }, ctx.cwd, ctx.env);
    }
    case "dc": {
      if (ctx.args.length < 1) {
        throw new CliError(formatUsage(ctx, "dc", "<cmd>"));
      }
      return createCommandTask("Run a docker compose command", { command: "docker", args: ["compose", ...ctx.args.filter((value) => value !== "--")] }, ctx.cwd, ctx.env);
    }
    case "dps":
      return createCommandTask("List docker containers", { command: "docker", args: ["ps"] }, ctx.cwd, ctx.env);
    case "dex": {
      if (ctx.args.length < 1) {
        throw new CliError(formatUsage(ctx, "dex", "<container>"));
      }
      return createCommandTask(
        "Open a shell inside a container",
        { command: "docker", args: ["exec", "-it", ctx.args[0], "/bin/bash"] },
        ctx.cwd,
        ctx.env
      );
    }
    case "la":
    case "ll": {
      return createTask(
        alias === "la" ? "List directory contents" : "List directory contents with human-readable sizes",
        alias === "la" ? "ls -la" : "ls -lah",
        async () => {
          const entries = await fs.readdir(ctx.cwd, { withFileTypes: true });
          const rows = [];
          for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
            const targetPath = path.join(ctx.cwd, entry.name);
            const stats = await fs.stat(targetPath);
            rows.push([
              entry.isDirectory() ? "d" : "-",
              alias === "ll" ? humanSize(stats.size).padStart(7, " ") : String(stats.size).padStart(10, " "),
              stats.mtime.toISOString().slice(0, 19).replace("T", " "),
              entry.name
            ].join(" "));
          }
          if (rows.length > 0) {
            out(ctx.stdout, rows.join("\n"));
          }
          return 0;
        }
      );
    }
    case "lt": {
      return createTask(
        "Print a tree view up to depth 3",
        "tree . -L 3",
        async () => {
          async function renderTree(currentDir, depth, prefix = "") {
            if (depth > 3) {
              return [];
            }
            const entries = (await fs.readdir(currentDir, { withFileTypes: true }))
              .filter((entry) => !IGNORE_DIRS.has(entry.name))
              .sort((left, right) => left.name.localeCompare(right.name));
            const lines = [];
            for (let index = 0; index < entries.length; index += 1) {
              const entry = entries[index];
              const isLast = index === entries.length - 1;
              const marker = isLast ? "└─" : "├─";
              const nextPrefix = `${prefix}${isLast ? "  " : "│ "}`;
              lines.push(`${prefix}${marker} ${entry.name}`);
              if (entry.isDirectory() && depth < 3) {
                lines.push(...(await renderTree(path.join(currentDir, entry.name), depth + 1, nextPrefix)));
              }
            }
            return lines;
          }

          const lines = await renderTree(ctx.cwd, 1);
          out(ctx.stdout, ".\n" + lines.join("\n"));
          return 0;
        }
      );
    }
    case "up":
      return createTask(
        "Print the parent directory. A child process cannot change the caller's current directory.",
        "cd ..",
        async () => {
          out(ctx.stdout, path.dirname(ctx.cwd));
          return 0;
        }
      );
    case "mk": {
      const directory = ctx.args[0];
      if (!directory) {
        throw new CliError(formatUsage(ctx, "mk", "<dir>"));
      }
      const targetPath = path.resolve(ctx.cwd, directory);
      return createTask(
        "Create a directory recursively",
        `mkdir -p ${quotePreview(directory)}`,
        async () => {
          await fs.mkdir(targetPath, { recursive: true });
          return 0;
        }
      );
    }
    default:
      return null;
  }
}

function printHelp(stdout, commandName = "sped") {
  out(stdout, `sped-cli ${PACKAGE.version}`);
  out(stdout, `Usage: ${commandName} <alias> [args...]`);
  out(stdout, "Standalone built-in command: h <file> [n]");
  out(stdout, `Config commands: ${commandName} init, add, ls, rm, reset`);
  out(stdout, "Flags: --dry, --explain");
}

async function handleManagementCommand(argv, cwd, stdout) {
  const command = argv[0];

  switch (command) {
    case "help":
      printHelp(stdout);
      return 0;
    case "init": {
      const filePath = await initProjectConfig(cwd);
      out(stdout, filePath);
      return 0;
    }
    case "add": {
      if (argv.length < 3) {
        throw new CliError("Usage: sped add <alias> <cmd>");
      }
      const filePath = await addAlias(cwd, argv[1], argv.slice(2).join(" "));
      out(stdout, filePath);
      return 0;
    }
    case "ls": {
      const { config } = await loadConfig(cwd);
      const lines = Object.entries(config.aliases)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([alias, commandText]) => `${alias}\t${commandText}`);
      if (lines.length > 0) {
        out(stdout, lines.join("\n"));
      }
      return 0;
    }
    case "rm": {
      if (argv.length < 2) {
        throw new CliError("Usage: sped rm <alias>");
      }
      const filePath = await removeAlias(cwd, argv[1]);
      out(stdout, filePath);
      return 0;
    }
    case "reset": {
      const filePath = await resetConfig(cwd);
      out(stdout, filePath);
      return 0;
    }
    default:
      return null;
  }
}

async function resolveTask(invocation, loadedConfig, context) {
  const defaultAlias = getDefaultConfig().aliases[invocation.alias];
  const effectiveAlias = loadedConfig.config.aliases[invocation.alias];
  if (!effectiveAlias) {
    return null;
  }

  if (defaultAlias && effectiveAlias === defaultAlias) {
    const task = await createBuiltinTask(invocation.alias, {
      ...context,
      args: invocation.args,
      config: loadedConfig.config,
      flags: invocation.flags
    });
    if (task) {
      return task;
    }
  }

  const expanded = expandTemplate(effectiveAlias, invocation.args);
  return createTask(
    `Run alias "${invocation.alias}"`,
    expanded,
    () => execShell(expanded, { cwd: context.cwd, env: context.env })
  );
}

async function run(argv = process.argv.slice(2), options = {}) {
  const cwd = options.cwd || process.cwd();
  const env = options.env || process.env;
  const stdout = options.stdout || process.stdout;
  const commandName = options.commandName || "sped";
  const invokedAsStandalone = Boolean(options.invokedAsStandalone);

  if (argv.length === 0) {
    printHelp(stdout, commandName);
    return 0;
  }

  if (argv[0] === "--version" || argv[0] === "-v") {
    out(stdout, PACKAGE.version);
    return 0;
  }

  if (argv[0] === "--help") {
    printHelp(stdout, commandName);
    return 0;
  }

  if (MANAGEMENT_COMMANDS.has(argv[0])) {
    return handleManagementCommand(argv, cwd, stdout);
  }

  const invocation = parseInvocation(argv);
  const loadedConfig = await loadConfig(cwd);
  const aliases = Object.keys(loadedConfig.config.aliases);
  if (!aliases.includes(invocation.alias)) {
    const suggestion = suggestAlias(invocation.alias, [...aliases, ...MANAGEMENT_COMMANDS]);
    const suffix = suggestion ? ` Did you mean "${suggestion}"?` : "";
    throw new CliError(`Unknown alias "${invocation.alias}".${suffix}`, 2);
  }

  const task = await resolveTask(invocation, loadedConfig, {
    commandName,
    cwd,
    env,
    invokedAsStandalone,
    stdout
  });
  if (!task) {
    throw new CliError(`Could not resolve alias "${invocation.alias}"`, 1);
  }

  return runTask(task, invocation.flags, stdout);
}

module.exports = {
  CliError,
  expandTemplate,
  formatUsage,
  getCommandPrefix,
  parseInvocation,
  printHelp,
  run
};
