# MacCapturer

实时系统音频捕获工具，使用 macOS ScreenCaptureKit 获取PCM格式的音频数据，支持Node.js调用。

## 功能特性

- ✅ 实时捕获macOS系统音频
- ✅ 输出标准PCM格式数据 (48kHz, 16-bit, 立体声)
- ✅ 提供Swift原生API和C接口
- ✅ 支持Node.js调用
- ✅ 低延迟音频处理
- ✅ 自动权限管理

## 系统要求

- macOS 12.3+ (ScreenCaptureKit需要)
- Xcode 13.0+ 
- Node.js 14.0+ (如果使用Node.js接口)
- Swift 5.5+

## 安装和构建

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd MacCapturer
```

### 2. 构建项目
```bash
# 给构建脚本执行权限
chmod +x build.sh

# 构建Swift库和可执行文件
./build.sh
```

### 3. 安装Node.js依赖 (可选)
```bash
npm install
```

## 使用方法

### Swift 直接使用

```bash
# 运行可执行文件
./build/MacCapturer
```

### Node.js 调用

```javascript
const MacAudioCapturer = require('./node_example');

async function captureAudio() {
    const capturer = new MacAudioCapturer();
    
    try {
        await capturer.init();
        capturer.start();
        
        // 音频数据会通过回调函数实时传递
        setTimeout(() => {
            capturer.stop();
            capturer.destroy();
        }, 10000); // 10秒后停止
        
    } catch (error) {
        console.error('Error:', error);
    }
}

captureAudio();
```

### PCM数据格式

捕获的音频数据格式：
- **采样率**: 48,000 Hz
- **位深度**: 16-bit
- **声道数**: 2 (立体声)
- **字节序**: Little Endian
- **数据格式**: 交错立体声 (LRLRLR...)

## API 参考

### Swift API

```swift
class AudioCapturer {
    weak var delegate: PCMDataDelegate?
    
    func startCapturing() async -> Bool
    func stopCapturing() async
}

protocol PCMDataDelegate {
    func onPCMData(_ data: Data, sampleRate: Double, channels: Int, bitsPerSample: Int)
    func onError(_ error: String)
}
```

### Node.js API

```javascript
class MacAudioCapturer {
    async init()           // 初始化捕获器
    start()               // 开始捕获
    stop()                // 停止捕获  
    destroy()             // 销毁资源
}
```

## 权限设置

首次运行时，macOS会提示授权屏幕录制权限：

1. 打开 **系统设置** > **隐私与安全性** > **屏幕录制**
2. 点击 **+** 添加你的应用程序
3. 重启应用程序

## 测试

```bash
# 运行测试
npm test

# 运行示例
npm run example
```

## 项目结构

```
MacCapturer/
├── MacCapturer/
│   ├── main.swift           # Swift主程序
│   ├── SpeakerListener.swift # 音频捕获核心类
│   └── CInterface.swift     # C接口封装
├── build.sh                 # 构建脚本
├── node_example.js          # Node.js使用示例
├── test.js                  # 测试文件
├── package.json             # Node.js配置
└── README.md               # 项目文档
```

## 故障排除

### 权限问题
- 确保已授权屏幕录制权限
- 重启Terminal或应用程序

### 编译错误
- 确保Xcode版本 >= 13.0
- 确保macOS版本 >= 12.3

### Node.js问题
- 确保安装了必要的依赖: `npm install`
- 确保Node.js版本 >= 14.0

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
