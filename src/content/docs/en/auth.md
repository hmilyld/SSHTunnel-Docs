---
title: Authentication
description: Keys first, passwords detected automatically — and how a password reaches ssh without ever touching disk.
group: usage
order: 5
---

## Key authentication (recommended)

With a key or ssh-agent configured, clicking “Start” is all there is. The app adds one option:

```text
-o StrictHostKeyChecking=accept-new
```

A new host key is accepted on first contact (TOFU), so the `yes/no` prompt cannot stall a process that has no terminal. A host key that has **changed** still fails hard — which is exactly what you want.

## Password authentication

Password auth is not “show a dialog and hope”. It is a chain with a pre-check:

1. **Probe**: the first start adds `-o BatchMode=yes`, which forbids any interaction and returns fast on failure instead of hanging.
2. **Decide**: only when stderr contains `Permission denied` **and** the authentication method list includes `password` is the password prompt shown. A key-only server never triggers it.
3. **Prompt**: the backend returns `PASSWORD_REQUIRED::…` and the frontend opens the password dialog.
4. **Pre-check**: on confirm, a separate `ssh -T` runs (no forwarding) limited to `PreferredAuthentications=password,keyboard-interactive` and `NumberOfPasswordPrompts=1`, waiting at most 5 seconds. A wrong password is reported right there, in red.
5. **Create the tunnel**: only after the pre-check passes does the real `ssh -N -L …` start, still judged by the local port becoming a listener.

If the pre-check takes longer than 5 seconds or hits a connection error, it fails open: the verdict is left to the real tunnel start, which reports the true error. Otherwise an unreachable host would be misreported as a wrong password.

## Where the password goes

Only into the child process environment:

```text
SSH_ASKPASS=<this program>
SSH_ASKPASS_REQUIRE=force
STM_ASKPASS_PWD=<password>
```

When ssh needs a password it executes the program named by `SSH_ASKPASS`. This app is invoked in helper mode (it has an argument **and** `SSH_ASKPASS` is present), prints only the password plus a newline to stdout, and exits immediately — no GUI, no logging.

- Never written to `tunnels.json`.
- Never written to `app.log`, at any level.
- On Windows the askpass path prefers the 8.3 short name, because some OpenSSH builds mangle paths with spaces such as `C:\Program Files\...`.

> **Two conditions for helper mode**
> An argument **and** the `SSH_ASKPASS` environment variable. A normal GUI start (no arguments) can never trigger the password print.

## What the server says, what the app does

| stderr contains | App behaviour |
| --- | --- |
| `Permission denied (publickey,password)` | Password required, show the dialog |
| `Permission denied (publickey)` | No dialog; report authentication failure |
| `Permission denied` with a password supplied | Red error inside the dialog, during the pre-check |
| `Address already in use` | Report the local port as taken, with process name and PID |
| `Connection refused` | Report that the target refused the connection |
| `Could not resolve hostname` | Report an unresolvable host and point at `~/.ssh/config` |
| Anything else | Surface the last meaningful stderr line verbatim |

Lines starting with `Warning:` are skipped, so only the line that actually explains the problem is kept.
