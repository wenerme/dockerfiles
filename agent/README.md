# Agent

基于 Alpine 3.24.1 的 minimal coding agent 镜像，提供 Claude Code、Pi 和日常代码操作需要的基础工具。镜像原目录为 `claude/`，现在使用 `agent/`，镜像名为 `wener/agent`。

- Agent：通过 `npm add -g` 安装 `@anthropic-ai/claude-code` 和 `@earendil-works/pi-coding-agent`。
- 运行环境：Node.js、npm、Python 3、uv、Bash 和完整 ICU 数据；`python` 与 `python3` 均指向系统 Python 3。
- 代码与文件操作：Git、SSH client、GNU find、ripgrep (`rg`)、fd、coreutils、grep、sed、diff、patch、file 和 make。
- 下载与数据处理：curl、wget、CA certificates、jq、yq、tar、gzip 和 unzip。
- 进程检查：procps。

默认以 root 运行，工作目录为 `/workspace`，默认命令为 Bash login shell。与 Workspace 的安装方式一致，APK 和 npm 工具不固定单独版本。

镜像主版本只跟随 Alpine，不将 Claude Code 或 Pi 的版本加入标签。`docker-bake.hcl` 的 `REV` 表示 agent 镜像的工具更新 revision；同一个 Alpine 版本下更新 Claude Code、Pi 或其它工具时递增，例如 `alpine-3.24.1-r0` → `alpine-3.24.1-r1`。`REV` 同时传入 Dockerfile，使递增 revision 后重新执行工具安装步骤。

构建和检查：

```bash
cd agent
make -s print
make load:agent

docker run --rm wener/agent:alpine-3.24.1-r0 claude --version
docker run --rm wener/agent:alpine-3.24.1-r0 pi --version
docker run --rm wener/agent:alpine-3.24.1-r0 python --version
docker run --rm wener/agent:alpine-3.24.1-r0 uv --version
```

在项目目录中启动 agent：

```bash
docker run --rm -it -v "$PWD:/workspace" wener/agent:alpine-3.24.1-r0 pi
docker run --rm -it -v "$PWD:/workspace" wener/agent:alpine-3.24.1-r0 claude
```

认证使用工具自身的环境变量或配置；需要保留登录状态时，可挂载 `/root/.claude` 和 `/root/.pi/agent`。镜像支持 `linux/amd64` 和 `linux/arm64`，Bake 声明 Docker Hub 与 Quay 标签：`latest`、`alpine-3.24`、`alpine-3.24.1`、`alpine-3.24.1-r0`。
