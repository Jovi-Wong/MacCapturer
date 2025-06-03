#!/bin/bash

# MacCapturer 构建脚本
# 用于编译Swift音频捕获库并生成动态库供Node.js调用

set -e

echo "Building MacCapturer..."

# 清理之前的构建
rm -rf build/
mkdir -p build/

# 编译Swift代码为动态库
swiftc -emit-library \
    -module-name MacCapturer \
    -o build/libMacCapturer.dylib \
    -emit-module \
    -emit-module-path build/ \
    MacCapturer/SpeakerListener.swift \
    MacCapturer/CInterface.swift \
    -framework Foundation \
    -framework ScreenCaptureKit \
    -framework AVFoundation

# 编译可执行文件
swiftc -o build/MacCapturer \
    MacCapturer/main.swift \
    MacCapturer/SpeakerListener.swift \
    -framework Foundation \
    -framework ScreenCaptureKit \
    -framework AVFoundation

echo "Build completed successfully!"
echo "Dynamic library: build/libMacCapturer.dylib"
echo "Executable: build/MacCapturer"
echo ""
echo "Usage:"
echo "1. Run executable: ./build/MacCapturer"
echo "2. Use library in Node.js: see node_example.js"