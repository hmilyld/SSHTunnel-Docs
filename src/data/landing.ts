import type { Locale } from '../i18n/ui';

/**
 * 首页文案。两种语言各一份，标记用反引号包住的行内代码，
 * 由 <Inline /> 组件转成 <code>。
 */
export interface TitlePart {
  text: string;
  mono?: boolean;
}

export interface LandingCopy {
  kicker: string;
  titleLines: TitlePart[][];
  lede: string;
  ctaPrimary: string;
  ctaSecondary: string;
  platforms: string;
  shot: {
    kicker: string;
    heading: string;
    note: string;
    caption: string;
    alt: string;
  };
  three: { index: string; title: string; text: string }[];
  spec: {
    kicker: string;
    heading: string;
    note: string;
    noteLink: string;
    rows: { label: string; text: string }[];
  };
  command: {
    kicker: string;
    heading: string;
    body: string;
    caption: string;
  };
  download: {
    kicker: string;
    heading: string;
    allReleases: string;
    windows: { title: string; files: string };
    mac: { title: string; files: string };
    cta: string;
    note: string;
    noteLink: string;
  };
  closing: { kicker: string; heading: string; cta: string };
}

export const landing: Record<Locale, LandingCopy> = {
  zh: {
    kicker: 'Tauri 2 · Rust · React 19',
    titleLines: [
      [{ text: '给 ' }, { text: 'ssh -L', mono: true }],
      [{ text: '一个能看见的界面' }],
    ],
    lede: '在 Windows 与 macOS 上管理到 Linux 服务器的本地端口转发：新建、观察、关闭。参数不用背，失败原因不用猜，关掉窗口也不会留下一堆没人管的进程。',
    ctaPrimary: '下载安装',
    ctaSecondary: '阅读文档',
    platforms: 'Windows 10/11 · macOS 12+ · MIT License',
    shot: {
      kicker: '界面',
      heading: '列表、状态与操作，一屏之内',
      note: '表格只放你会看的东西：ID、Host、本地与远程地址、PID、创建时间、状态。运行中的行可以关闭，已停止的行可以启动、修改或删除。',
      caption: '主窗口 · 五条记录',
      alt: 'SSH 隧道管理器主窗口：隧道列表显示五条记录，状态均为已停止',
    },
    three: [
      {
        index: '01',
        title: '记住参数',
        text: '`-L` 的四个字段、`-N`、`ExitOnForwardFailure` 每次都要查一遍。这里只有 Host、远程地址、本地地址和绑定地址。',
      },
      {
        index: '02',
        title: '确认真的通了',
        text: '认证通过不等于转发可用。应用以本地端口真正进入监听作为成功判据，失败时给出具体原因，而不是一句「启动失败」。',
      },
      {
        index: '03',
        title: '关得干净',
        text: '关闭窗口只是隐藏到托盘。隧道记录一直保留，PID 清零；下次点「启动」即可复用，不必重填。',
      },
    ],
    spec: {
      kicker: '行为约定',
      heading: '判定与边界',
      note: '下面每一条都是代码里的实际行为，不是宣传语。细节见{link}。',
      noteLink: '工作原理',
      rows: [
        {
          label: '启动成功',
          text: '本地 bind:port 真正进入监听才算成功（每 150ms 探测一次）。ssh 只有认证通过后才会绑定 -L，所以慢服务器不会提前报成功。',
        },
        {
          label: '启动失败',
          text: '进程退出时即时解析 stderr 归因：端口占用、认证失败、连接被拒、主机名无法解析…… 或 18 秒内始终没有监听。',
        },
        {
          label: '关闭',
          text: '先优雅终止，最多等 1.8 秒，再强制结束。记录保留、PID 清零，之后随时可以「启动」复用同一份配置。',
        },
        {
          label: '密码',
          text: '只经子进程环境变量交给 ssh，不写 tunnels.json、不进日志；预检失败会在密码框里直接提示，而不是先报成功再失败。',
        },
        {
          label: '进程校验',
          text: '终止前确认目标进程名确实是 ssh，避免 PID 被系统复用后误杀别人的进程。',
        },
      ],
    },
    command: {
      kicker: '实际执行',
      heading: '它到底跑了什么',
      body: '没有内嵌 SSH 库，就是调用系统 `ssh`。因此 `~/.ssh/config`、密钥、ssh-agent、known_hosts 全部照旧生效。',
      caption:
        '上面按行折开只为便于阅读，实际以单行参数数组传给 ssh。使用密码认证时，`BatchMode=yes` 会换成 `NumberOfPasswordPrompts=1`，密码经 `SSH_ASKPASS` 注入子进程环境。',
    },
    download: {
      kicker: '下载',
      heading: '安装包发布在 GitHub Releases',
      allReleases: '全部发行版',
      windows: {
        title: 'Windows 10 / 11 · x64',
        files: '…_{version}_x64-setup.exe（NSIS） · …_{version}_x64_en-US.msi（WiX）',
      },
      mac: { title: 'macOS 12+ · Apple Silicon', files: '…_{version}_aarch64.dmg' },
      cta: '前往下载',
      note: '安装包未做代码签名：Windows 可能弹出 SmartScreen 提示，macOS 首次打开需要右键 →「打开」。从源码构建见{link}。',
      noteLink: '开发与发布',
    },
    closing: {
      kicker: '开始',
      heading: '第一次用？五步就能跑通一条转发。',
      cta: '快速开始',
    },
  },

  en: {
    kicker: 'Tauri 2 · Rust · React 19',
    titleLines: [[{ text: 'An interface' }], [{ text: 'for ' }, { text: 'ssh -L', mono: true }]],
    lede: 'Create local port forwards to your Linux servers, watch them come up, close them. No flags to memorise, no guessing why it failed, and no orphaned processes left behind when you close the window.',
    ctaPrimary: 'Download',
    ctaSecondary: 'Read the docs',
    platforms: 'Windows 10/11 · macOS 12+ · MIT License',
    shot: {
      kicker: 'The window',
      heading: 'List, status and actions, one screen',
      note: 'The table carries only what you actually look at: ID, host, local and remote addresses, PID, creation time, status. Running rows can be closed; stopped rows can be started, edited or deleted. The app interface is currently Chinese-only, so the screenshot shows the real UI as it is.',
      caption: 'Main window · five records',
      alt: 'The SSH Tunnel Manager main window: a table of five tunnels, all stopped',
    },
    three: [
      {
        index: '01',
        title: 'Flags you keep forgetting',
        text: 'Four fields for `-L`, plus `-N` and `ExitOnForwardFailure`, every single time. Here there are only four inputs: host, remote address, local address, bind address.',
      },
      {
        index: '02',
        title: 'Proof it really works',
        text: 'A successful login is not a working forward. The app reports success only once the local port is actually listening — and when it fails, it says why.',
      },
      {
        index: '03',
        title: 'A clean shutdown',
        text: 'Closing the window only hides it to the tray. Records stay, PIDs go to zero, and the next launch reuses the same config.',
      },
    ],
    spec: {
      kicker: 'Behaviour',
      heading: 'How it decides',
      note: 'Every line below is what the code does, not a marketing claim. Details in {link}.',
      noteLink: 'How it works',
      rows: [
        {
          label: 'Startup success',
          text: 'The local bind:port is really listening (probed every 150 ms). ssh only binds -L after authentication, so a slow server is never reported as ready early.',
        },
        {
          label: 'Startup failure',
          text: 'The process exits and stderr is classified immediately — port in use, auth failure, connection refused, unresolvable host — or 18 seconds pass with no listener.',
        },
        {
          label: 'Closing',
          text: 'Graceful terminate, wait up to 1.8 s, then force. The record is kept and the PID reset, so the same config can be started again at any time.',
        },
        {
          label: 'Passwords',
          text: 'Handed to ssh through the child process environment only. Never written to tunnels.json, never logged. A wrong password is caught by a pre-check, not after a fake success.',
        },
        {
          label: 'Process check',
          text: 'Before terminating anything the process name must be ssh, so a reused PID cannot get someone else’s process killed.',
        },
      ],
    },
    command: {
      kicker: 'Under the hood',
      heading: 'What it actually runs',
      body: 'There is no embedded SSH library — it calls the system `ssh`. That means `~/.ssh/config`, keys, ssh-agent and known_hosts all keep working exactly as before.',
      caption:
        'Split across lines for readability; the arguments are passed as a single array. With password auth, `BatchMode=yes` becomes `NumberOfPasswordPrompts=1` and the password is injected through `SSH_ASKPASS`.',
    },
    download: {
      kicker: 'Download',
      heading: 'Installers are published on GitHub Releases',
      allReleases: 'All releases',
      windows: {
        title: 'Windows 10 / 11 · x64',
        files: '…_{version}_x64-setup.exe (NSIS) · …_{version}_x64_en-US.msi (WiX)',
      },
      mac: { title: 'macOS 12+ · Apple Silicon', files: '…_{version}_aarch64.dmg' },
      cta: 'Download',
      note: 'The installers are not code-signed: Windows may show a SmartScreen prompt, and macOS needs right-click → Open the first time. To build from source see {link}.',
      noteLink: 'Development & release',
    },
    closing: {
      kicker: 'Start',
      heading: 'First time here? Five steps to a working tunnel.',
      cta: 'Quick start',
    },
  },
};
