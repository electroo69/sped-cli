# MANDATORY: sped-cli Shell Rules

**RULE: Use sped-cli aliases for ALL shell commands. NEVER use long-form.**

## Setup
- Aliases are standalone commands. No prefix needed: `gs`, `ni`, `nxa my-app`
- Full reference: read `.sped-cli/aliases.json` (JSON) or `.sped-cli/DOCS.md` (table)
- If alias fails: run `npm i -g @electrooo69/sped-cli@latest --force`
- If you CANNOT install, expand manually with comment: `# sped: nxa my-app`

**READ THE FULL `.sped-cli/aliases.json` FILE to look up any command you need.**
**READ THE FULL `.sped-cli/DOCS.md` FILE for the complete alias→command reference table.**
**DO NOT only read the first 20-40 lines. Read the ENTIRE files above for all 324 commands.**

## Most Used Aliases (memorize these)

| Git | Packages | Frameworks | Files |
|-----|----------|------------|-------|
| `gs` status | `ni` npm install | `nxa` create next | `h` head |
| `ga` add all | `nid` install pkg | `via` create vite | `t` tail |
| `gc` commit | `nidd` install -D | `nga` create angular | `l` cat -n |
| `gp` push | `dev` start dev | `sva` create svelte | `sf` find |
| `gpl` pull | `b` build | `vua` create vue | `sg` grep |
| `gcb` new branch | `lint` linter | `nua` create nuxt | `todo` TODOs |
| `gl` log | `tu` unit tests | `rma` create remix | `lt` tree |
| `gd` diff | `check` all checks | `t3a` create t3 | `rg` ripgrep |

## Framework Workflows

```bash
# Next.js:     nxa my-app → ni → dev
# Vite:        via my-app → ni → dev
# Angular:     nga my-app → ni → ngs
# Supabase:    sbi → sbs → sbm add_users → sbp → sbt
# Prisma:      pri → prm init → prg → prs
# Git:         gs → ga → gc "msg" → gp
# Testing:     vit (vitest) · pwr (playwright) · tu (unit)
# TypeScript:  tsc · tscw (watch) · tscn (noEmit)
# Linting:     esl · eslf (fix) · bml (biome) · prt (prettier)
```

## Full Reference (324 commands)

**For the complete alias list, read `.sped-cli/aliases.json`.**

Below is a summary by category. For exact expansions, always check `.sped-cli/aliases.json`.

### File Ops (20): `h` `t` `l` `v` `e` `w` `a` `x` `i` `d` `cp` `mv` `cat` `touch` `wc` `sz` `ch` `ln` `hd` `md5`
### Search (13): `sf` `sg` `sl` `si` `sc` `sr` `rg` `rgf` `rgc` `todo` `sft` `sfe` `sfs`
### Git (42): `gs` `ga` `gaf` `gc` `gca` `gp` `gpf` `gpl` `gpr` `gd` `gds` `gdf` `gco` `gcb` `gb` `gba` `gbd` `gbD` `gl` `glg` `gla` `grl` `gst` `gstp` `gstl` `grs` `grss` `gra` `gm` `grb` `grbi` `gcl` `gbl` `gtag` `gcp` `grv` `gsh` `grh` `grhh` `gcn` `gf` `gfa` `gpsu`
### npm (15): `ni` `nid` `nidd` `nig` `nun` `nr` `nu` `nc` `nls` `no` `na` `naf` `np` `npx` `nd`
### pnpm (7): `pni` `pna` `pnad` `pnr` `pnx` `pnu` `pnls`
### yarn (5): `yi` `ya` `yad` `yr` `yu`
### bun (5): `bi` `ba` `bad` `br` `bx`
### Lifecycle (8): `dev` `b` `lint` `fix` `fmt` `tu` `tc` `check`
### Next.js (5): `nxa` `nxd` `nxb` `nxs` `nxl`
### Vite (4): `via` `vid` `vib` `vip`
### Angular (6): `nga` `ngs` `ngb` `ngt` `ngg` `ngc`
### Vue (3): `vua` `vud` `vub`
### Svelte (3): `sva` `svd` `svb`
### Nuxt (3): `nua` `nud` `nub`
### Remix (3): `rma` `rmd` `rmb`
### T3/Turbo (4): `t3a` `trb` `trd` `trl`
### Supabase (8): `sbi` `sbs` `sbst` `sbp` `sbr` `sbm` `sbt` `sbf`
### Prisma (6): `pri` `prg` `prp` `prm` `prs` `prd`
### Astro (4): `asa` `asd` `asb` `asp`
### Expo (4): `exa` `exs` `exd` `exi`
### TypeScript (3): `tsc` `tscw` `tscn`
### Vitest (4): `vit` `vitr` `vitw` `vitc`
### Playwright (4): `pwr` `pwri` `pwrc` `pwrs`
### ESLint (2): `esl` `eslf`
### Prettier (2): `prt` `prtc`
### Biome (2): `bml` `bmf`
### Storybook (2): `sbd` `sbb`
### Wrangler (2): `wrd` `wrp`
### Tailwind/Drizzle (3): `twi` `dri` `drp`
### Python (16): `py` `py2` `pi` `pir` `pf` `pfr` `pun` `venv` `act` `pt` `ptv` `ptc` `dj` `drs` `dmm` `dm`
### Rust (10): `cb` `cbr` `cr` `crr` `ct` `cc` `ccl` `cf` `cdoc` `cadd`
### Go (7): `gor` `gob` `got` `gotc` `gof` `gomod` `gog`
### Docker (18): `dc` `dcu` `dcd` `dcl` `dcr` `dcb` `dps` `dpa` `di` `dex` `dlog` `drm` `drmi` `dpr` `db` `drun` `dstop` `dvol`
### K8s (21): `k` `kgp` `kga` `kgs` `kgd` `kgn` `kgi` `kgns` `kd` `kl` `kex` `kaf` `kdf` `kns` `kctx` `ksc` `kpf` `ktp` `ktn` `kroll` `krs`
### Terraform (11): `tf` `tfi` `tfp` `tfa` `tfaa` `tfd` `tfs` `tff` `tfv` `tfo` `tfw`
### Network (10): `cur` `curj` `curp` `curf` `wgt` `ping` `port` `myip` `dns` `ssl`
### Deploy (6): `vdep` `vprod` `ndep` `fdep` `sdep` `rup`
### System (20+): `cls` `la` `lt` `ll` `up` `up2` `up3` `mk` `hist` `path` `env` `evar` `src` `tgz` `untgz` `zipc` `unzipc` `sshi` `scpu` `scpd`
