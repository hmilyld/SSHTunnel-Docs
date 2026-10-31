---
title: Reference
description: Command surface, ssh flags, the ~/.ssh/config parsing rules, and the error text you will see.
group: internals
order: 8
---

## Frontend commands

| Command | Arguments | Returns |
| --- | --- | --- |
| `list_hosts` | – | `SshHost[]` (alias / hostname / user / port / identity_file) |
| `list_tunnels` | – | `Tunnel[]` (record + `alive`) |
| `start_tunnel` | `{ request, password? }` | `Tunnel` (returns `PASSWORD_REQUIRED::…` when a password is needed) |
| `stop_tunnel` | `{ id }` | `Tunnel[]` |
| `restart_tunnel` | `{ id, password? }` | `Tunnel[]` |
| `update_tunnel` | `{ id, request }` | `Tunnel[]` |
| `remove_tunnel` | `{ id }` | `Tunnel[]` |
| `ssh_config_path` | – | `string` |
| `data_dir` | – | `string` |
| `reveal_data_dir` | – | `()` |

FFI is snake_case in both directions (serde defaults, no `rename_all`): the JS side uses `local_port`, and invoke arguments are `{ request, password, id }`.

## ssh flags

The flags actually passed when a tunnel starts:

| Flag | Purpose |
| --- | --- |
| `-N` | Do not run a remote command; forwarding only |
| `ExitOnForwardFailure=yes` | Exit if binding fails instead of lingering |
| `ServerAliveInterval=30` | Keepalive every 30 seconds |
| `ServerAliveCountMax=3` | Three unanswered keepalives means the connection is dead |
| `ConnectTimeout=15` | Hard 15-second cap on the connection phase |
| `StrictHostKeyChecking=accept-new` | Accept new host keys, still fail on changed ones |
| `BatchMode=yes` | No interaction when no password is supplied |
| `NumberOfPasswordPrompts=1` | One attempt when a password is supplied |
| `-L bind:local_port:remote_host:remote_port` | The local forward |

The password pre-check uses a different set (authenticate only, no forwarding):

```text
ssh -T -o NumberOfPasswordPrompts=1 -o ConnectTimeout=10
    -o StrictHostKeyChecking=accept-new
    -o PreferredAuthentications=password,keyboard-interactive <host>
```

## ~/.ssh/config parsing

Only the minimum needed for a dropdown:

| Supported | Notes |
| --- | --- |
| `Host` | Several aliases per line are allowed |
| `HostName` / `User` / `Port` / `IdentityFile` | Shown and pre-filled |
| `Key Value` and `Key=Value` | Both forms |
| Inline `#` comments | Yes |
| Quoted values | Yes |

Ignored:

- Wildcard hosts containing `*`, `?` or starting with `!`.
- Conditional config inside `Match` blocks — its scope cannot be determined statically.

## Error text

Errors are serialised as plain strings and shown verbatim. **The app’s user-facing copy is Chinese**, so the original strings are listed below; that is exactly what you will see in a toast.

| Shape | When |
| --- | --- |
| `参数校验失败：…` | Required field empty, or a port outside 1–65535 |
| `未找到系统 ssh 命令。…` | No OpenSSH on PATH; the message includes the install command |
| `PASSWORD_REQUIRED::…` | Password needed; everything after `::` is the server’s message |
| `SSH 隧道启动失败：…` | Process exited or the 18-second timeout, with the raw stderr in brackets |
| `本地端口 … 已被占用 — 占用进程：…` | Pre-check found the port taken by another process |
| `未找到 id 为 … 的隧道记录` | The record has been deleted |
| `保存隧道记录失败：…` | Disk write failed (the in-memory record is rolled back) |
| `进程操作失败：…` | Terminating failed, or starting an already-running record |
| `读取 SSH 配置失败：…` | `~/.ssh/config` could not be read |

## Ports and addresses

- Ports are 1–65535, validated on both sides.
- Bind addresses: `127.0.0.1`, `localhost`, `0.0.0.0`, `::1`.
- The remote hostname is resolved **on the server**, not on your machine.
