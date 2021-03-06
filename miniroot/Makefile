arch	?= x86_64
version	?= 3.12.0
ver		:= $(basename $(version))
mirror	?= https://mirrors.aliyun.com/alpine

image_arch_x86:=i386
image_arch_x86_64:=amd64
image_arch_armhf:=arm32v6
image_arch_armv7:=arm32v7
image_arch_aarch64:=arm64v8
image_arch_s390x:=s390x
image_arch_mips64:=mips64be
image_arch:=$(image_arch_$(arch))

image_platform_x86:=linux/386
image_platform_x86_64:=linux/amd64
image_platform_armhf:=linux/arm/v6
image_platform_armv7:=linux/arm/v7
image_platform_aarch64:=linux/arm64
image_platform_s390x:=linux/s390x
image_platform_mips64:=linux/mips64be
image_platform:=$(image_platform_$(arch))

push?=1

all: x86_64-image armv7-image aarch64-image armhf-image x86-image s390x-image
	docker manifest create \
	wener/miniroot:latest \
	--amend wener/miniroot:amd64 \
	--amend wener/miniroot:i386 \
	--amend wener/miniroot:s390x \
	--amend wener/miniroot:arm32v6 \
	--amend wener/miniroot:arm32v7 \
	--amend wener/miniroot:arm64v8
	docker manifest push -p wener/miniroot:latest

	docker manifest create \
	wener/miniroot:$(ver) \
	--amend wener/miniroot:$(ver)-amd64 \
	--amend wener/miniroot:$(ver)-i386 \
	--amend wener/miniroot:$(ver)-s390x \
	--amend wener/miniroot:$(ver)-arm32v6 \
	--amend wener/miniroot:$(ver)-arm32v7 \
	--amend wener/miniroot:$(ver)-arm64v8
	docker manifest push -p wener/miniroot:$(ver)-latest

	docker manifest create \
	wener/miniroot:$(version) \
	--amend wener/miniroot:$(version)-amd64 \
	--amend wener/miniroot:$(version)-i386 \
	--amend wener/miniroot:$(version)-s390x \
	--amend wener/miniroot:$(version)-arm32v6 \
	--amend wener/miniroot:$(version)-arm32v7 \
	--amend wener/miniroot:$(version)-arm64v8
	docker manifest push -p wener/miniroot:$(version)-latest

minirootfs.tar.gz:=alpine-minirootfs-${version}-${arch}.tar.gz
url:=${mirror}/v${ver}/releases/${arch}/$(minirootfs.tar.gz)
$(minirootfs.tar.gz):
	curl -sfLOC- $(url)

%-image: arch\=$*
%-image:
	$(MAKE) arch=$* image

image: $(minirootfs.tar.gz)
	docker build --build-arg arch=$(arch) --build-arg version=$(version)  . \
		-t wener/miniroot:$(image_arch) \
		-t wener/miniroot:$(ver)-$(image_arch) \
		-t wener/miniroot:$(version)-$(image_arch) \
		--platform $(image_platform)
	docker push wener/miniroot:$(image_arch)
	docker push wener/miniroot:$(ver)-$(image_arch)
	docker push wener/miniroot:$(version)-$(image_arch)

report:
	@echo Alpine $(arch) $(version) Image Arch $(image_arch)
