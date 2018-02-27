# Alpine Builder

```bash
# distfiles 存放构建过程中下载的源码
# src 存放 aports 等源码
mkdir -p build/{src,distfiles}
cd build
# builder 用户的 uid 为 1000
docker run --rm -it -v $PWD:/build -v $PWD/distfiles:/var/cache/distfiles -u 1000 wener/base:builder

# 更新包索引
sudo apk update
# 第一次运行生成秘钥
abuild-keygen -a
```
