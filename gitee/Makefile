.PHONY: go go/install.sh go/prepare.sh go/run.sh
go: go/prepare.sh go/run.sh
	docker buildx build --load -t wener/gitee:go go
	docker push wener/gitee:go

go/prepare.sh: go/install.sh prepare-main.sh
	head go/install.sh -n 295 > go/prepare.sh
	cat prepare-main.sh >> go/prepare.sh
	chmod +x go/prepare.sh

go/install.sh:
	curl --output-dir go -sfLO https://talk.gitee.com/agent/install.sh
	chmod +x go/install.sh

go/run.sh:
	cp go/install.sh go/run.sh
	# 避免交互
	sed -i -e '/当前主机环境已安装过/d' go/run.sh
	sed -i -e '/当前 Agent UUID/a input=n' go/run.sh
	# 避免重复 下载 agent
	sed -i -e '/test -f agent.jar/a return;' go/run.sh
	sed -i -r -e 's/nohup //' go/run.sh
	# 避免重复请求 token
	sed -i -r -e '/curl -X POST/i if [ ! -e ~/".gitee-agent/uuid" ]; then' go/run.sh
	sed -i -r -e '/uuid_folder=/i fi' go/run.sh
	# 避免退出
	# tail -F agent.log &; wait $(pidof java)
	sed -i -r -e '/exit 0/i tail -F agent.log' go/run.sh
	chmod +x go/run.sh
