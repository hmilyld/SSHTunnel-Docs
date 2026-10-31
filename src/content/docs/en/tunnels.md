---
title: Tunnel management
description: The full lifecycle of a forward — create, run, close, start, edit, delete — plus tray behaviour.
group: usage
order: 4
---

## Lifecycle

```text
new ──▶ running ──"Close"──▶ stopped ──"Start"──▶ running
                               │
                               ├─"Edit"──▶ stopped (config updated)
                               └─"Delete"──▶ record gone
```

The key point: **closing is not deleting**.

## Where the status comes from

- The list polls `list_tunnels` every 3 seconds.
- The backend also watches the ssh process, and broadcasts `tunnel-exited` the moment it exits — the UI switches to “stopped” immediately, without waiting for the next poll.
- “Running” means: the PID is non-zero **and** the process with that PID is actually named `ssh`. Checking only whether the PID exists would mistake a reused PID for a running tunnel.

## Close

After you click “Close”:

1. Terminate gracefully (`taskkill` on Windows, `SIGTERM` on Unix).
2. Wait up to 1.8 seconds.
3. Force it if it is still alive (`taskkill /F` / `SIGKILL`).
4. **Keep the record**, reset the PID, and show “stopped”.

If the PID has already been reused by another program, the app does not kill it — it only marks the record as stopped. Leaving a possibly-dead ssh behind is better than killing someone else’s process.

## Start

“Start” re-launches ssh from the saved config, through exactly the same path as creating a tunnel: port pre-check, password probe, listener check. That means:

- If the local port is now taken by another process, it fails before ssh is even started, and names the process holding it.
- If a password is required, you get the same dialog, with an authentication pre-check before the tunnel is created.

## Edit

Only **stopped** records can be edited: host, bind address, local port, remote host and port.

- The ID and creation time stay the same.
- Only the config changes; no process is involved.
- A new port that collides with another **running** record is rejected.

## Delete

Only **stopped** records can be deleted. Deletion cannot be undone — the record and its config are gone, and the ssh process was already stopped.

> **Why close and delete are separate**
> A forward is toggled constantly. If closing deleted the record, you would retype four fields every time; if closing kept it and there were no delete, the list would only grow. So “Delete” is its own explicit action.

## Tray

| Action | Behaviour |
| --- | --- |
| Close button (Windows) | Hides to the tray; tunnels keep running |
| Left-click the tray icon | Show / hide the main window |
| Right-click → Show window | Same as left-click |
| Right-click → Quit (keep tunnels) | Quits the app, ssh keeps running in the background |
| Right-click → Quit (close tunnels) | Stops every running tunnel before quitting |

The default is “keep tunnels”: quitting the app should not make that decision for you.

## Interface details

- Light/dark theme in the top right, persisted in localStorage and applied before the first frame, so there is no flash.
- The global context menu is disabled (WebView2’s default menu no longer appears); the tray’s native menu is unaffected.
- Results come back as a toast in the top right, with the backend’s original error text on failure.
- The bottom bar shows counts on the left, and the version, copyright and data-folder button on the right (the button opens the folder in Explorer / Finder).
