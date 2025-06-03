const { spawn } = require('child_process');
const EventEmitter = require('events');
const path = require('path');

/**
 * MacAudioCapturer - 使用Swift可执行文件捕获音频
 * 通过进程间通信获取PCM数据
 */
class MacAudioCapturer extends EventEmitter {
    constructor() {
        super();
        this.process = null;
        this.isRunning = false;
    }
    
    /**
     * 启动音频捕获
     */
    start() {
        if (this.isRunning) {
            console.log('Audio capturer is already running');
            return;
        }
        
        const executablePath = path.join(__dirname, 'build', 'MacCapturer');
        
        console.log('Starting MacCapturer process...');
        this.process = spawn(executablePath, [], {
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        this.isRunning = true;
        
        // 处理标准输出 (音频数据信息)
        this.process.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('MacCapturer:', output.trim());
            
            // 解析PCM数据信息
            if (output.includes('Received PCM data:')) {
                const match = output.match(/Received PCM data: (\d+) bytes, ([\d.]+)Hz, (\d+) channels, (\d+) bits/);
                if (match) {
                    const pcmInfo = {
                        bytes: parseInt(match[1]),
                        sampleRate: parseFloat(match[2]),
                        channels: parseInt(match[3]),
                        bitsPerSample: parseInt(match[4])
                    };
                    
                    this.emit('pcmData', pcmInfo);
                }
            }
        });
        
        // 处理错误输出
        this.process.stderr.on('data', (data) => {
            const error = data.toString();
            console.error('MacCapturer Error:', error.trim());
            this.emit('error', error);
        });
        
        // 处理进程退出
        this.process.on('close', (code) => {
            console.log(`MacCapturer process exited with code ${code}`);
            this.isRunning = false;
            this.emit('close', code);
        });
        
        // 处理进程错误
        this.process.on('error', (error) => {
            console.error('Failed to start MacCapturer process:', error);
            this.isRunning = false;
            this.emit('error', error);
        });
        
        console.log('MacCapturer process started');
        this.emit('started');
    }
    
    /**
     * 停止音频捕获
     */
    stop() {
        if (!this.isRunning || !this.process) {
            console.log('Audio capturer is not running');
            return;
        }
        
        console.log('Stopping MacCapturer process...');
        
        // 发送SIGINT信号优雅停止
        this.process.kill('SIGINT');
        
        // 如果进程没有在3秒内停止，强制杀死
        setTimeout(() => {
            if (this.isRunning && this.process) {
                console.log('Force killing MacCapturer process...');
                this.process.kill('SIGKILL');
            }
        }, 3000);
    }
    
    /**
     * 检查是否正在运行
     */
    isCapturing() {
        return this.isRunning;
    }
}

// 使用示例
async function example() {
    const capturer = new MacAudioCapturer();
    
    // 监听事件
    capturer.on('started', () => {
        console.log('✓ Audio capture started');
    });
    
    capturer.on('pcmData', (info) => {
        console.log(`📊 PCM Data: ${info.bytes} bytes, ${info.sampleRate}Hz, ${info.channels}ch, ${info.bitsPerSample}bit`);
    });
    
    capturer.on('error', (error) => {
        console.error('❌ Error:', error);
    });
    
    capturer.on('close', (code) => {
        console.log('🔄 Process closed with code:', code);
    });
    
    // 启动捕获
    capturer.start();
    
    // 10秒后停止
    setTimeout(() => {
        console.log('⏰ Stopping capture after 10 seconds...');
        capturer.stop();
    }, 10000);
    
    // 处理程序退出
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, stopping...');
        capturer.stop();
        setTimeout(() => process.exit(0), 1000);
    });
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
    example().catch(console.error);
}

module.exports = MacAudioCapturer;
