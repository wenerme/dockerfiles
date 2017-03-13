# Zentao

禅道项目管理工具

```bash
# 只需要暴露 80 端口即可
# 如果需要访问内部数据库,也可以暴露 3306, 但是大部分时候不需要访问
docker run -d --restart always -v /etc/localtime:/etc/localtime:ro \
    -p 80:80 \
    --name zentao wener/zentao
```
