const fs = require("fs/promises");
const path = require("path");

const { pathExists } = require("./config");

async function findMarkerDir(startDir, markerName) {
  let currentDir = path.resolve(startDir);

  for (;;) {
    if (await pathExists(path.join(currentDir, markerName))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

async function readPackageJson(startDir) {
  const packageRoot = await findMarkerDir(startDir, "package.json");
  const gitRoot = await findMarkerDir(startDir, ".git");
  const root = packageRoot || gitRoot || path.resolve(startDir);
  if (!packageRoot) {
    return {
      packageJson: null,
      packageJsonPath: null,
      root
    };
  }

  const packageJsonPath = path.join(packageRoot, "package.json");
  const raw = await fs.readFile(packageJsonPath, "utf8");
  return {
    packageJson: JSON.parse(raw),
    packageJsonPath,
    root: packageRoot
  };
}

function hasDependency(packageJson, name) {
  const deps = {
    ...(packageJson?.dependencies || {}),
    ...(packageJson?.devDependencies || {}),
    ...(packageJson?.optionalDependencies || {})
  };

  return Object.prototype.hasOwnProperty.call(deps, name);
}

function parsePackageManagerField(packageManagerField) {
  if (typeof packageManagerField !== "string") {
    return null;
  }

  if (packageManagerField.startsWith("pnpm@")) {
    return "pnpm";
  }

  if (packageManagerField.startsWith("yarn@")) {
    return "yarn";
  }

  if (packageManagerField.startsWith("npm@")) {
    return "npm";
  }

  return null;
}

async function detectPackageManager(startDir, configValue = "auto", packageJson = null) {
  if (configValue && configValue !== "auto") {
    return configValue;
  }

  const packageManagerField = parsePackageManagerField(packageJson?.packageManager);
  if (packageManagerField) {
    return packageManagerField;
  }

  const root = (await readPackageJson(startDir)).root;
  const checks = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
    ["npm-shrinkwrap.json", "npm"]
  ];

  for (const [fileName, manager] of checks) {
    if (await pathExists(path.join(root, fileName))) {
      return manager;
    }
  }

  return "npm";
}

async function detectTestRunner(startDir, configValue = "auto", packageJson = null) {
  if (configValue && configValue !== "auto") {
    return configValue;
  }

  const scripts = packageJson?.scripts || {};
  const scriptText = Object.values(scripts).join("\n");

  const byScript = [
    ["vitest", /vitest/],
    ["jest", /jest/],
    ["playwright", /playwright\s+test/],
    ["mocha", /mocha/],
    ["ava", /\bava\b/],
    ["node:test", /node\s+--test/]
  ];

  for (const [runner, matcher] of byScript) {
    if (matcher.test(scriptText)) {
      return runner;
    }
  }

  const root = (await readPackageJson(startDir)).root;
  const byFile = [
    ["vitest", ["vitest.config.js", "vitest.config.ts", "vitest.workspace.ts"]],
    ["jest", ["jest.config.js", "jest.config.cjs", "jest.config.ts"]],
    ["mocha", [".mocharc.json", ".mocharc.js"]],
    ["playwright", ["playwright.config.ts", "playwright.config.js"]]
  ];

  for (const [runner, files] of byFile) {
    for (const fileName of files) {
      if (await pathExists(path.join(root, fileName))) {
        return runner;
      }
    }
  }

  if (hasDependency(packageJson, "vitest")) {
    return "vitest";
  }

  if (hasDependency(packageJson, "jest")) {
    return "jest";
  }

  if (hasDependency(packageJson, "@playwright/test")) {
    return "playwright";
  }

  if (hasDependency(packageJson, "mocha")) {
    return "mocha";
  }

  if (hasDependency(packageJson, "ava")) {
    return "ava";
  }

  return "auto";
}

async function isGitRepo(startDir) {
  return Boolean(await findMarkerDir(startDir, ".git"));
}

async function detectEnvironment(startDir, config) {
  const packageInfo = await readPackageJson(startDir);
  const root = packageInfo.root || path.resolve(startDir);
  const packageManager = await detectPackageManager(root, config.packageManager, packageInfo.packageJson);
  const testRunner = await detectTestRunner(root, config.testRunner, packageInfo.packageJson);

  return {
    git: await isGitRepo(startDir),
    packageJson: packageInfo.packageJson,
    packageJsonPath: packageInfo.packageJsonPath,
    packageManager,
    root,
    scripts: packageInfo.packageJson?.scripts || {},
    testRunner
  };
}

module.exports = {
  detectEnvironment,
  detectPackageManager,
  detectTestRunner,
  hasDependency,
  isGitRepo,
  readPackageJson
};
