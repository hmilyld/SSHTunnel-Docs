---
title: Data & logs
description: Where tunnels.json and app.log live, what they look like, and how to clear them safely.
group: internals
order: 7
---

## Location

| Platform | Folder |
| --- | --- |
| Windows | `%APPDATA%\ssh-tunnel-manager\` |
| macOS | `~/Library/Application Support/ssh-tunnel-manager/` |

Only two files live there:

- `tunnels.json` — tunnel records
- `app.log` — runtime log

The folder button on the right of the bottom bar opens this directory. It opens a path the backend resolved itself and accepts no path from the frontend — so even an injected WebView could not use it to open arbitrary folders.

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

| Field | Meaning |
| --- | --- |
| `id` | 8 hex characters, the unique key |
| `host` | `Host` alias from `~/.ssh/config` |
| `bind` | Local bind address |
| `local_port` | Local port (1–65535) |
| `remote_host` | Remote target, resolved from the server’s point of view |
| `remote_port` | Remote target port |
| `pid` | ssh process ID; 0 means stopped |
| `created_at` | Creation time, local zone, `YYYY-MM-DD HH:MM:SS` |

Writes are atomic: a temp file is renamed into place, so a mid-write kill cannot leave half a JSON file. If reading fails (a hand-edited file, for instance), the original is renamed to `tunnels.json.bak` and the store starts empty.

## Logs

`tracing` writes to stdout and to `app.log` at the same time. The default level can be overridden with an environment variable:

```powershell
$env:RUST_LOG="debug"
```

These lines show up in the log:

```text
已加载 N 条隧道记录
本地端口 127.0.0.1:4096 已监听 → 隧道就绪
隧道 3f7a9c21 的 ssh 进程退出：exit status: 0
退出前关闭了 N 条运行中的隧道
```

Passwords never appear in the log, at any level.

## Clearing

To start from scratch:

1. Quit the app (“keep tunnels” or “close tunnels”, but note the latter kills processes).
2. Delete the whole `ssh-tunnel-manager` folder, or set the contents of `tunnels.json` to `[]`.
3. Start again: the list is empty and `app.log` is recreated.

> **The risk of hand-editing JSON**
> If parsing fails at startup, the file is backed up as `.bak` and the store rebuilds empty. A typo does not lose data, but it also does not report an error — you may think your edit took effect when the app actually started from an empty list. If a `.bak` file appears, that is what happened.
