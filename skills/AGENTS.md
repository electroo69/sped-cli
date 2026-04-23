# smol-cli — Agent Shell Command Reference

This project uses `smol-cli` (v0.1.0) for all shell operations. smol-cli provides 242 token-efficient aliases that replace long shell commands with 1-4 character shortcuts.

**Every alias is a standalone command. Do not prefix with `smol`.**

## Setup
- Install: `npm install -g smol-cli`
- Config: `smol init` creates `smol.config.json`
- List aliases: `smol ls`

## File Operations
| Command | Purpose |
|---------|---------|
| `h <file> [n]` | First n lines (default 50) |
| `t <file> [n]` | Last n lines (default 50) |
| `l <file>` | Print with line numbers |
| `cat <file>` | Print entire file |
| `w <file> <text>` | Write to file |
| `a <file> <text>` | Append to file |
| `d <file> -f` | Delete (requires -f) |
| `cp <src> <dst>` | Copy |
| `mv <src> <dst>` | Move/rename |
| `mk <dir>` | mkdir -p |
| `touch <file>` | Create empty file |
| `i <file>` | File info |
| `wc <file>` | Count lines |
| `sz [path]` | Directory size |
| `x <file>` | Check existence (exit 0/1) |

## Search
| Command | Purpose |
|---------|---------|
| `sf <pattern>` | Find files by name |
| `sg <term> [dir]` | Recursive grep |
| `sc <pattern>` | Search code symbols |
| `si <term>` | Search imports |
| `todo [dir]` | Find TODO/FIXME/HACK |
| `sr <old> <new> <file>` | Search & replace |
| `rg <term> [dir]` | Ripgrep |

## Git
| Command | Purpose |
|---------|---------|
| `gs` | status |
| `ga` / `gaf <f>` | add all / add file |
| `gc <msg>` / `gca <msg>` | commit / commit all |
| `gp` / `gpf` | push / force push |
| `gpl` / `gpr` | pull / pull rebase |
| `gd` / `gds` | diff / diff staged |
| `gco <b>` / `gcb <b>` | checkout / create branch |
| `gb` / `gba` | branches / all branches |
| `gl` / `glg` | log / graph log |
| `grs <f>` / `gra` | restore file / restore all |
| `grss <f>` | unstage |
| `gst` / `gstp` | stash / stash pop |
| `gm <b>` / `grb <b>` | merge / rebase |
| `gcl <url>` | clone |
| `gbl <f>` | blame |

## Package Manager (auto-detected)
| Command | Purpose |
|---------|---------|
| `ni` | install |
| `nid <pkg>` / `nidd <pkg>` | add dep / add dev dep |
| `nr <script>` | run script |
| `dev` | dev server |
| `b` | build |
| `lint` / `fix` / `fmt` | lint / autofix / format |
| `check` | lint + types + test |
| `tu` / `tc` | unit test / coverage |

## Docker & Kubernetes
| Command | Purpose |
|---------|---------|
| `dcu` / `dcd` | compose up / down |
| `dps` / `dpa` | ps / ps all |
| `kgp` / `kga` | get pods / get all |
| `kl <pod>` | logs |
| `kaf <f>` | apply -f |

## Terraform
| Command | Purpose |
|---------|---------|
| `tfi` / `tfp` / `tfa` | init / plan / apply |

## Flags
- `--dry` — preview without executing
- `--explain` — describe the command
- `-f` / `--force` — confirm destructive ops

## Conventions
- Always use smol aliases instead of full shell commands
- Prefer `gs` over `git status`, `ni` over `npm install`
- Use `--dry` before destructive operations
- Use `todo` to find code annotations
