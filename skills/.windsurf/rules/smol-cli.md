# smol-cli Shell Aliases

This project uses `smol-cli` — a token-efficient command dispatcher with 242 shell aliases. Every alias is a standalone executable command (no prefix needed).

## File Operations
- `h <file> [n]` — head (first n lines, default 50)
- `t <file> [n]` — tail (last n lines)
- `l <file>` — cat with line numbers
- `sf <pattern>` — find files by name
- `sg <term> [dir]` — recursive grep
- `todo` — find TODO/FIXME/HACK/XXX
- `w <file> <content>` — write to file
- `a <file> <content>` — append to file
- `d <file> -f` — delete (requires -f)
- `cp/mv <src> <dst>` — copy/move
- `mk <dir>` — mkdir -p
- `sr <old> <new> <file>` — search & replace
- `wc <file>` — count lines

## Git Workflow
- `gs` — status, `ga` — add all, `gaf <f>` — add file
- `gc <msg>` — commit, `gca <msg>` — commit all
- `gp` — push, `gpf` — force push, `gpl` — pull
- `gd` — diff, `gds` — diff staged
- `gco <b>` — checkout, `gcb <b>` — create branch
- `gl` — log, `glg` — graph log
- `grs <f>` — restore, `gra` — restore all
- `gst` — stash, `gstp` — pop
- `gm <b>` — merge, `grb <b>` — rebase

## Package Management (auto-detects npm/yarn/pnpm/bun)
- `ni` — install, `nid <pkg>` — add dep
- `dev` — dev server, `b` — build
- `lint`/`fix`/`fmt` — lint/autofix/format
- `check` — lint + types + test
- `tu`/`tc` — test/coverage

## Docker & Kubernetes
- `dcu`/`dcd` — compose up/down, `dps` — ps
- `kgp` — get pods, `kl <pod>` — logs
- `kaf <f>` — kubectl apply -f

## Terraform
- `tfi`/`tfp`/`tfa` — init/plan/apply

## Flags
- `--dry` — preview command without executing
- `--explain` — describe what the alias does
- `-f` / `--force` — confirm destructive operations

## Rules
- Always use smol-cli aliases instead of full shell commands
- Use `gs` not `git status`, `ni` not `npm install`
- Use `sg` not `grep -rn`, `sf` not `find`
- Run `smol ls` to see all 242 available aliases
