# wener/gitee:go

```bash
docker run --rm -it \
  --hostname dev-ci \
  -v $PWD/gitee-agent:/root/.gitee-agent \
  -v $PWD/workspace:/gitee_go_agent/workspace \
  --name gitee-go wener/gitee:go \
  /run.sh  -s 'https://server-agent.gitee.com/gitee_sa_server' -u 'labelId=&token=&sign=&timestamp=' -c '10'
```



**已知问题**

1. 脚本下载的 jdk 不支持 alpine
2. 脚本不支持 环境变量配置
3. 重复请求 token
4. nohup 启动过
5. agent 重复下载
6. uuid 存在需要交互才能继续
7. uuid 对应的 server 被删除会无法启动 - com.baidu.agile.agent.AgentStatus 43 - status:OFFLINE, accept event:REJECT
8. 重启可能导致 server 还没下线，无法启动 - 从数据库中查询主机异常同一个主机已启动
