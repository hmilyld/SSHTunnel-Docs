---
title: 概览
description: 一个用来管理 ssh -L 本地端口转发的桌面应用，以及它刻意不做的事。
group: start
order: 1
---

把「建一条 `ssh -L` 转发、确认它真的在监听、随时关掉它」这件事，做成窗口里的几个输入框和一张表。

## 它解决的问题

在终端里开一条本地转发，通常要拼出这样的命令：

```bash
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:4096:localhost:5432 dev
```

命令本身不难，麻烦的是后面几件事：

- **参数记不住。** `-L` 的四个字段谁在前、`-N` 为什么不能少、`ExitOnForwardFailure` 拼错会怎样。
- **不知道成没成。** ssh 进程还在，不代表端口已经在监听；命令行没退出，可能还卡在认证。
- **关不干净。** 终端一关，转发没了，想复用还得重新敲一遍；忘了关的进程留在后台占着端口。
- **密码很别扭。** ssh 需要终端交互，把它藏进 GUI 之后，谁来回答 `password:`。

针对这四件事，应用各给了一个明确的做法，细节见[工作原理](/docs/internals)。

## 它不做什么

边界清楚比功能多更重要：

- 不是 SSH 客户端。没有终端、没有文件传输，也不管理密钥或 `authorized_keys`。
- 只做本地转发（`-L`）。不支持 `-R` 远程转发、`-D` SOCKS 代理，也不转发 UDP。
- 不保存密码。密码只在内存与子进程环境里存在，应用退出即消失。
- 不修改 `~/.ssh/config`。Host 列表是只读解析出来的。

## 界面结构

窗口只有三块：顶栏（说明、刷新、新建）、中间的隧道表格、底部信息栏（计数、版本、数据目录）。

<figure class="shot">
  <img src="/shots/app-light.webp" alt="SSH 隧道管理器主窗口：隧道列表显示五条记录，状态均为已停止" width="1680" height="900" class="shot-light" loading="lazy" decoding="async" />
  <img src="/shots/app-dark.webp" alt="SSH 隧道管理器主窗口（深色主题）" width="1680" height="900" class="shot-dark" loading="lazy" decoding="async" />
  <figcaption>主窗口 · 列表、状态与操作</figcaption>
</figure>

Windows 上这条标题栏是自绘的（可拖拽、双击最大化）；macOS 用系统原生红绿灯，不渲染自绘标题栏，所以不会出现两条标题栏。

## 几个刻意的选择

| 决策 | 原因 | 代价 |
| --- | --- | --- |
| 调用系统 `ssh`，不内嵌 SSH 库 | `~/.ssh/config`、密钥、ssh-agent、known_hosts、ProxyJump 全部照旧生效 | 依赖系统 OpenSSH |
| 以本地端口监听作为成功判据 | 认证通过 ≠ 转发可用，这是唯一可靠的信号 | 启动最长等 18 秒 |
| 关闭只停进程、保留记录 | 转发配置是长期资产，反复开关很常见 | 列表要手动删除才会变短 |
| 密码只走子进程环境 | 不落盘、不进日志，也不给配置文件加字段 | 每次启动都要重新输入 |

## 下一步

- 还没装：[安装](/docs/install)
- 想马上跑通一条：[快速开始](/docs/quickstart)
- 想知道判定细节：[工作原理](/docs/internals)
