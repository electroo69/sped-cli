# smol-cli

> **242 token-efficient shell aliases for AI coding agents and developers.** One install, every command works standalone — no prefix needed.

[![npm version](https://img.shields.io/npm/v/smol-cli)](https://www.npmjs.com/package/smol-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

---

## What is smol-cli?

`smol-cli` is a **command dispatcher** that turns long, repetitive shell commands into ultra-short aliases. It was designed from the ground up for **AI coding agents** — tools like Claude Code, OpenAI Codex, Cursor, Gemini CLI, GitHub Copilot, and Windsurf — where every token counts.

Instead of typing `git commit -am "fix bug"`, an agent just types `gca fix bug`.
Instead of `kubectl get pods`, it's `kgp`.
Instead of `grep -rn TODO .`, it's `todo`.

**Every alias works as a standalone command.** No `smol` prefix required.

### Why does this matter?

| Problem | How smol-cli solves it |
|---------|----------------------|
| AI agents waste tokens on long shell commands | 242 aliases, each 1-4 characters |
| Agents hallucinate wrong flags/syntax | Built-in commands with correct semantics |
| Different projects use different package managers | Auto-detects npm/yarn/pnpm/bun |
| Shell aliases don't survive across machines | One `npm install -g` and everything works |
| PowerShell conflicts with short aliases | Automatic profile patching on Windows |

---

## Quick Start

### Install

```bash
npm install -g smol-cli
```

### Use

Every alias is a standalone command. No prefix needed:

```bash
# File operations
h README.md 20      # head — first 20 lines
t server.log 50     # tail — last 50 lines
l src/index.ts      # cat with line numbers
sf "*.tsx"           # find files by name
todo                 # find all TODO/FIXME/HACK/XXX

# Git workflow
gs                   # git status
ga                   # git add .
gc "fix auth bug"    # git commit -m "fix auth bug"
gp                   # git push
gd                   # git diff
glg                  # git log --oneline --graph --all

# Package managers (auto-detected)
ni                   # npm/yarn/pnpm install
dev                  # start dev server
b                    # build
lint                 # run linter
check                # lint + typecheck + test

# Docker & Kubernetes
dcu                  # docker compose up -d
kgp                  # kubectl get pods
kl my-pod            # kubectl logs -f my-pod

# Search & replace
sg "useState" src/   # grep -rn "useState" src/
rg "TODO"            # ripgrep search
sr old new file.txt  # sed replace in file
```

---

## Complete Alias Reference

### File Operations (20 commands)

| Alias | Expands To | Description |
|-------|-----------|-------------|
| `h <file> [n]` | `head -n {n\|50} <file>` | Show first n lines (default 50) |
| `t <file> [n]` | `tail -n {n\|50} <file>` | Show last n lines (default 50) |
| `l <file>` | `cat -n <file>` | Print file with line numbers |
| `v <file>` | `less <file>` | View file in pager |
| `e <file>` | `$EDITOR <file>` | Open in editor |
| `w <file> <content>` | write | Write content to file |
| `a <file> <content>` | append | Append content to file |
| `x <file>` | `test -e <file>` | Check if file exists |
| `i <file>` | `stat <file>` | File info (size, lines, type) |
| `d <file> --force` | `rm <file>` | Delete file (requires --force) |
| `cp <src> <dst>` | `cp <src> <dst>` | Copy file or directory |
| `mv <src> <dst>` | `mv <src> <dst>` | Move/rename file |
| `cat <file>` | `cat <file>` | Print entire file |
| `touch <file>` | `touch <file>` | Create empty file |
| `wc <file>` | `wc -l <file>` | Count lines |
| `sz [path]` | `du -sh <path>` | Directory/file size |
| `ch <file>` | `chmod +x <file>` | Make executable |
| `ln <src> <dst>` | `ln -s <src> <dst>` | Create symlink |
| `hd <file>` | `hexdump -C <file>` | Hex dump (first 20 lines) |
| `md5 <file>` | `md5sum <file>` | MD5 checksum |

### Search & Find (13 commands)

| Alias | Expands To | Description |
|-------|-----------|-------------|
| `sf <pattern>` | `find . -name <pattern>` | Find files by name |
| `sft <ext>` | `find . -name *.<ext>` | Find files by extension |
| `sfe <name> <cmd>` | `find … -exec <cmd>` | Find and execute |
| `sfs <size>` | `find . -type f -size +<size>` | Find files larger than |
| `sg <term> [dir]` | `grep -rn <term> <dir>` | Recursive grep |
| `sl <term> <dir>` | `grep -rn <term> <dir>` | Grep in specific directory |
| `si <term>` | `grep -rn import <term> .` | Search import statements |
| `sc <pattern>` | `grep -rn <pattern> .` | Search code symbols |
| `sr <old> <new> <file>` | `sed -i 's/old/new/g' file` | Search & replace in file |
| `rg <term> [dir]` | `rg <term> <dir>` | Ripgrep search |
| `rgf <term> [dir]` | `rg -l <term> <dir>` | Ripgrep (filenames only) |
| `rgc <term> [dir]` | `rg -c <term> <dir>` | Ripgrep (count matches) |
| `todo [dir]` | `grep -rn TODO\|FIXME…` | Find all TODOs and FIXMEs |

### Git (38 commands)

| Alias | Command | Description |
|-------|---------|-------------|
| `gs` | `git status` | Status |
| `ga` | `git add .` | Stage all |
| `gaf <file>` | `git add <file>` | Stage specific file |
| `gc <msg>` | `git commit -m` | Commit |
| `gca <msg>` | `git commit -am` | Commit all tracked |
| `gp` | `git push` | Push |
| `gpf` | `git push --force-with-lease` | Force push (safe) |
| `gpl` | `git pull` | Pull |
| `gpr` | `git pull --rebase` | Pull with rebase |
| `gd` | `git diff` | Diff |
| `gds` | `git diff --staged` | Diff staged |
| `gdf <file>` | `git diff <file>` | Diff specific file |
| `gco <branch>` | `git checkout <branch>` | Switch branch |
| `gcb <name>` | `git checkout -b <name>` | Create branch |
| `gb` | `git branch` | List branches |
| `gba` | `git branch -a` | List all branches |
| `gbd <name>` | `git branch -d <name>` | Delete branch |
| `gbD <name>` | `git branch -D <name>` | Force delete branch |
| `gl` | `git log --oneline -10` | Short log |
| `glg` | `git log --graph --all -20` | Visual graph log |
| `gla` | `git log --all -20` | All branches log |
| `grl` | `git reflog -10` | Recent reflog |
| `gst` | `git stash` | Stash changes |
| `gstp` | `git stash pop` | Pop stash |
| `gstl` | `git stash list` | List stashes |
| `grs <file>` | `git restore <file>` | Discard changes |
| `grss <file>` | `git restore --staged <file>` | Unstage file |
| `gra` | `git restore .` | Discard all changes |
| `gm <branch>` | `git merge <branch>` | Merge |
| `grb <branch>` | `git rebase <branch>` | Rebase |
| `grbi <ref>` | `git rebase -i <ref>` | Interactive rebase |
| `gcl <url>` | `git clone <url>` | Clone repo |
| `gbl <file>` | `git blame <file>` | Blame |
| `gtag <name>` | `git tag <name>` | Tag |
| `gcp <hash>` | `git cherry-pick <hash>` | Cherry-pick |
| `grv <hash>` | `git revert <hash>` | Revert commit |
| `gsh <ref>` | `git show <ref>` | Show commit |
| `grh <file>` | `git reset HEAD <file>` | Reset file |
| `grhh` | `git reset --hard HEAD` | Hard reset |
| `gcn` | `git clean -fd` | Clean untracked |
| `gf` | `git fetch` | Fetch |
| `gfa` | `git fetch --all` | Fetch all remotes |
| `gpsu <branch>` | `git push -u origin <branch>` | Push & set upstream |

### npm (15 commands)

| Alias | Command |
|-------|---------|
| `ni` | `npm install` |
| `nid <pkg>` | `npm install <pkg>` |
| `nidd <pkg>` | `npm install -D <pkg>` |
| `nig <pkg>` | `npm install -g <pkg>` |
| `nun <pkg>` | `npm uninstall <pkg>` |
| `nr <script>` | `npm run <script>` |
| `nu` | `npm update` |
| `nc` | `npm ci` |
| `nls` | `npm ls --depth=0` |
| `no` | `npm outdated` |
| `na` | `npm audit` |
| `naf` | `npm audit fix` |
| `np` | `npm publish` |
| `npx <cmd>` | `npx <cmd>` |
| `nd <file>` | `node <file>` |

### pnpm (7) · yarn (5) · bun (5)

| Alias | Command | Alias | Command | Alias | Command |
|-------|---------|-------|---------|-------|---------|
| `pni` | `pnpm install` | `yi` | `yarn install` | `bi` | `bun install` |
| `pna <pkg>` | `pnpm add` | `ya <pkg>` | `yarn add` | `ba <pkg>` | `bun add` |
| `pnad <pkg>` | `pnpm add -D` | `yad <pkg>` | `yarn add -D` | `bad <pkg>` | `bun add -d` |
| `pnr <script>` | `pnpm run` | `yr <script>` | `yarn run` | `br <script>` | `bun run` |
| `pnx <cmd>` | `pnpm exec` | `yu` | `yarn upgrade` | `bx <cmd>` | `bunx` |
| `pnu` | `pnpm update` | | | | |
| `pnls` | `pnpm ls` | | | | |

### Python (14 commands)

| Alias | Command | Description |
|-------|---------|-------------|
| `py <file>` | `python3 <file>` | Run Python file |
| `pi <pkg>` | `pip install <pkg>` | pip install |
| `pir` | `pip install -r requirements.txt` | Install from requirements |
| `pf` | `pip freeze` | List installed packages |
| `pfr` | `pip freeze > requirements.txt` | Freeze to file |
| `pun <pkg>` | `pip uninstall <pkg>` | pip uninstall |
| `venv` | `python3 -m venv .venv` | Create virtualenv |
| `act` | `source .venv/bin/activate` | Activate virtualenv |
| `pt` | `pytest` | Run tests |
| `ptv` | `pytest -v` | Verbose tests |
| `ptc` | `pytest --cov` | Tests with coverage |
| `dj <cmd>` | `python manage.py <cmd>` | Django manage.py |
| `drs` | `python manage.py runserver` | Django dev server |
| `dmm` | `python manage.py makemigrations` | Django migrations |

### Rust / Cargo (10 commands)

| Alias | Command |
|-------|---------|
| `cb` | `cargo build` |
| `cbr` | `cargo build --release` |
| `cr` | `cargo run` |
| `crr` | `cargo run --release` |
| `ct` | `cargo test` |
| `cc` | `cargo check` |
| `ccl` | `cargo clippy` |
| `cf` | `cargo fmt` |
| `cdoc` | `cargo doc --open` |
| `cadd <crate>` | `cargo add <crate>` |

### Go (7 commands)

| Alias | Command |
|-------|---------|
| `gor` | `go run .` |
| `gob` | `go build` |
| `got` | `go test -v ./...` |
| `gotc` | `go test -v -cover ./...` |
| `gof` | `go fmt ./...` |
| `gomod` | `go mod tidy` |
| `gog <pkg>` | `go get <pkg>` |

### Docker (18 commands)

| Alias | Command |
|-------|---------|
| `dc <cmd>` | `docker compose <cmd>` |
| `dcu` | `docker compose up -d` |
| `dcd` | `docker compose down` |
| `dcl <svc>` | `docker compose logs -f` |
| `dcr <svc>` | `docker compose restart` |
| `dcb` | `docker compose build` |
| `dps` | `docker ps` |
| `dpa` | `docker ps -a` |
| `di` | `docker images` |
| `dex <id>` | `docker exec -it <id> /bin/bash` |
| `dlog <id>` | `docker logs -f <id>` |
| `drm <id>` | `docker rm <id>` |
| `drmi <id>` | `docker rmi <id>` |
| `dpr` | `docker system prune -af` |
| `db <tag>` | `docker build -t <tag> .` |
| `drun <img>` | `docker run -it <img>` |
| `dstop <id>` | `docker stop <id>` |
| `dvol` | `docker volume ls` |

### Kubernetes (21 commands)

| Alias | Command |
|-------|---------|
| `k <cmd>` | `kubectl <cmd>` |
| `kgp` | `kubectl get pods` |
| `kga` | `kubectl get all` |
| `kgs` | `kubectl get svc` |
| `kgd` | `kubectl get deployments` |
| `kgn` | `kubectl get nodes` |
| `kgi` | `kubectl get ingress` |
| `kgns` | `kubectl get namespaces` |
| `kd <resource>` | `kubectl describe` |
| `kl <pod>` | `kubectl logs -f` |
| `kex <pod>` | `kubectl exec -it … /bin/bash` |
| `kaf <file>` | `kubectl apply -f` |
| `kdf <file>` | `kubectl delete -f` |
| `kns <ns>` | switch namespace |
| `kctx` | current context |
| `ksc <deploy> <n>` | scale replicas |
| `kpf <pod> <port>` | port-forward |
| `ktp` | `kubectl top pods` |
| `ktn` | `kubectl top nodes` |
| `kroll <deploy>` | rollout restart |
| `krs <deploy>` | rollout status |

### Terraform (11 commands)

| Alias | Command |
|-------|---------|
| `tf <cmd>` | `terraform <cmd>` |
| `tfi` | `terraform init` |
| `tfp` | `terraform plan` |
| `tfa` | `terraform apply` |
| `tfaa` | `terraform apply -auto-approve` |
| `tfd` | `terraform destroy` |
| `tfs` | `terraform state list` |
| `tff` | `terraform fmt` |
| `tfv` | `terraform validate` |
| `tfo` | `terraform output` |
| `tfw <ws>` | `terraform workspace` |

### Networking (10 commands)

| Alias | Command |
|-------|---------|
| `cur <url>` | `curl -s <url>` |
| `curj <url>` | curl with JSON header |
| `curp <url>` | curl POST |
| `curf <url> <out>` | curl download to file |
| `wgt <url>` | `wget <url>` |
| `ping <host>` | `ping -c 4 <host>` |
| `port <n>` | `lsof -i :<port>` |
| `myip` | show public IP |
| `dns <domain>` | `nslookup <domain>` |
| `ssl <host>` | check SSL certificate |

### Cloud Deployment (6 commands)

| Alias | Command |
|-------|---------|
| `vdep` | `vercel deploy` |
| `vprod` | `vercel --prod` |
| `ndep` | `netlify deploy --prod` |
| `fdep` | `firebase deploy` |
| `sdep <fn>` | `supabase functions deploy` |
| `rup` | `railway up` |

### System & Utilities (20+ commands)

| Alias | Command |
|-------|---------|
| `cls` | `clear` |
| `la` | `ls -la` |
| `ll` | `ls -lah` |
| `lt` | `tree . -L 3` |
| `up` | `cd ..` |
| `up2` | `cd ../..` |
| `up3` | `cd ../../..` |
| `mk <dir>` | `mkdir -p` |
| `hist` | `history` |
| `env` | `printenv` |
| `path` | `echo $PATH` |
| `now` | `date` |
| `ts` | Unix timestamp |
| `tgz <dir>` | create .tar.gz |
| `untgz <file>` | extract .tar.gz |
| `zipc <dir>` | create .zip |
| `unzipc <file>` | extract .zip |
| `sshi <host>` | `ssh <host>` |
| `scpu <src> <dst>` | `scp` upload |

---

## Configuration

### Initialize a project config

```bash
smol init
```

Creates `smol.config.json` with all default aliases. You can customize per-project.

### Add custom aliases

```bash
smol add myalias "my-custom-command {{1}}"
```

### List all aliases

```bash
smol ls
```

### Remove an alias

```bash
smol rm myalias
```

### Reset to defaults

```bash
smol reset
```

### Template syntax

Aliases use `{{n}}` placeholders for arguments with optional defaults:

```
"h": "head -n {{2|50}} {{1}}"
```

- `{{1}}` — first argument
- `{{2|50}}` — second argument, defaults to 50 if omitted
- Extra arguments are appended automatically

---

## AI Agent Integration

smol-cli ships with **ready-to-use instruction files** for every major AI coding agent. Copy the appropriate file into your project:

| Agent | File | Location |
|-------|------|----------|
| **Claude Code** | `CLAUDE.md` | Project root |
| **OpenAI Codex** | `AGENTS.md` | Project root |
| **Gemini CLI** | `GEMINI.md` | Project root |
| **GitHub Copilot** | `.github/copilot-instructions.md` | `.github/` directory |
| **Cursor** | `.cursor/rules/smol-cli.mdc` | `.cursor/rules/` directory |
| **Windsurf** | `.windsurf/rules/smol-cli.md` | `.windsurf/rules/` directory |

These files teach each agent to prefer smol-cli's short aliases over long shell commands, saving tokens and reducing errors.

### Quick setup for all agents

```bash
# Copy the instruction files you need from the skills/ directory:
cp node_modules/smol-cli/skills/CLAUDE.md ./CLAUDE.md
cp node_modules/smol-cli/skills/AGENTS.md ./AGENTS.md
cp node_modules/smol-cli/skills/GEMINI.md ./GEMINI.md
```

---

## Flags

| Flag | Effect |
|------|--------|
| `--dry` | Print the command without executing |
| `--explain` | Show what the alias does |
| `--force` / `-f` / `--yes` | Confirm destructive operations |
| `-v` / `--version` | Print version |
| `--help` | Print help |

```bash
gs --dry        # → prints "git status"
gs --explain    # → prints "Run git status"
d temp.txt -f   # → deletes temp.txt (--force required)
```

---

## Windows Support

On Windows PowerShell, several smol-cli aliases conflict with built-in PS aliases (`h`, `cp`, `mv`, `gc`, `gl`, etc.). The installer **automatically patches your PowerShell profile** to override these conflicts so all 242 commands work seamlessly.

After install, restart PowerShell or run:

```powershell
. $PROFILE
```

---

## How It Works

1. **Alias resolution** — smol-cli loads aliases from `smol.config.json` (or defaults)
2. **Built-in commands** — File operations (`h`, `t`, `l`, `sf`, etc.) run as native Node.js for cross-platform reliability
3. **Shell passthrough** — Git, Docker, k8s commands are dispatched to the real CLI tools
4. **Smart lifecycle** — `dev`, `build`, `lint`, `test` auto-detect your project's package manager and scripts

---

## FAQ

### Does smol-cli replace my shell aliases?

No. It complements them. smol-cli aliases are installed as standalone executables, so they work in any shell (bash, zsh, PowerShell, cmd) without manual `.bashrc` configuration.

### Can I add my own aliases?

Yes. Run `smol add <alias> "<command>"` or edit `smol.config.json` directly.

### Does it work without Node.js tools installed?

File operations (`h`, `t`, `l`, `sf`, `sg`, etc.) are built into smol-cli and work everywhere. Tool-specific aliases (like `kgp` for kubectl) require that tool to be installed.

### Is it safe to use in CI/CD?

Yes. All commands are non-interactive by default. Use `--dry` to preview.

---

## License

MIT © 2026
