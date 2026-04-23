# smol-cli — Shell Command Reference

This project uses `smol-cli` for all shell operations. **Always use smol aliases instead of full commands.** Every alias is a standalone executable — no `smol` prefix needed.

## Essential Commands

### File Operations
- `h <file> [n]` — head (first n lines, default 50)
- `t <file> [n]` — tail (last n lines, default 50)
- `l <file>` — cat with line numbers
- `cat <file>` — print entire file
- `sf <pattern>` — find files by name
- `sg <term> [dir]` — recursive grep
- `todo` — find all TODO/FIXME/HACK/XXX
- `wc <file>` — count lines
- `i <file>` — file info (size, lines, type)
- `w <file> <content>` — write content to file
- `a <file> <content>` — append content to file
- `d <file> -f` — delete (requires --force)
- `cp <src> <dst>` — copy
- `mv <src> <dst>` — move/rename
- `mk <dir>` — mkdir -p
- `touch <file>` — create empty file
- `sr <old> <new> <file>` — sed search & replace

### Git (use these, never raw git commands)
- `gs` — git status
- `ga` — git add .
- `gaf <file>` — git add specific file
- `gc <msg>` — git commit -m
- `gca <msg>` — git commit -am
- `gp` — git push
- `gpf` — git push --force-with-lease
- `gpl` — git pull
- `gd` — git diff
- `gds` — git diff --staged
- `gco <branch>` — checkout branch
- `gcb <name>` — create branch
- `gb` — list branches
- `gl` — git log --oneline -10
- `glg` — git log --graph --all
- `grs <file>` — restore/discard changes
- `grss <file>` — unstage file
- `gra` — discard ALL changes
- `gst` — git stash
- `gstp` — git stash pop
- `gm <branch>` — merge
- `grb <branch>` — rebase
- `gcl <url>` — clone

### Package Manager (auto-detected: npm/yarn/pnpm)
- `ni` — install all deps
- `nid <pkg>` — install package
- `nidd <pkg>` — install dev dependency
- `nr <script>` — run script
- `dev` — start dev server
- `b` — build
- `lint` — run linter
- `fix` — run auto-fixes
- `fmt` — format code
- `check` — lint + typecheck + test
- `tu` — run unit tests
- `tc` — run test coverage

### Docker
- `dcu` — docker compose up -d
- `dcd` — docker compose down
- `dps` — docker ps
- `dlog <id>` — docker logs -f

### Kubernetes
- `kgp` — kubectl get pods
- `kga` — kubectl get all
- `kl <pod>` — kubectl logs -f
- `kaf <file>` — kubectl apply -f

### Navigation
- `la` — ls -la
- `ll` — ls -lah
- `lt` — tree (depth 3)
- `up` — cd ..

## Flags
- `--dry` — print command without executing
- `--explain` — describe what the alias does
- `--force` / `-f` — confirm destructive ops

## Rules
- ALWAYS prefer smol aliases over raw shell commands
- Use `--dry` to preview before destructive operations
- Use `gs` not `git status`, `ni` not `npm install`, etc.
- When searching code, use `sg`, `sf`, `todo` — not raw grep/find
