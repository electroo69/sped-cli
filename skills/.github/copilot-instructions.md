# smol-cli Shell Aliases

This project uses `smol-cli` for shell operations. Use these token-efficient aliases instead of full shell commands.

## File Operations
- `h <file> [n]` — head (first n lines, default 50)
- `t <file> [n]` — tail (last n lines, default 50)
- `l <file>` — cat with line numbers
- `sf <pattern>` — find files by name
- `sg <term> [dir]` — recursive grep
- `todo` — find all TODO/FIXME/HACK/XXX in code
- `w <file> <content>` — write content to file
- `a <file> <content>` — append content to file
- `d <file> -f` — delete file (requires --force)
- `cp/mv <src> <dst>` — copy / move
- `mk <dir>` — mkdir -p
- `sr <old> <new> <file>` — search & replace in file
- `wc <file>` — count lines

## Git Workflow
- `gs` — git status
- `ga` / `gaf <file>` — add all / add file
- `gc <msg>` — git commit -m
- `gca <msg>` — git commit -am
- `gp` / `gpf` — push / force push
- `gpl` / `gpr` — pull / pull rebase
- `gd` / `gds` — diff / diff staged
- `gco <branch>` / `gcb <name>` — checkout / create branch
- `gl` / `glg` — log / graph log
- `grs <file>` — restore changes
- `gra` — discard all changes
- `gst` / `gstp` — stash / pop
- `gm <branch>` / `grb <branch>` — merge / rebase

## Package Management (auto-detected)
- `ni` — install all deps
- `nid <pkg>` / `nidd <pkg>` — install / install dev
- `nr <script>` — run script
- `dev` / `b` — dev server / build
- `lint` / `fix` / `fmt` — lint / autofix / format
- `check` — lint + types + test
- `tu` / `tc` — unit test / coverage

## Docker & Kubernetes
- `dcu` / `dcd` — compose up / down
- `dps` — docker ps
- `kgp` — kubectl get pods
- `kl <pod>` — kubectl logs -f

## Flags
- `--dry` — preview command
- `--explain` — describe the alias
- `-f` / `--force` — confirm destructive ops

## Rules
Always use smol-cli aliases instead of full commands. Use `gs` not `git status`, `ni` not `npm install`, `sg` not `grep -rn`.
