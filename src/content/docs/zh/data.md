---
title: 数据与日志
description: tunnels.json、app.log 在哪、长什么样，以及怎么安全地清掉。
group: internals
order: 7
---

## 位置

| 平台 | 目录 |
| --- | --- |
| Windows | `%APPDATA%\ssh-tunnel-manager\` |
| macOS | `~/Library/Application Support/ssh-tunnel-manager/` |

里面只有两个文件：

- `tunnels.json` —— 隧道记录
- `app.log` —— 运行日志

底部信息栏右侧的文件夹按钮会打开这个目录。该命令只打开后端自己解析出的路径，不接受前端传参——即使 WebView 被注入，也没法借它打开任意目录。

## tunnels.json

```json
[
  {
    "id": "3f7a9c21",
    "host": "dev",
    "bind": "127.0.0.1",
    "local_port": 4096,
    "remote_host": "localhost",
    "remote_port": 4096,
    "pid": 123456,
    "created_at": "2026-09-30 17:25:11"
  }
]
```

| 字段 | 说明 |
| --- | --- |
| `id` | 8 位十六进制，记录的唯一键 |
| `host` | `~/.ssh/config` 里的 Host 别名 |
| `bind` | 本地绑定地址 |
| `local_port` | 本地端口（1-65535） |
| `remote_host` | 远程目标主机，从服务器视角解析 |
| `remote_port` | 远程目标端口 |
| `pid` | ssh 进程 PID；0 表示已停止 |
| `created_at` | 创建时间，本地时区，`YYYY-MM-DD HH:MM:SS` |

写入是原子的：先写临时文件再 rename，进程中途被杀也不会留下半截 JSON。读取失败（比如手动改坏了）会把原文件改名成 `tunnels.json.bak`，然后从空列表开始。

## 日志

`tracing` 同时写 stdout 和 `app.log`。默认级别可以用环境变量覆盖：

```powershell
$env:RUST_LOG="debug"
```

日志里会出现这些关键行：

```text
已加载 N 条隧道记录
本地端口 127.0.0.1:4096 已监听 → 隧道就绪
隧道 3f7a9c21 的 ssh 进程退出：exit status: 0
退出前关闭了 N 条运行中的隧道
```

密码不会出现在日志里，任何级别都不会。

## 清理

想从零开始：

1. 先退出应用（「保留隧道」或「关闭隧道」都行，注意后者会杀进程）。
2. 删除整个 `ssh-tunnel-manager` 目录，或把 `tunnels.json` 的内容改成 `[]`。
3. 重新启动，列表为空，`app.log` 会重新创建。

> **手动改 JSON 的风险**
> 启动时如果解析失败，应用会把文件备份成 `.bak` 再重建。手写错误不会丢数据，但也不会报错——你以为改生效了，其实是从空列表开始的。改完先看看 `.bak` 有没有出现。
