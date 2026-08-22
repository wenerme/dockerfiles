# Workspace

`wener/app:workspace` 是基于 `wener/app:<alpine>-ssh` 的 Alpine 开发与远程工作区镜像。Dockerfile 中的 APK 清单是系统工具的唯一来源，构建时安装当前 Alpine 仓库可用版本。

镜像包含 Docker CLI/Buildx/Compose、GitHub/GitLab CLI、Go、Node/npm、Bun、Python/uv、SQLite、PostgreSQL/MariaDB 客户端、网络诊断、终端和文件处理工具；额外从 Alpine edge 安装 zellij 与 DuckDB。pnpm、Yarn、Claude Code 和 Pi 通过 npm 全局安装。

镜像也提供可持久化的远程工作区初始化：

- OpenRC 在 sshd 前运行 `workspace-setup`。
- 初始化 admin 的 Bash 配置和 SSH 目录，不覆盖已有文件。
- sshd 仅允许 admin 使用 public-key 登录；禁用密码、交互式认证和 root 登录。
- 启动时为缺失的 SSH host key 生成 ed25519、ECDSA 和 RSA key，并保留已存在的 key。
