---
title: Development & release
description: Local development, verification commands, the two-package-manager rule, and how a tag becomes a release.
group: maintenance
order: 9
---

## Environment

| Platform | Requirements |
| --- | --- |
| Both | Rust stable 1.77+, Node.js 20+, pnpm 10+, system OpenSSH |
| Windows | Visual Studio 2022 with “Desktop development with C++”, WebView2 runtime |
| macOS | Xcode Command Line Tools (`xcode-select --install`) |

## Local development

```bash
pnpm install
pnpm tauri dev
```

Or run the halves separately: `pnpm dev` (Vite, port 5173) in one terminal and `cargo run --manifest-path src-tauri/Cargo.toml` in another.

> **Port collision**
> The dev server owns port 5173. Using that port for a tunnel fails (correctly), and the error names the node process.

## Verification

All three must pass before committing:

```bash
pnpm build                                            # tsc -b strict + Vite output
cargo check --manifest-path src-tauri/Cargo.toml
cargo test  --manifest-path src-tauri/Cargo.toml      # 9 tests
```

One of the tests really spawns PowerShell, which takes about 1.4 seconds.

## Layout

```text
src/                 React 19 + TS + Tailwind 4
  lib/api.ts         typed wrappers around tauri commands
  components/ui/     shadcn-style primitives
src-tauri/src/
  tunnel.rs          lifecycle core: success detection, stop, events
  ssh_config.rs      ~/.ssh/config parser
  store.rs           JSON persistence (atomic writes)
  process.rs         cross-platform process checks / termination
  commands.rs        FFI layer
  tray.rs            system tray
```

## Two package managers

This is deliberate, not legacy:

| Context | Package manager | Lockfile |
| --- | --- | --- |
| Local development | pnpm | `pnpm-lock.yaml` |
| GitHub Actions | npm | `package-lock.json` |

Both must be updated when dependencies change. Updating only one makes CI fail at `npm ci` — a deliberate fast stop instead of silently installing different versions.

`tauri.conf.json` uses `npm run build` for `beforeBuildCommand` because CI only has npm; `beforeDevCommand` stays `pnpm dev`, so the local workflow is unchanged.

## Icons

```bash
node scripts/gen-icons.mjs     # PNG / ICO / ICNS + the tray template image
node scripts/verify-icons.mjs  # colour and opaque-margin checks
```

Two platform details:

- The `.icns` is rendered on Apple’s 824-on-1024 grid (824×824 centred, 100 px transparent margin, radius 185.4). Off that grid, macOS 26 shrinks the icon into a grey rounded frame.
- The macOS menu-bar icon must be a monochrome template image (black + alpha, arrow knocked out); the system draws it black on a light menu bar and white on a dark one. Windows keeps the coloured app icon in the tray.

`tauri-build` hard-fails when `src-tauri/icons/icon.ico` is missing.

## Platform config

`tauri.windows.conf.json` is the Windows overlay:

- The base `tauri.conf.json` keeps `decorations: true`, so macOS and Linux get the native title bar.
- Only Windows overrides it to `decorations: false`; the frontend then decides whether to render the custom title bar (`src/lib/platform.ts`).

Merging follows JSON Merge Patch (RFC 7396): **arrays are replaced wholesale**. The `app.windows` object is therefore duplicated in both files, and window size or title changes must be made in both.

## Releasing

1. Bump the version in three places, consistently: `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`.
2. Commit.
3. Tag and push:

```bash
git tag v1.0.2 && git push origin v1.0.2
```

The workflow (`.github/workflows/release.yml`) first verifies that the tag matches both version files and fails immediately if not, then builds a matrix:

| Runner | Target | Artifacts |
| --- | --- | --- |
| `windows-latest` | x86_64-pc-windows-msvc | NSIS `*-setup.exe`, WiX `.msi` |
| `macos-latest` | aarch64-apple-darwin | `.dmg` |

It then creates a release under the same tag, uploads the installers, and archives them as a workflow artifact. Only the default `GITHUB_TOKEN` is needed; with no signing keys configured, no updater manifest is generated.
