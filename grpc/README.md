# gRPC codegen image
* [Document](https://github.com/wenerme/wener/blob/master/tricks/dev/protocol/grpc.md#docker)
* AlpineLinux Packages [grpc](https://github.com/wenerme/statics/tree/master/abuild)
* grpc
* grpc-java
* grpc-go
  * protowrap
* [ ] grpc-swift
* [ ] grpc-slate

```bash
docker run --rm -it -v $PWD:/host -workdir /host wener/grpc
# Create dirs
mkdir java javanano php go objc js ruby python csharp node slatedoc

COMMON_ARGS="$(echo -I . apis/**/*.proto)"
# Generate Java
protoc $COMMON_ARGS --plugin=$(which protoc-gen-grpc-java) --java_out=./java --grpc-java_out=./java
# Generate Java Nano
protoc $COMMON_ARGS --plugin=$(which protoc-gen-grpc-java) --java_out=nano:./javanano --grpc-java_out=./javanano 
# Generate Go by protowrap
# The last -I apis is required
protowrap $COMMON_ARGS --go_out=plugins=grpc:$HOME/go/src -I apis/
# Generate slate document
protowrap $COMMON_ARGS --slate_out=./slatedoc -I apis/

# Generate Swift
protoc $COMMON_ARGS --swift_out=./swift --swiftgrpc_out=./swift

# Generate PHP
protoc $COMMON_ARGS --plugin=protoc-gen-grpc=$(which grpc_php_plugin) --php_out=./php --grpc_out=./php
# Generate CXX
protoc $COMMON_ARGS --plugin=protoc-gen-grpc=$(which grpc_cpp_plugin) --cpp_out=./cpp --grpc_out=./cpp
# Generate C#
protoc $COMMON_ARGS --plugin=protoc-gen-grpc=$(which grpc_csharp_plugin) --csharp_out=./csharp --grpc_out=./csharp
# Generate ObjC
protoc $COMMON_ARGS --plugin=protoc-gen-grpc=$(which grpc_objective_c_plugin) --objc_out=./objc --grpc_out=./objc
# Generate Ruby
protoc $COMMON_ARGS --plugin=protoc-gen-grpc=$(which grpc_ruby_plugin) --ruby_out=./ruby --grpc_out=./ruby
# Generate Python
protoc $COMMON_ARGS --plugin=protoc-gen-grpc=$(which grpc_python_plugin) --python_out=./objc --grpc_out=./python
# Generate Node
protoc $COMMON_ARGS --plugin=protoc-gen-grpc=$(which grpc_node_plugin)  --js_out=import_style=commonjs,binary:./node --grpc_out=./node


```
