# Alpine Builder

```bash
# Use abuild as workspace
mkdir -p abuild && cd abuild

# distfiles 存放构建过程中下载的源码
# wener 存放 aports 等源码
mkdir -p {wener,distfiles}
# builder 用户的 uid 为 1000
docker run --rm -it -v $PWD:/build -v $PWD/distfiles:/var/cache/distfiles -u 1000 wener/base:builder

# 更新包索引
sudo apk update
# 第一次运行生成秘钥
abuild-keygen -a

echo /build/packages/wener | sudo tee -a /etc/apk/repositories
sudo cp ~/*.rsa.pub /etc/apk/keys/
```
