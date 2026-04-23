const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

/**
 * PowerShell built-in aliases that conflict with smol-cli aliases.
 * We remove these PS aliases and create global functions that
 * forward to the smol standalone bin instead.
 */
const PS_CONFLICTS = ["h", "cp", "mv", "cat", "sl", "si", "sc", "gc", "gp", "gl", "gm", "ni", "cls"];

const START_MARKER = "# >>> smol-cli aliases >>>";
const END_MARKER = "# <<< smol-cli aliases <<<";

function buildProfileBlock() {
  const lines = [START_MARKER];

  for (const alias of PS_CONFLICTS) {
    lines.push(
      `if (Test-Path Alias:${alias}) {`,
      `  Remove-Item Alias:${alias} -Force -ErrorAction SilentlyContinue`,
      `}`
    );
  }

  lines.push("");

  for (const alias of PS_CONFLICTS) {
    lines.push(`function global:${alias} { & smol ${alias} @args }`);
  }

  lines.push(END_MARKER, "");
  return lines.join("\n");
}

function isGlobalInstall() {
  return String(process.env.npm_config_global).toLowerCase() === "true";
}

function resolveProfilePaths() {
  const profiles = [];

  for (const candidate of ["pwsh", "powershell"]) {
    // Get the CurrentUserCurrentHost profile ($PROFILE default)
    const currentHost = spawnSync(candidate, [
      "-NoLogo",
      "-NoProfile",
      "-Command",
      "Write-Output $PROFILE"
    ], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true
    });

    if (currentHost.status === 0 && currentHost.stdout.trim()) {
      // Derive the AllHosts profile from the CurrentHost profile path
      // CurrentUserCurrentHost: .../Microsoft.PowerShell_profile.ps1
      // CurrentUserAllHosts:    .../profile.ps1
      const currentHostPath = currentHost.stdout.trim();
      const dir = path.dirname(currentHostPath);
      const allHostsPath = path.join(dir, "profile.ps1");

      profiles.push({
        binary: candidate,
        profilePath: allHostsPath
      });
    }
  }

  return profiles;
}

function upsertProfileBlock(profilePath) {
  const normalizedPath = path.resolve(profilePath);
  fs.mkdirSync(path.dirname(normalizedPath), { recursive: true });

  const existing = fs.existsSync(normalizedPath)
    ? fs.readFileSync(normalizedPath, "utf8")
    : "";

  const blockPattern = new RegExp(
    `${START_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\r?\\n?`,
    "g"
  );

  const block = buildProfileBlock();
  const next = blockPattern.test(existing)
    ? existing.replace(blockPattern, block)
    : `${existing}${existing && !existing.endsWith("\n") ? "\n" : ""}${block}`;

  if (next !== existing) {
    fs.writeFileSync(normalizedPath, next, "utf8");
    return true;
  }

  return false;
}

function main() {
  if (process.platform !== "win32" || !isGlobalInstall()) {
    return;
  }

  const profiles = resolveProfilePaths();
  if (profiles.length === 0) {
    return;
  }

  const patched = [];
  for (const { binary, profilePath } of profiles) {
    if (upsertProfileBlock(profilePath)) {
      patched.push(`${binary} → ${profilePath}`);
    }
  }

  if (patched.length > 0) {
    const aliases = PS_CONFLICTS.join(", ");
    process.stdout.write(
      `smol-cli: configured PowerShell profiles so [${aliases}] forward to smol.\n` +
      `Patched: ${patched.join(", ")}\n` +
      "Restart PowerShell or run `. $PROFILE` to apply.\n"
    );
  }
}

main();
