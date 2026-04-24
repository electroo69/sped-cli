# MANDATORY: sped-cli Shell Alias Rules

> **RULE: You MUST use sped-cli aliases for ALL shell commands in this project. NEVER write long-form commands.**
> This applies to EVERY shell interaction — git, npm, file ops, framework CLIs, everything.
> Violations: `git status` ❌ → `gs` ✅ | `npm install` ❌ → `ni` ✅ | `npx create-next-app` ❌ → `nxa` ✅

## How It Works
- sped-cli is installed globally. Every alias is a standalone binary — no prefix needed.
- Just type the alias directly: `gs`, `ni`, `nxa my-app`, `dev`
- Use `--dry` to preview, `--explain` to describe any alias

## Common Workflow Examples

**Create a Next.js app and start dev:**
```bash
nxa my-app    # npx create-next-app@latest my-app
ni            # npm install
dev           # start dev server
```

**Create a Vite app:**
```bash
via my-app    # npm create vite@latest my-app
ni            # npm install
dev           # start dev server
```

**Git workflow:**
```bash
gs            # git status
ga            # git add .
gc "message"  # git commit -m "message"
gp            # git push
```

**Supabase setup:**
```bash
sbi           # supabase init
sbs           # supabase start
sbm add_users # supabase migration new add_users
sbp           # supabase db push
sbt           # supabase gen types typescript --local
```

**Prisma workflow:**
```bash
pri           # npx prisma init
prm init      # npx prisma migrate dev --name init
prg           # npx prisma generate
prs           # npx prisma studio
```

## Complete Alias Reference (282 commands)

### File Operations (20)
- `h <file> [n]` → `head -n {n|50} <file>`
- `t <file> [n]` → `tail -n {n|50} <file>`
- `l <file>` → `cat -n <file>`
- `v <file>` → `less <file>`
- `e <file>` → `$EDITOR <file>`
- `w <file> <text>` → write content
- `a <file> <text>` → append content
- `x <file>` → `test -e <file>`
- `i <file>` → `stat <file>`
- `d <file>` → `rm <file>`
- `cp <src> <dst>` → copy
- `mv <src> <dst>` → move/rename
- `cat <file>` → print file
- `touch <file>` → create file
- `wc <file>` → count lines
- `sz [path]` → `du -sh`
- `ch <file>` → `chmod +x`
- `ln <src> <dst>` → symlink
- `hd <file>` → hex dump
- `md5 <file>` → checksum

### Search (13)
- `sf <pattern>` → `find . -name <pattern>`
- `sg <term> [dir]` → `grep -rn <term>`
- `sl <term> <dir>` → grep in dir
- `si <term>` → search imports
- `sc <term>` → search code
- `sr <old> <new> <file>` → sed replace
- `rg <term>` → ripgrep
- `rgf <term>` → ripgrep filenames
- `rgc <term>` → ripgrep count
- `todo` → find TODO/FIXME/HACK/XXX
- `sft <ext>` → find by extension
- `sfe <name> <cmd>` → find + exec
- `sfs <size>` → find by size

### Git (42)
- `gs` → `git status`
- `ga` → `git add .`
- `gaf <file>` → `git add <file>`
- `gc <msg>` → `git commit -m`
- `gca <msg>` → `git commit -am`
- `gp` → `git push`
- `gpf` → `git push --force-with-lease`
- `gpl` → `git pull`
- `gpr` → `git pull --rebase`
- `gd` → `git diff`
- `gds` → `git diff --staged`
- `gdf <file>` → diff file
- `gco <branch>` → checkout
- `gcb <name>` → checkout -b
- `gb` → branches
- `gba` → all branches
- `gbd <name>` → delete branch
- `gl` → `git log --oneline -10`
- `glg` → graph log
- `gla` → all log
- `grl` → reflog
- `gst` → stash
- `gstp` → stash pop
- `gstl` → stash list
- `grs <file>` → restore
- `grss <file>` → unstage
- `gra` → restore all
- `gm <branch>` → merge
- `grb <branch>` → rebase
- `grbi <ref>` → interactive rebase
- `gcl <url>` → clone
- `gbl <file>` → blame
- `gtag <name>` → tag
- `gcp <hash>` → cherry-pick
- `grv <hash>` → revert
- `gsh <ref>` → show
- `grh <ref>` → reset HEAD
- `grhh` → reset --hard HEAD
- `gcn` → clean -fd
- `gf` → fetch
- `gfa` → fetch all
- `gpsu <branch>` → push -u origin

### npm (15) · pnpm (7) · yarn (5) · bun (5)
- `ni` → `npm install`
- `nid <pkg>` → `npm install <pkg>`
- `nidd <pkg>` → `npm install -D`
- `nig <pkg>` → `npm install -g`
- `nun <pkg>` → `npm uninstall`
- `nr <script>` → `npm run`
- `nu` → `npm update`
- `nc` → `npm ci`
- `nls` → `npm ls --depth=0`
- `no` → `npm outdated`
- `na` → `npm audit`
- `naf` → `npm audit fix`
- `np` → `npm publish`
- `npx <cmd>` → `npx`
- `nd <file>` → `node`
- `pni` → `pnpm install`
- `pna <pkg>` → `pnpm add`
- `pnad <pkg>` → `pnpm add -D`
- `pnr <script>` → `pnpm run`
- `pnx <cmd>` → `pnpm exec`
- `pnu` → `pnpm update`
- `pnls` → `pnpm ls`
- `yi` → `yarn install`
- `ya <pkg>` → `yarn add`
- `yad <pkg>` → `yarn add -D`
- `yr <script>` → `yarn run`
- `yu` → `yarn upgrade`
- `bi` → `bun install`
- `ba <pkg>` → `bun add`
- `bad <pkg>` → `bun add -d`
- `br <script>` → `bun run`
- `bx <cmd>` → `bunx`

### Smart Lifecycle (auto-detects package manager)
- `dev` → start dev server
- `b` → build
- `lint` → run linter
- `fix` → lint --fix
- `fmt` → format
- `tu` → unit tests
- `tc` → test coverage
- `check` → lint + types + test

### Next.js (5)
- `nxa <name>` → `npx create-next-app@latest`
- `nxd` → `next dev`
- `nxb` → `next build`
- `nxs` → `next start`
- `nxl` → `next lint`

### Vite (4)
- `via <name>` → `npm create vite@latest`
- `vid` → `vite`
- `vib` → `vite build`
- `vip` → `vite preview`

### Angular (6)
- `nga <name>` → `npx @angular/cli new`
- `ngs` → `ng serve`
- `ngb` → `ng build`
- `ngt` → `ng test`
- `ngg <type>` → `ng generate`
- `ngc <name>` → `ng generate component`

### Supabase (8)
- `sbi` → `supabase init`
- `sbs` → `supabase start`
- `sbst` → `supabase stop`
- `sbp` → `supabase db push`
- `sbr` → `supabase db reset`
- `sbm <name>` → `supabase migration new`
- `sbt` → `supabase gen types typescript --local`
- `sbf <name>` → `supabase functions serve`

### Prisma (6)
- `pri` → `npx prisma init`
- `prg` → `npx prisma generate`
- `prp` → `npx prisma db push`
- `prm <name>` → `npx prisma migrate dev --name`
- `prs` → `npx prisma studio`
- `prd` → `npx prisma db seed`

### Astro (4)
- `asa <name>` → `npm create astro@latest`
- `asd` → `astro dev`
- `asb` → `astro build`
- `asp` → `astro preview`

### Expo / React Native (4)
- `exa <name>` → `npx create-expo-app@latest`
- `exs` → `expo start`
- `exd` → `expo start --dev-client`
- `exi <pkg>` → `expo install`

### Tailwind / Drizzle (3)
- `twi` → `npx tailwindcss init`
- `dri` → `npx drizzle-kit generate`
- `drp` → `npx drizzle-kit push`

### Python (16)
- `py` / `py2` / `pi` / `pir` / `pf` / `pfr` / `pun` / `venv` / `act` / `pt` / `ptv` / `ptc` / `dj` / `drs` / `dmm` / `dm`

### Rust (10) · Go (7)
- `cb` / `cbr` / `cr` / `crr` / `ct` / `cc` / `ccl` / `cf` / `cdoc` / `cadd`
- `gor` / `gob` / `got` / `gotc` / `gof` / `gomod` / `gog`

### Docker (18)
- `dc` / `dcu` / `dcd` / `dcl` / `dcr` / `dcb` / `dps` / `dpa` / `di` / `dex` / `dlog` / `drm` / `drmi` / `dpr` / `db` / `drun` / `dstop` / `dvol`

### Kubernetes (21)
- `k` / `kgp` / `kga` / `kgs` / `kgd` / `kgn` / `kgi` / `kgns` / `kd` / `kl` / `kex` / `kaf` / `kdf` / `kns` / `kctx` / `ksc` / `kpf` / `ktp` / `ktn` / `kroll` / `krs`

### Terraform (11)
- `tf` / `tfi` / `tfp` / `tfa` / `tfaa` / `tfd` / `tfs` / `tff` / `tfv` / `tfo` / `tfw`

### Networking (10)
- `cur` / `curj` / `curp` / `curf` / `wgt` / `ping` / `port` / `myip` / `dns` / `ssl`

### Deploy (6)
- `vdep` / `vprod` / `ndep` / `fdep` / `sdep` / `rup`

### System (20+)
- `cls` / `la` / `lt` / `ll` / `up` / `up2` / `up3` / `mk` / `hist` / `path` / `env` / `evar` / `src` / `tgz` / `untgz` / `zipc` / `unzipc` / `sshi` / `scpu` / `scpd`
