---
title: How it works
description: Success detection, failure attribution, process verification and the shutdown order — what the code actually does.
group: internals
order: 6
---

## Data flow

```text
React UI ──invoke──▶ commands.rs ──▶ tunnel.rs ──▶ tokio::process  ssh -N -L …
   ▲                    │              │
   │                    │              ├─▶ store.rs    tunnels.json (atomic write)
   │                    │              └─▶ process.rs  liveness / termination
   │                    └─▶ ssh_config.rs  host dropdown
   │
   ├─ list_tunnels every 3s
   └─ listen("tunnel-exited") ◀── reaper task (instant ssh exit notice)
```

## Success is a listener, not a wait

`ssh -L` binds the local port only after authentication succeeds. So “the local port is listening” is the only reliable signal.

```text
probe bind:port every 150ms
  ├─ listening ─────────────▶ success, record saved
  ├─ process exited ────────▶ parse stderr, classify the failure
  └─ 18s without a listener ▶ kill the process, report a timeout
```

- A slow server is never reported as ready early.
- Failure is immediate: the moment the process exits, it is classified; you do not wait out the 18 seconds.
- The 18 seconds are a backstop. ssh itself has `ConnectTimeout=15`, so an unreachable host usually exits first and reports the real reason.

The timeout message names the side that failed:

```text
隧道建立超时：18 秒内 127.0.0.1:4096 未进入监听
（服务器连接/认证过慢，或本地端口被防火墙拦截）
```

*(Error strings are quoted as the app emits them — its user-facing copy is Chinese.)*

## Port pre-check before start

Before ssh is spawned, the app checks whether the local port is already taken:

- Taken by another process → fail immediately, without spending a connection:

```text
本地端口 127.0.0.1:4096 已被占用 — 占用进程：node（PID 41288）
```

- Taken by Node on port 5173 (the Vite dev-server default) → an extra hint that `pnpm dev` / `pnpm tauri dev` may be holding it.
- Held by a process whose name starts with `ssh` → a hint that it is probably a leftover tunnel.
- Taken by another running record → “an identical forward is already running”.

The owner is looked up per platform: `Get-NetTCPConnection` on Windows, `lsof` or `ss` on macOS/Linux. **Only the local listener is checked; whether the remote port exists is a different question.**

## Failure attribution

After the process exits, the app takes the last non-empty, non-`Warning:` stderr line and prefixes a human explanation:

| stderr signature | Verdict |
| --- | --- |
| `Address already in use` / `Only one usage of each socket address` | Local port already in use |
| `Permission denied` | Authentication failed; check your key or ssh-agent |
| `Could not resolve hostname` / `Name or service not known` | Cannot resolve host; check `~/.ssh/config` |
| `Connection refused` | Target refused the connection |
| `Connection timed out` / `Operation timed out` | Connection timed out |
| `Network is unreachable` | Network unreachable |
| `No route to host` | No route to the target |
| Anything else | The last meaningful line, verbatim |

The final shape is `verdict (original line)`, or just the original line when nothing matches.

## Process verification

“The PID is alive” is not the same as “your ssh is alive”; operating systems reuse PIDs. So:

- Windows: `tasklist` looks up the process name by PID.
- macOS / Linux: `libc::kill(pid, 0)` for liveness, then `/proc` or `ps -o comm` for the name.
- The name must be `ssh` before anything is terminated. If it is not, the record is simply marked stopped.

All child processes are spawned with argument arrays and ports are `u16`, so there is no command-injection path.

## Shutdown order

```text
taskkill / SIGTERM
      │
      ├─ exits within 1.8s ──▶ done
      └─ still alive ────────▶ taskkill /F or SIGKILL
```

Then the PID is reset, the record is written, and the ssh process is reaped.

## Records and files

- The record is the single source of truth. `tunnels.json` is replaced atomically (temp file + rename), so killing the process mid-write cannot corrupt it.
- A corrupt file is backed up as `tunnels.json.bak` and the store restarts empty; startup is never blocked.
- IDs are 8 hex characters and are checked against existing records — a collision would make a record impossible to address and its ssh process impossible to kill.
- If the save fails right after a start, the in-memory record is rolled back and the freshly spawned ssh is killed, so no orphan is left behind.

## Concurrency

`AppState.store` is a `std::sync::Mutex`, and the guard must be released before any `.await`. The code enforces that with block scoping rather than good intentions.

## Known limits

- The success path needs a reachable SSH host; without one, only the failure branches are exercised.
- The macOS code paths (`libc::kill`, `ps -o comm`, ICNS icons) are conditionally compiled and implemented, but most verification happened on Windows.
- No CSP is set (`null` in `tauri.conf.json`). Since no remote content is loaded and `withGlobalTauri` is off, the risk is low; hardening it would mean adding a `default-src 'self'` policy.
