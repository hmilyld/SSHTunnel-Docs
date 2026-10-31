---
title: Install
description: System requirements, which installer to pick, and the first-run prompts on Windows and macOS.
group: start
order: 2
---

## Requirements

| Platform | Requirement |
| --- | --- |
| Windows 10 / 11 | x64, WebView2 runtime (bundled with the OS), OpenSSH client |
| macOS 12+ | Apple Silicon (current releases are aarch64) |
| Both | An OpenSSH that can `ssh` to your target server |

Check that ssh exists:

```powershell
ssh -V
```

On Windows, install it as a system component if it is missing:

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

## Download

Installers are published on GitHub Releases and built by CI whenever a `vX.Y.Z` tag is pushed:

| Platform | File | Notes |
| --- | --- | --- |
| Windows | `SSH Tunnel Manager_1.0.2_x64-setup.exe` | NSIS installer |
| Windows | `SSH Tunnel Manager_1.0.2_x64_en-US.msi` | WiX, handy for distribution |
| macOS | `SSH Tunnel Manager_1.0.2_aarch64.dmg` | Unsigned, not notarised |

There is no Linux package, and no x64 build for Intel Macs.

> **Note**
> The installers are not code-signed. Windows may show “Windows protected your PC” — choose “More info → Run anyway”. On macOS, right-click the icon and choose “Open” the first time, or allow it under System Settings → Privacy & Security.

## First run

1. The list starts empty. That is normal: `tunnels.json` does not exist yet.
2. Click “New forward” in the top right. If `~/.ssh/config` has no hosts at all, an amber hint appears at the top of the dialog and the host dropdown is empty.
3. In that case, confirm first in a terminal that you can log in:

```bash
ssh dev
```

4. Go back to the app, hit “Refresh”, and the host list appears.

## Upgrading and uninstalling

- **Upgrade**: install the new version over the old one. `tunnels.json` lives in the app data folder and is not touched by the installer.
- **Uninstall**: the uninstaller only removes the application. Tunnel records and logs stay behind. To remove everything, delete the data folder by hand (see [Data & logs](/en/docs/data)).
