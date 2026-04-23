const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const DEFAULT_ALIASES = require("../defaults/aliases.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getDefaultConfig() {
  return {
    aliases: clone(DEFAULT_ALIASES),
    packageManager: "auto",
    testRunner: "auto"
  };
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text);
}

async function readJsonIfExists(filePath) {
  if (!filePath || !(await pathExists(filePath))) {
    return null;
  }

  return readJson(filePath);
}

function normalizeConfig(rawConfig) {
  const normalized = getDefaultConfig();

  if (!rawConfig || typeof rawConfig !== "object") {
    return normalized;
  }

  normalized.packageManager = typeof rawConfig.packageManager === "string"
    ? rawConfig.packageManager
    : normalized.packageManager;
  normalized.testRunner = typeof rawConfig.testRunner === "string"
    ? rawConfig.testRunner
    : normalized.testRunner;
  normalized.aliases = rawConfig.aliases && typeof rawConfig.aliases === "object"
    ? Object.fromEntries(
      Object.entries(rawConfig.aliases)
        .filter(([alias, value]) => typeof alias === "string" && typeof value === "string")
    )
    : {};

  return normalized;
}

function mergeConfigs(...configs) {
  const merged = getDefaultConfig();

  for (const config of configs) {
    if (!config) {
      continue;
    }

    if (config.packageManager) {
      merged.packageManager = config.packageManager;
    }

    if (config.testRunner) {
      merged.testRunner = config.testRunner;
    }

    merged.aliases = {
      ...merged.aliases,
      ...(config.aliases || {})
    };
  }

  return merged;
}

async function findUp(startDir, fileName) {
  let currentDir = path.resolve(startDir);

  for (;;) {
    const candidate = path.join(currentDir, fileName);
    if (await pathExists(candidate)) {
      return candidate;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

async function findProjectRoot(startDir) {
  let currentDir = path.resolve(startDir);

  for (;;) {
    if (await pathExists(path.join(currentDir, "package.json")) || await pathExists(path.join(currentDir, ".git"))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

function getHomeConfigPath() {
  return path.join(os.homedir(), ".smol", "config.json");
}

async function loadConfig(startDir = process.cwd()) {
  const projectConfigPath = await findUp(startDir, "sped.config.json");
  const homeConfigPath = await pathExists(getHomeConfigPath()) ? getHomeConfigPath() : null;
  const defaultConfig = getDefaultConfig();
  const homeConfig = normalizeConfig(await readJsonIfExists(homeConfigPath));
  const projectConfig = normalizeConfig(await readJsonIfExists(projectConfigPath));
  const mergedConfig = mergeConfigs(defaultConfig, homeConfig, projectConfig);

  return {
    config: mergedConfig,
    defaults: defaultConfig,
    homeConfigPath,
    projectConfigPath
  };
}

async function ensureParentDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeConfig(filePath, config) {
  await ensureParentDir(filePath);
  const nextConfig = {
    aliases: Object.fromEntries(Object.entries(config.aliases || {}).sort(([left], [right]) => left.localeCompare(right))),
    packageManager: config.packageManager || "auto",
    testRunner: config.testRunner || "auto"
  };
  await fs.writeFile(filePath, `${JSON.stringify(nextConfig, null, 2)}\n`, "utf8");
}

async function initProjectConfig(startDir = process.cwd()) {
  const filePath = path.resolve(startDir, "sped.config.json");
  if (await pathExists(filePath)) {
    const error = new Error("sped.config.json already exists");
    error.exitCode = 1;
    throw error;
  }

  await writeConfig(filePath, getDefaultConfig());
  return filePath;
}

async function resolveEditableConfigPath(startDir = process.cwd()) {
  const existingProjectConfig = await findUp(startDir, "sped.config.json");
  if (existingProjectConfig) {
    return existingProjectConfig;
  }

  const projectRoot = await findProjectRoot(startDir);
  if (projectRoot) {
    return path.join(projectRoot, "sped.config.json");
  }

  return getHomeConfigPath();
}

async function addAlias(startDir, alias, command) {
  const targetPath = await resolveEditableConfigPath(startDir);
  const { config } = await loadConfig(startDir);
  config.aliases[alias] = command;
  await writeConfig(targetPath, config);
  return targetPath;
}

async function removeAlias(startDir, alias) {
  const targetPath = await resolveEditableConfigPath(startDir);
  const { config } = await loadConfig(startDir);
  delete config.aliases[alias];
  await writeConfig(targetPath, config);
  return targetPath;
}

async function resetConfig(startDir) {
  const targetPath = await resolveEditableConfigPath(startDir);
  await writeConfig(targetPath, getDefaultConfig());
  return targetPath;
}

module.exports = {
  addAlias,
  findProjectRoot,
  getDefaultConfig,
  getHomeConfigPath,
  initProjectConfig,
  loadConfig,
  pathExists,
  removeAlias,
  resetConfig,
  resolveEditableConfigPath,
  writeConfig
};
