---
title: 参考
description: 命令接口、ssh 参数、~/.ssh/config 的解析规则，以及错误文案对照。
group: internals
order: 8
---

## 前端命令

| 命令 | 参数 | 返回 |
| --- | --- | --- |
| `list_hosts` | – | `SshHost[]`（alias / hostname / user / port / identity_file） |
| `list_tunnels` | – | `Tunnel[]`（记录 + `alive`） |
| `start_tunnel` | `{ request, password? }` | `Tunnel`（需要密码时返回 `PASSWORD_REQUIRED::…`） |
| `stop_tunnel` | `{ id }` | `Tunnel[]` |
| `restart_tunnel` | `{ id, password? }` | `Tunnel[]` |
| `update_tunnel` | `{ id, request }` | `Tunnel[]` |
| `remove_tunnel` | `{ id }` | `Tunnel[]` |
| `ssh_config_path` | – | `string` |
| `data_dir` | – | `string` |
| `reveal_data_dir` | – | `()` |

FFI 两个方向都是 snake_case（serde 默认，没有 `rename_all`）：JS 侧字段是 `local_port`，invoke 参数是 `{ request, password, id }`。

## ssh 参数

启动隧道时实际传入的参数：

| 参数 | 作用 |
| --- | --- |
| `-N` | 不执行远程命令，只做转发 |
| `ExitOnForwardFailure=yes` | 绑定失败就退出，而不是默默留着进程 |
| `ServerAliveInterval=30` | 每 30 秒发一次保活 |
| `ServerAliveCountMax=3` | 连续 3 次无响应判定连接已断 |
| `ConnectTimeout=15` | 连接阶段硬上限 15 秒 |
| `StrictHostKeyChecking=accept-new` | 新主机自动接受，变更过的主机密钥仍失败 |
| `BatchMode=yes` | 无密码时禁止交互 |
| `NumberOfPasswordPrompts=1` | 有密码时只尝试一次 |
| `-L bind:local_port:remote_host:remote_port` | 本地转发 |

密码预检用另一组参数（只认证、不建转发）：

```text
ssh -T -o NumberOfPasswordPrompts=1 -o ConnectTimeout=10
    -o StrictHostKeyChecking=accept-new
    -o PreferredAuthentications=password,keyboard-interactive <host>
```

## ~/.ssh/config 解析

只做下拉列表需要的最小解析：

| 支持 | 说明 |
| --- | --- |
| `Host` | 一行可以写多个别名 |
| `HostName` / `User` / `Port` / `IdentityFile` | 展示与预填 |
| `Key Value` 与 `Key=Value` | 两种写法都认 |
| 行内 `#` 注释 | 支持 |
| 引号包裹的值 | 支持 |

忽略的部分：

- 含 `*`、`?` 或以 `!` 开头的通配 Host。
- `Match` 块内的条件配置——它的作用域无法静态确定。

## 错误文案

错误统一序列化成中文字符串，前端直接展示。

| 形态 | 场景 |
| --- | --- |
| `参数校验失败：…` | 必填为空、端口不在 1-65535 |
| `未找到系统 ssh 命令。…` | PATH 里没有 OpenSSH，文案里直接给了安装命令 |
| `PASSWORD_REQUIRED::…` | 需要密码；`::` 后面是服务器原始提示 |
| `SSH 隧道启动失败：…` | 进程退出或 18 秒超时，括号里带原始 stderr |
| `本地端口 … 已被占用 — 占用进程：…` | 预检发现端口被别的进程监听 |
| `未找到 id 为 … 的隧道记录` | 记录已被删除 |
| `保存隧道记录失败：…` | 磁盘写入失败（此时内存记录会回滚） |
| `进程操作失败：…` | 终止进程失败，或对运行中的记录重复启动 |
| `读取 SSH 配置失败：…` | `~/.ssh/config` 读不出来 |

## 端口与地址

- 端口范围 1-65535，前后端都校验。
- 绑定地址可选 `127.0.0.1`、`localhost`、`0.0.0.0`、`::1`。
- 远程主机名从**服务器**视角解析，不是从本机。
