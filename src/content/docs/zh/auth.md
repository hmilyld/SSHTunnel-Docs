---
title: 认证
description: 密钥优先、密码自动探测，以及密码如何在不落盘的前提下交给 ssh。
group: usage
order: 5
---

## 密钥认证（推荐）

配好密钥或 ssh-agent 之后，点「启动」就直接开始。应用额外加了一条：

```text
-o StrictHostKeyChecking=accept-new
```

首次连接新主机时自动接受主机密钥（TOFU），避免无终端环境下卡在 `yes/no` 询问。如果主机密钥**已经变了**，仍然会硬失败——那正是你希望它失败的情况。

## 密码认证

密码认证不是「弹个框然后祈祷」，而是一条带预检的链路：

1. **探测**：首次启动带 `-o BatchMode=yes`，禁止任何交互，认证失败会快速返回，不会挂起。
2. **判定**：stderr 里出现 `Permission denied` **且**认证方法列表里含 `password`，才判定为「需要密码」。只允许公钥的服务器不会弹框。
3. **弹框**：后端返回 `PASSWORD_REQUIRED::…`，前端打开密码输入框。
4. **预检**：确认后先单独跑一次 `ssh -T`（不建立转发），参数限定 `PreferredAuthentications=password,keyboard-interactive`、`NumberOfPasswordPrompts=1`，最多等 5 秒。密码错误在这里就红字提示。
5. **建隧道**：预检通过后才真正启动 `ssh -N -L …`，仍然以本地端口进入监听作为成功判据。

预检超过 5 秒、或遇到连接类错误时是 fail-open：不在这里判死，交给真正的隧道启动给出真实错误。否则连不上的主机会被误报成「密码错误」。

## 密码去了哪里

只进子进程环境：

```text
SSH_ASKPASS=<本程序自身>
SSH_ASKPASS_REQUIRE=force
STM_ASKPASS_PWD=<密码>
```

ssh 需要密码时会执行 `SSH_ASKPASS` 指向的程序。本程序以辅助模式被拉起（带参数且环境里有 `SSH_ASKPASS`），只往 stdout 输出密码和换行，然后立刻退出——不启动 GUI、不写日志。

- 不写入 `tunnels.json`。
- 不进 `app.log`，任何日志级别都不进。
- Windows 上 askpass 路径优先取 8.3 短路径，避免 `C:\Program Files\...` 里的空格被某些 OpenSSH 版本拼坏。

> **辅助模式的两个条件**
> 带参数 **且** 检测到 `SSH_ASKPASS` 环境变量。正常 GUI 启动（没有参数）不会误触发打印密码。

## 服务器返回什么，应用做什么

| stderr 里出现 | 应用行为 |
| --- | --- |
| `Permission denied (publickey,password)` | 判定需要密码，弹框 |
| `Permission denied (publickey)` | 不弹框，报认证失败 |
| `Permission denied` + 已提供密码 | 预检阶段直接红字提示密码错误 |
| `Address already in use` | 报本地端口被占用，附带占用进程名与 PID |
| `Connection refused` | 报目标拒绝连接 |
| `Could not resolve hostname` | 报无法解析主机名，提示检查 `~/.ssh/config` |
| 其他 | 原样带出 stderr 的最后一条有效行 |

`Warning:` 开头的行会被跳过，只取真正说明问题的那一行。
