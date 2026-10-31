---
title: 工作原理
description: 成功判定、失败归因、进程校验和关闭顺序——代码里实际发生的事。
group: internals
order: 6
---

## 数据流

```text
React UI ──invoke──▶ commands.rs ──▶ tunnel.rs ──▶ tokio::process  ssh -N -L …
   ▲                    │              │
   │                    │              ├─▶ store.rs    tunnels.json（原子写）
   │                    │              └─▶ process.rs  存活检测 / 终止
   │                    └─▶ ssh_config.rs  Host 下拉列表
   │
   ├─ 每 3s list_tunnels 轮询
   └─ listen("tunnel-exited") ◀── 回收任务（ssh 退出即时通知）
```

## 启动判定：监听，而不是等待

`ssh -L` 只有在认证通过后才会绑定本地端口。所以「本地端口进入监听」是唯一可靠的信号。

```text
每 150ms 探测一次 bind:port
  ├─ 监听成功 ─────────────▶ 成功，记录落盘
  ├─ 进程已退出 ───────────▶ 解析 stderr，归类失败原因
  └─ 18 秒仍未监听 ────────▶ 杀掉进程，报超时
```

- 慢服务器不会被提前判成功。
- 失败是即时的：进程一退出立刻归因，不用等满 18 秒。
- 18 秒是兜底。ssh 自身有 `ConnectTimeout=15`，连不上的主机通常先自己退出，给出真实原因。

超时文案会明确说是哪一端的问题：

```text
建立隧道超时：18 秒内 127.0.0.1:4096 未进入监听
（服务器连接/认证过慢，或本地端口被防火墙拦截）
```

## 启动前的端口预检

拉起 ssh 之前先看本地端口是否已经有人监听：

- 有，且是别的进程 → 直接报错，不浪费一次连接：

```text
本地端口 127.0.0.1:4096 已被占用 — 占用进程：node（PID 41288）
```

- 占用者是 Node 且端口正好是 5173（Vite 开发服务器默认端口）→ 额外提示可能是 `pnpm dev` / `pnpm tauri dev` 占着。
- 占用者进程名以 `ssh` 开头 → 提示疑似上一次没关干净的隧道残留。
- 有，且是另一条运行中的记录 → 报「已有正在运行的相同转发」。

占用进程的查法按平台走：Windows 用 `Get-NetTCPConnection`，macOS/Linux 用 `lsof` 或 `ss`。**只查本地监听，和远程端口是否存在无关。**

## 失败归因

进程退出后，取 stderr 里最后一条非空、非 `Warning:` 的行，再加一句人话：

| stderr 特征 | 结论 |
| --- | --- |
| `Address already in use` / `Only one usage of each socket address` | 本地端口已被占用 |
| `Permission denied` | 认证失败，请确认已配置密钥登录或 ssh-agent |
| `Could not resolve hostname` / `Name or service not known` | 无法解析主机名，请检查 `~/.ssh/config` |
| `Connection refused` | 目标拒绝连接 |
| `Connection timed out` / `Operation timed out` | 连接超时 |
| `Network is unreachable` | 网络不可达 |
| `No route to host` | 无法路由到目标主机 |
| 其他 | 原样带出最后一条有效行 |

最终形状是 `结论（原始行）`；没有结论时就是原始行本身。

## 进程校验

「PID 还活着」不等于「你的 ssh 还活着」。系统会复用 PID，所以：

- Windows：`tasklist` 按 PID 查进程名。
- macOS / Linux：`libc::kill(pid, 0)` 探活，再读 `/proc` 或 `ps -o comm` 拿进程名。
- 终止前必须确认进程名是 `ssh`；不是就跳过，只把记录标记为已停止。

所有子进程都用参数数组传参，端口是 `u16`，不存在命令注入路径。

## 关闭顺序

```text
taskkill / SIGTERM
      │
      ├─ 1.8 秒内退出 ──▶ 完成
      └─ 仍在运行 ──────▶ taskkill /F 或 SIGKILL
```

之后 PID 清零、记录落盘，ssh 进程被回收。

## 记录与文件

- 记录是唯一的事实来源。`tunnels.json` 用「临时文件 + rename」原子替换，进程被杀也不会写坏。
- 文件损坏时自动备份为 `tunnels.json.bak`，再从空列表重建，绝不阻塞启动。
- ID 是 8 位十六进制，生成时会和现有记录排重——碰撞会让记录无法被单独操作、ssh 进程杀不掉。
- 启动后如果落盘失败，会回滚内存记录并杀掉刚拉起的 ssh，不留「无人管理」的进程。

## 并发

`AppState.store` 是 `std::sync::Mutex`，任何 `.await` 之前必须释放锁。这个约束在代码里靠块作用域保证，不靠自觉。

## 已知边界

- 成功路径需要真实可达的 SSH 主机；没有 Host 时只能覆盖失败分支。
- macOS 侧的代码路径（`libc::kill`、`ps -o comm`、ICNS 图标）已按平台条件编译实现，但主要验证是在 Windows 上做的。
- 未设置 CSP（`tauri.conf.json` 里是 `null`）。因为不加载远程内容、没开 `withGlobalTauri`，风险很低；要加固可以补一条 `default-src 'self'` 级别的策略。
