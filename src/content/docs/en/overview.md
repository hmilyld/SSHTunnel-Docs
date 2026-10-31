---
title: Overview
description: A desktop app for managing ssh -L local port forwards — and the things it deliberately does not do.
group: start
order: 1
---

Turning “create an `ssh -L` forward, make sure it is really listening, kill it when you are done” into a few inputs and a table.

## The problems it solves

Opening a local forward in a terminal usually means typing something like:

```bash
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:4096:localhost:5432 dev
```

The command itself is not hard. What is annoying comes after:

- **Flags you forget.** Which of the four `-L` fields comes first, why `-N` matters, what a typo in `ExitOnForwardFailure` does.
- **No proof it works.** An ssh process that is still running does not mean the port is listening; a command that has not exited may still be stuck in authentication.
- **Untidy shutdowns.** Close the terminal and the forward is gone, but recreating it means retyping everything; processes you forgot about keep holding ports.
- **Passwords are awkward.** ssh wants an interactive terminal, and once it sits behind a GUI, who answers `password:`?

The app answers each of these with one explicit behaviour — see [How it works](/en/docs/internals).

## What it does not do

A clear boundary matters more than a long feature list:

- Not an SSH client. No terminal, no file transfer, no key or `authorized_keys` management.
- Local forwarding only (`-L`). No `-R` remote forwards, no `-D` SOCKS proxy, no UDP.
- Never stores passwords. They live in memory and in the child process environment, and disappear when the app exits.
- Never edits `~/.ssh/config`. The host list is parsed read-only.

## The window

There are only three parts: a top bar (description, refresh, new forward), the tunnel table, and a bottom bar (counts, version, data folder).

<figure class="shot">
  <img src="/shots/app-light.webp" alt="The SSH Tunnel Manager main window: a table of five tunnels, all stopped" width="1680" height="900" class="shot-light" loading="lazy" decoding="async" />
  <img src="/shots/app-dark.webp" alt="The main window in the dark theme" width="1680" height="900" class="shot-dark" loading="lazy" decoding="async" />
  <figcaption>Main window · the app interface is currently Chinese-only</figcaption>
</figure>

On Windows that title bar is drawn by the app (draggable, double-click to maximise). On macOS the system traffic lights are used and the custom title bar is not rendered, so you never get two title bars.

## Deliberate choices

| Decision | Why | Cost |
| --- | --- | --- |
| Call the system `ssh` instead of embedding an SSH library | `~/.ssh/config`, keys, ssh-agent, known_hosts and ProxyJump all keep working | Depends on system OpenSSH |
| Treat the listening local port as the success signal | Authentication succeeding is not the same as forwarding working | Startup can take up to 18 seconds |
| Closing stops the process but keeps the record | A forward is a long-lived asset, and toggling it is common | The list only shrinks when you delete |
| Passwords only travel in the child environment | Nothing on disk, nothing in logs, no extra fields in the config | You retype it on every start |

## Next

- Not installed yet: [Install](/en/docs/install)
- Want one working forward right now: [Quick start](/en/docs/quickstart)
- Curious about the details: [How it works](/en/docs/internals)
