---
title: 安装
description: 系统要求、安装包怎么选，以及首次运行时 Windows 与 macOS 各自的拦路提示。
group: start
order: 2
---

## 系统要求

| 平台 | 要求 |
| --- | --- |
| Windows 10 / 11 | x64、WebView2 运行时（系统自带）、OpenSSH 客户端 |
| macOS 12+ | Apple Silicon（当前发行包为 aarch64） |
| 通用 | 能在终端里 `ssh` 到目标服务器的 OpenSSH |

先确认系统里有 ssh：

```powershell
ssh -V
```

Windows 上如果没有，用系统组件装一个：

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

## 下载

发行包在 GitHub Releases，每次推 `vX.Y.Z` tag 由 CI 编译：

| 平台 | 文件 | 说明 |
| --- | --- | --- |
| Windows | `SSH Tunnel Manager_1.0.2_x64-setup.exe` | NSIS 安装器 |
| Windows | `SSH Tunnel Manager_1.0.2_x64_en-US.msi` | WiX，适合批量分发 |
| macOS | `SSH Tunnel Manager_1.0.2_aarch64.dmg` | 未签名、未公证 |

当前没有 Linux 包，也没有 Intel Mac 的 x64 包。

> **注意**
> 安装包没有代码签名。Windows 上 SmartScreen 可能提示「已保护你的电脑」，点「更多信息 → 仍要运行」；macOS 首次打开请右键图标选「打开」，或到「系统设置 → 隐私与安全性」里放行。

## 首次运行

1. 启动后列表是空的，正常——`tunnels.json` 还没生成。
2. 点右上角「新建转发」。如果 `~/.ssh/config` 里一个 Host 都没有，弹窗顶部会出现琥珀色提示，Host 下拉是空的。
3. 这时先在终端确认能登录目标机：

```bash
ssh dev
```

4. 回到应用点「刷新」，Host 列表就出来了。

## 升级与卸载

- **升级**：直接装新版本覆盖。`tunnels.json` 在应用数据目录，不会被安装程序动到。
- **卸载**：卸载程序只删应用本体，隧道记录和日志会留下。要彻底清掉，手动删除数据目录（见[数据与日志](/docs/data)）。
