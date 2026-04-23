# Project Instructions

## Shell Commands
This project uses `smol-cli` — a token-efficient command dispatcher with 242 shell aliases. Every alias is a standalone command (no prefix needed).

## Role
When executing shell commands, always prefer smol-cli aliases over full commands. This saves tokens and reduces syntax errors.

## Key Aliases

### Files
- `h <file> [n]` → head (first n lines)
- `t <file> [n]` → tail (last n lines)
- `l <file>` → cat with line numbers
- `sf <pattern>` → find files
- `sg <term> [dir]` → grep recursive
- `todo` → find TODO/FIXME/HACK/XXX
- `w <file> <content>` → write to file
- `a <file> <content>` → append to file
- `d <file> -f` → delete (requires -f flag)
- `cp <src> <dst>` → copy
- `mv <src> <dst>` → move/rename
- `mk <dir>` → mkdir -p
- `sr <old> <new> <file>` → search & replace

### Git
- `gs` → git status
- `ga` → git add .
- `gc <msg>` → git commit -m
- `gca <msg>` → git commit -am
- `gp` → git push
- `gpl` → git pull
- `gd` → git diff
- `gco <branch>` → checkout
- `gcb <name>` → create branch
- `gl` → git log --oneline
- `grs <file>` → restore changes
- `gra` → restore all
- `gst` → stash
- `gstp` → stash pop
- `gm <branch>` → merge
- `gcl <url>` → clone

### Build & Dev (auto-detects package manager)
- `ni` → install dependencies
- `nid <pkg>` → install package
- `dev` → start dev server
- `b` → build project
- `lint` → run linter
- `fix` → autofix
- `fmt` → format code
- `check` → lint + typecheck + test
- `tu` → unit tests
- `tc` → test coverage

### Docker
- `dcu` → docker compose up -d
- `dcd` → docker compose down
- `dps` → docker ps

### Kubernetes
- `kgp` → kubectl get pods
- `kl <pod>` → kubectl logs -f
- `kaf <file>` → kubectl apply -f

### Navigation
- `la` → ls -la
- `lt` → tree (depth 3)
- `up` → cd ..

## Known Facts
- smol-cli auto-detects npm/yarn/pnpm/bun
- Use `--dry` flag to preview commands
- Use `--explain` to see what an alias does
- Destructive commands (like `d`) require `--force` or `-f`

## Instructions
- Always use smol aliases, never full shell commands
- Use `sg` instead of `grep`, `sf` instead of `find`
- Use `gs`/`ga`/`gc`/`gp` for git workflow
- Run `smol ls` to see all available aliases
