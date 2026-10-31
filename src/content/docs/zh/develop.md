---
title: 开发与发布
description: 本地开发、验证命令、双包管理器约定，以及打 tag 发版的完整流程。
group: maintenance
order: 9
---

## 环境

| 平台 | 依赖 |
| --- | --- |
| 通用 | Rust stable 1.77+、Node.js 20+、pnpm 10+、系统 OpenSSH |
| Windows | Visual Studio 2022（含「使用 C++ 的桌面开发」）、WebView2 Runtime |
| macOS | Xcode Command Line Tools（`xcode-select --install`） |

## 本地开发

```bash
pnpm install
pnpm tauri dev
```

也可以分开跑：终端 A 执行 `pnpm dev`（Vite，5173），终端 B 执行 `cargo run --manifest-path src-tauri/Cargo.toml`。

> **端口冲突**
> 开发服务器固定占用 5173。拿这个端口做隧道会（正确地）失败，报错里会点名 node 进程。

## 验证

提交前三条都要过：

```bash
pnpm build                                            # tsc -b 严格模式 + Vite 产物
cargo check --manifest-path src-tauri/Cargo.toml
cargo test  --manifest-path src-tauri/Cargo.toml      # 9 个测试
```

测试里有一条会真的拉起 PowerShell，大约 1.4 秒。

## 目录

```text
src/                 React 19 + TS + Tailwind 4
  lib/api.ts         tauri command 的类型化封装
  components/ui/     shadcn 风格基础组件
src-tauri/src/
  tunnel.rs          生命周期核心：启动判定、关闭、事件
  ssh_config.rs      ~/.ssh/config 解析
  store.rs           JSON 持久化（原子写）
  process.rs         跨平台进程检测 / 终止
  commands.rs        FFI 层
  tray.rs            系统托盘
```

## 两个包管理器

这是刻意的，不是历史遗留：

| 场景 | 包管理器 | 锁文件 |
| --- | --- | --- |
| 本地开发 | pnpm | `pnpm-lock.yaml` |
| GitHub Actions | npm | `package-lock.json` |

改依赖时两个都要更新。只更新一个的后果是 CI 的 `npm ci` 直接失败——这是有意的快停，而不是静默装上不同版本的依赖。

`tauri.conf.json` 的 `beforeBuildCommand` 是 `npm run build`，因为 CI 里只有 npm；`beforeDevCommand` 仍是 `pnpm dev`，本地流程不变。

## 图标

```bash
node scripts/gen-icons.mjs     # 生成 PNG / ICO / ICNS + 托盘模板图
node scripts/verify-icons.mjs  # 校验颜色与不透明区边距
```

两个平台细节：

- `.icns` 按 Apple 的 824-on-1024 栅格渲染（824×824 居中、四周 100px 透明边距、圆角 185.4）。不按这个栅格，macOS 26 会把图标缩小塞进灰色圆角底框。
- macOS 菜单栏图标必须是单色模板图（黑 + alpha，箭头镂空），由系统在浅色菜单栏画黑、深色画白；Windows 托盘仍用彩色应用图标。

`tauri-build` 在 `src-tauri/icons/icon.ico` 缺失时会直接硬失败。

## 平台配置

`tauri.windows.conf.json` 是 Windows 的覆盖层：

- 基础 `tauri.conf.json` 保持 `decorations: true`，macOS / Linux 用原生标题栏。
- 只有 Windows 覆盖为 `decorations: false`，前端据此决定是否渲染自绘标题栏（`src/lib/platform.ts`）。

合并规则是 JSON Merge Patch（RFC 7396）：**数组整体替换，不逐项合并**。所以 `app.windows` 对象在两个文件里是重复的，改窗口尺寸或标题时两边都要改。

## 发版

1. 改三处版本号，保持一致：`package.json`、`src-tauri/tauri.conf.json`、`src-tauri/Cargo.toml`。
2. 提交。
3. 打 tag 并推送：

```bash
git tag v1.0.2 && git push origin v1.0.2
```

工作流（`.github/workflows/release.yml`）会先校验 tag 与两个版本文件完全一致，不一致直接失败；然后矩阵编译：

| Runner | 目标 | 产物 |
| --- | --- | --- |
| `windows-latest` | x86_64-pc-windows-msvc | NSIS `*-setup.exe`、WiX `.msi` |
| `macos-latest` | aarch64-apple-darwin | `.dmg` |

最后以同名 tag 创建 Release、上传安装包，并把产物另存一份 workflow artifact。只需要仓库默认的 `GITHUB_TOKEN`；没有签名密钥，因此不生成 updater 清单。
