#!/usr/bin/env node

/**
 * sped setup — Installs skill files for AI agents in the current project.
 * 
 * Usage:
 *   sped setup              Auto-detect agents and install
 *   sped setup --all        Install for ALL agents
 *   sped setup --claude     Install only for Claude Code
 *   sped setup --codex      Install only for OpenAI Codex
 *   sped setup --gemini     Install only for Gemini CLI
 *   sped setup --copilot    Install only for GitHub Copilot
 *   sped setup --cursor     Install only for Cursor
 *   sped setup --windsurf   Install only for Windsurf
 *   sped setup --antigravity Install only for Antigravity
 *   sped setup --cline      Install only for Cline
 *   sped setup --amp        Install only for Amp
 *   sped setup --continue   Install only for Continue
 *   sped setup --aider      Install only for Aider
 *   sped setup --force      Overwrite existing files
 */

const fs = require("fs");
const path = require("path");

const SKILLS_DIR = path.join(__dirname, "..", "skills");
const args = process.argv.slice(2);
const hasFlag = (f) => args.includes(`--${f}`);
const forceOverwrite = hasFlag("force");
const installAll = hasFlag("all");

// Check if any specific agent flag was passed
const AGENT_FLAGS = [
  "claude", "codex", "gemini", "copilot", "cursor",
  "windsurf", "antigravity", "cline", "amp", "continue", "aider"
];
const specificAgents = AGENT_FLAGS.filter(f => hasFlag(f));
const hasSpecific = specificAgents.length > 0;

const AGENTS = [
  {
    name: "Claude Code",
    flag: "claude",
    detect: () => fs.existsSync(".claude") || fs.existsSync("CLAUDE.md"),
    src: path.join(SKILLS_DIR, "CLAUDE.md"),
    dst: "CLAUDE.md",
    always: true,
  },
  {
    name: "OpenAI Codex",
    flag: "codex",
    detect: () => fs.existsSync("AGENTS.md") || fs.existsSync(".codex"),
    src: path.join(SKILLS_DIR, "AGENTS.md"),
    dst: "AGENTS.md",
    always: true,
  },
  {
    name: "Gemini CLI",
    flag: "gemini",
    detect: () => fs.existsSync("GEMINI.md") || fs.existsSync(".gemini"),
    src: path.join(SKILLS_DIR, "GEMINI.md"),
    dst: "GEMINI.md",
    always: true,
  },
  {
    name: "GitHub Copilot",
    flag: "copilot",
    detect: () => fs.existsSync(".github"),
    src: path.join(SKILLS_DIR, ".github", "copilot-instructions.md"),
    dst: path.join(".github", "copilot-instructions.md"),
    always: false,
  },
  {
    name: "Cursor",
    flag: "cursor",
    detect: () => fs.existsSync(".cursor") || fs.existsSync(".cursorrules"),
    src: path.join(SKILLS_DIR, ".cursor", "rules", "smol-cli.mdc"),
    dst: path.join(".cursor", "rules", "sped-cli.mdc"),
    always: false,
  },
  {
    name: "Windsurf",
    flag: "windsurf",
    detect: () => fs.existsSync(".windsurf") || fs.existsSync(".windsurfrules"),
    src: path.join(SKILLS_DIR, ".windsurf", "rules", "smol-cli.md"),
    dst: path.join(".windsurf", "rules", "sped-cli.md"),
    always: false,
  },
  {
    name: "Antigravity",
    flag: "antigravity",
    detect: () => fs.existsSync(".gemini") || fs.existsSync(".agents"),
    src: path.join(SKILLS_DIR, "GEMINI.md"),
    dst: "GEMINI.md",
    always: false,
  },
  {
    name: "Cline",
    flag: "cline",
    detect: () => fs.existsSync(".cline") || fs.existsSync(".clinerules"),
    src: path.join(SKILLS_DIR, "AGENTS.md"),
    dst: path.join(".cline", "instructions.md"),
    always: false,
  },
  {
    name: "Amp",
    flag: "amp",
    detect: () => fs.existsSync(".amp"),
    src: path.join(SKILLS_DIR, "AGENTS.md"),
    dst: path.join(".amp", "instructions.md"),
    always: false,
  },
  {
    name: "Continue",
    flag: "continue",
    detect: () => fs.existsSync(".continue"),
    src: path.join(SKILLS_DIR, "AGENTS.md"),
    dst: path.join(".continue", "instructions.md"),
    always: false,
  },
  {
    name: "Aider",
    flag: "aider",
    detect: () => fs.existsSync(".aider.conf.yml") || fs.existsSync(".aiderignore"),
    src: path.join(SKILLS_DIR, "AGENTS.md"),
    dst: ".aider.instructions.md",
    always: false,
  },
];

function setup() {
  let installed = 0;
  let skipped = 0;

  console.log("\n⚡ sped-cli setup — Installing AI agent skill files\n");

  if (hasSpecific) {
    console.log(`  Targets: ${specificAgents.join(", ")}\n`);
  }

  for (const agent of AGENTS) {
    // Determine if we should install for this agent
    let shouldInstall;
    if (hasSpecific) {
      shouldInstall = specificAgents.includes(agent.flag);
    } else {
      shouldInstall = installAll || agent.always || agent.detect();
    }

    if (!shouldInstall) continue;

    // Skip Antigravity if Gemini already handled (same file)
    if (agent.flag === "antigravity" && !hasSpecific) continue;

    // Ensure parent directory exists
    const dir = path.dirname(agent.dst);
    if (dir !== ".") {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Don't overwrite unless --force
    if (fs.existsSync(agent.dst) && !forceOverwrite) {
      console.log(`  ⏭  ${agent.name} — ${agent.dst} (exists, use --force)`);
      skipped++;
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

  console.log("");
  if (installed > 0) {
    console.log(`  ✨ Installed ${installed} skill file(s). Your AI agents now know all 242 sped-cli commands.\n`);
  } else if (skipped > 0) {
    console.log(`  No new files installed (${skipped} already exist). Use --force to overwrite.\n`);
  } else {
    console.log("  No agents detected. Use --all or specify: --claude --codex --cursor etc.\n");
  }

  // Print available flags
  if (!hasSpecific && !installAll && installed === 0) {
    console.log("  Available flags:");
    AGENT_FLAGS.forEach(f => console.log(`    --${f}`));
    console.log("");
  }
}

setup();
