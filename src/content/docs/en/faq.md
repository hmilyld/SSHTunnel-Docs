---
title: FAQ
description: Ports in use, repeated password prompts, the 18-second timeout, grey macOS icons — what is really going on.
group: maintenance
order: 10
---

## I clicked “Close” — why is the record still there?

By design. Closing terminates the ssh process and resets the PID; the configuration stays in `tunnels.json` so it can be started again. Use “Delete” to actually remove a record.

## It says the local port is in use. Now what?

The error names the process and its PID:

```text
本地端口 127.0.0.1:4096 已被占用 — 占用进程：node（PID 41288）
```

Three common cases:

- **A dev server**: 5173 is held by `pnpm dev`. Pick another local port, or stop the frontend server.
- **A leftover ssh**: when the process name starts with `ssh`, the message says so. Kill it or change the port.
- **Another running record**: only one record can own a given `bind:port`. Close the other one first.

## Why does it sometimes take 18 seconds to fail?

Eighteen seconds is the backstop, not the normal path. Most failures come back immediately:

- Port taken: reported before starting.
- Authentication failure: classified as soon as the process exits.
- Unreachable host: ssh’s own `ConnectTimeout=15` exits first.

The case that really waits is “connected, but the server never finishes authentication or forwarding”. After the timeout the process is killed and reaped — it is not left running in the background.

## Is the password stored?

No. It exists only in memory and in the ssh child process environment (`SSH_ASKPASS` + `STM_ASKPASS_PWD`). It is never written to `tunnels.json` and never logged. After a restart you type it again.

## Can I stop the password prompt?

Configure a key or ssh-agent — the app prefers keys. The password flow is only the fallback when there is no key.

## What happens if I get the remote port wrong?

It may still show “running”. A listening local port only means ssh bound it; whether the remote port is usable is only discovered when you actually connect. That is the semantics of `ssh -L`, not a gap in the app’s detection.

## Closing the window keeps the tunnel alive?

Yes. Closing the window hides it to the tray, which is the convention for desktop tools. To quit and keep tunnels, use “Quit (keep tunnels)” in the tray menu; to quit and stop everything, use “Quit (close tunnels)”.

## Is Linux supported?

There are Linux branches in the code (`libc::kill`, `lsof` / `ss`), but no Linux installer is published and Linux has not been verified end to end.

## The macOS icon is a grey rounded square?

macOS 26 shrinks icons that do not follow Apple’s icon grid and puts them in a grey rounded frame. The current `.icns` is rendered on the 824-on-1024 grid. Real Liquid Glass needs an `Assets.car` produced from an `.icon` bundle, which only macOS with Xcode 26 (`actool`) can build.

## Can it forward UDP?

No. `ssh -L` forwards TCP only.

## Can I move the data to another machine?

Yes. `tunnels.json` is plain JSON — copy it into the same folder on the other machine (see [Data & logs](/en/docs/data)). The `pid` values mean nothing there and will usually show as “stopped”; if one happens to belong to an ssh process, it will show as running, and a single “Close” resets it.
