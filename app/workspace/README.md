# Workspace

`wener/app:workspace` 是通用 Alpine 开发工作区。可变构建输入位于同目录或 `app/`，Dockerfile 只编排安装步骤：

- `../docker-bake.hcl`：OpenRC base manifest digest 和 Workspace revision tag。
- `apk-packages.lock`：61 个精确 APK package revision。
- `package.json` 和 `package-lock.json`：pnpm、Yarn、Pi 和完整 npm 依赖闭包。
- `claude-code.env`：Claude Code 版本、发布地址和 amd64/arm64 SHA-256。

`WORKSPACE_REV` 位于 `../docker-bake.hcl`，是发布 tag 的显式 revision 边界。任一锁定输入变化后，在发布前递增它。

包含 Docker CLI/Buildx/Compose、GitHub/GitLab CLI、Go、Node/npm、Bun、Python/uv、SQLite、PostgreSQL/MariaDB 客户端、网络诊断、终端工具和常用文件处理工具。

不包含项目测试框架、DuckDB edge/testing 包、持久化账号初始化、SSH host key 管理或任何业务 workspace rootfs。下游项目通过自身依赖安装测试和项目专用工具。

本地构建或发布必须使用 Makefile：

```bash
cd app
make print
make load:workspace
DOCKER_BUILD_PROGRESS=plain make push:workspace
```

更新 npm 工具时，先更新 `package.json`，再生成 `package-lock.json`；构建阶段始终使用 `npm ci --ignore-scripts`。更新 Claude Code 时，同时更新 `claude-code.env` 的版本和两个架构摘要。更新任意锁定输入后，递增 `WORKSPACE_REV`，然后重新执行 `make load:workspace` 验证。
