# MacCapturer - 系统音频PCM捕获工具

## 项目概述

MacCapturer 是一个使用 macOS ScreenCaptureKit 实时捕获系统音频并输出PCM格式数据的工具。项目提供了Swift原生实现和Node.js接口两种使用方式。

## 功能特性

- ✅ 实时捕获macOS系统音频
- ✅ 输出标准PCM格式数据 (48kHz, 16-bit, 立体声)
- ✅ 提供Swift可执行程序
- ✅ 提供Node.js进程间通信接口
- ✅ 支持优雅的停止机制
- ✅ 自动权限检查

## 系统要求

- **操作系统**: macOS 12.3+ (ScreenCaptureKit需要)
- **开发工具**: Xcode 13.0+, Swift 5.5+
- **运行时**: Node.js 14.0+ (如果使用Node.js接口)

## 安装和构建

### 1. 构建项目

```bash
# 克隆或下载项目到本地
cd MacCapturer

# 给构建脚本执行权限
chmod +x build.sh

# 构建项目
./build.sh
```

构建成功后，会在 `build/` 目录生成：
- `MacCapturer` - Swift可执行文件
- `libMacCapturer.dylib` - 动态链接库
- `MacCapturer.swiftmodule` - Swift模块文件

### 2. 权限设置

首次运行需要授权屏幕录制权限：

1. 打开 **系统设置** > **隐私与安全性** > **屏幕录制**
2. 点击 **+** 添加 Terminal 或你的应用程序
3. 重启Terminal或应用程序

## 使用方法

### 方式1: Swift可执行程序

```bash
./build/MacCapturer
```

程序会：
1. 检查屏幕录制权限
2. 初始化音频捕获
3. 开始实时捕获系统音频
4. 在控制台输出PCM数据信息
5. 按 Ctrl+C 优雅停止

### 方式2: Node.js接口

```javascript
const MacAudioCapturer = require('./node_interface');

const capturer = new MacAudioCapturer();

// 监听事件
capturer.on('started', () => {
    console.log('音频捕获已开始');
});

capturer.on('pcmData', (info) => {
    console.log(`PCM数据: ${info.bytes} bytes, ${info.sampleRate}Hz, ${info.channels}声道`);
    // 在这里处理PCM数据
});

capturer.on('error', (error) => {
    console.error('错误:', error);
});

// 开始捕获
capturer.start();

// 停止捕获
setTimeout(() => {
    capturer.stop();
}, 10000);
```

### 方式3: 运行测试

```bash
# 运行Node.js接口测试
node test.js

# 或使用npm脚本
npm run test
```

## PCM数据格式

捕获的音频数据规格：

| 参数 | 值 |
|------|-----|
| 采样率 | 48,000 Hz |
| 位深度 | 16-bit |
| 声道数 | 2 (立体声) |
| 字节序 | Little Endian |
| 数据格式 | 交错立体声 (LRLRLR...) |

## API 参考

### Swift API

```swift
// 协议定义
protocol PCMDataDelegate: AnyObject {
    func onPCMData(_ data: Data, sampleRate: Double, channels: Int, bitsPerSample: Int)
    func onError(_ error: String)
}

// 主要类
class AudioCapturer: NSObject {
    weak var delegate: PCMDataDelegate?
    func startCapturing() async -> Bool
    func stopCapturing() async
}
```

### Node.js API

```javascript
class MacAudioCapturer extends EventEmitter {
    start()                    // 开始捕获
    stop()                     // 停止捕获
    isCapturing()             // 检查状态
    
    // 事件
    // 'started' - 捕获已开始
    // 'pcmData' - 接收到PCM数据 (info对象)
    // 'error' - 发生错误
    // 'close' - 进程关闭
}
```

## 故障排除

### 常见问题

**1. 程序立即退出**
- 检查是否授权了屏幕录制权限
- 确保macOS版本 >= 12.3
- 查看错误日志: `Console.app` 搜索 "MacCapturer"

**2. 没有PCM数据输出**
- 确保系统正在播放音频
- 检查音频输出设备是否正常
- 验证权限设置

**3. 编译错误**
- 确保Xcode版本 >= 13.0
- 检查Swift版本 >= 5.5
- 清理构建: `rm -rf build/ && ./build.sh`

**4. Node.js相关问题**
- 检查Node.js版本 >= 14.0
- 确保可执行文件存在: `ls -la build/MacCapturer`

### 调试模式

使用调试脚本获取详细信息：

```bash
node debug.js
```

## 项目结构

```
MacCapturer/
├── MacCapturer/              # Swift源代码
│   ├── main.swift           # 主程序入口
│   ├── SpeakerListener.swift # 音频捕获核心
│   └── CInterface.swift     # C接口（预留）
├── build/                   # 构建输出
│   ├── MacCapturer         # 可执行文件
│   └── libMacCapturer.dylib # 动态库
├── build.sh                 # 构建脚本
├── node_interface.js        # Node.js接口
├── test.js                  # 测试脚本
├── debug.js                 # 调试脚本
├── package.json             # Node.js配置
└── README.md               # 项目文档
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0
- 初始版本
- 支持实时音频捕获
- 提供Swift和Node.js接口
- 基本的权限管理
