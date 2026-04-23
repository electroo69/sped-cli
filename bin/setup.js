#!/usr/bin/env node

/**
 * sped setup — Installs skill files for detected AI agents in the current project.
 * Usage: sped setup
 * 
 * Detects which AI agents are configured in the project and copies
 * the appropriate skill file so the agent knows all 242 sped-cli commands.
 */

const fs = require("fs");
const path = require("path");

const SKILLS_DIR = path.join(__dirname, "..", "skills");

const AGENTS = [
  {
    name: "Claude Code",
    detect: () => fs.existsSync(".claude") || fs.existsSync("CLAUDE.md"),
    src: path.join(SKILLS_DIR, "CLAUDE.md"),
    dst: "CLAUDE.md",
    always: true, // Always install — it's the universal standard
  },
  {
    name: "OpenAI Codex",
    detect: () => fs.existsSync("AGENTS.md") || fs.existsSync(".codex"),
    src: path.join(SKILLS_DIR, "AGENTS.md"),
    dst: "AGENTS.md",
    always: true, // AGENTS.md is cross-agent standard
  },
  {
    name: "Gemini CLI",
    detect: () => fs.existsSync("GEMINI.md") || fs.existsSync(".gemini"),
    src: path.join(SKILLS_DIR, "GEMINI.md"),
    dst: "GEMINI.md",
    always: true,
  },
  {
    name: "GitHub Copilot",
    detect: () => fs.existsSync(".github"),
    src: path.join(SKILLS_DIR, ".github", "copilot-instructions.md"),
    dst: path.join(".github", "copilot-instructions.md"),
    always: false,
  },
  {
    name: "Cursor",
    detect: () => fs.existsSync(".cursor") || fs.existsSync(".cursorrules"),
    src: path.join(SKILLS_DIR, ".cursor", "rules", "smol-cli.mdc"),
    dst: path.join(".cursor", "rules", "sped-cli.mdc"),
    always: false,
  },
  {
    name: "Windsurf",
    detect: () => fs.existsSync(".windsurf") || fs.existsSync(".windsurfrules"),
    src: path.join(SKILLS_DIR, ".windsurf", "rules", "smol-cli.md"),
    dst: path.join(".windsurf", "rules", "sped-cli.md"),
    always: false,
  },
];

function setup() {
  const installAll = process.argv.includes("--all");
  let installed = 0;

  console.log("\n⚡ sped-cli setup — Installing AI agent skill files\n");

  for (const agent of AGENTS) {
    const shouldInstall = installAll || agent.always || agent.detect();
    
    if (!shouldInstall) continue;

    // Ensure parent directory exists
    const dir = path.dirname(agent.dst);
    if (dir !== ".") {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Don't overwrite existing files unless --force
    if (fs.existsSync(agent.dst) && !process.argv.includes("--force")) {
      console.log(`  ⏭  ${agent.name} — ${agent.dst} already exists (use --force to overwrite)`);
      continue;
    }

    try {
      fs.copyFileSync(agent.src, agent.dst);
      console.log(`  ✅ ${agent.name} — ${agent.dst}`);
      installed++;
    } catch (err) {
      console.log(`  ❌ ${agent.name} — ${err.message}`);
    }
  }

  if (installed === 0) {
    console.log("  No new skill files installed.\n");
  } else {
    console.log(`\n  Installed ${installed} skill file(s). Your AI agents now know all 242 sped-cli commands.\n`);
  }
}

setup();
