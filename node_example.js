const ffi = require('ffi-napi');
const ref = require('ref-napi');
const path = require('path');

// 定义C函数签名
const lib = ffi.Library(path.join(__dirname, 'build/libMacCapturer.dylib'), {
    'audio_capturer_create': ['bool', []],
    'audio_capturer_set_pcm_callback': ['void', ['pointer']],
    'audio_capturer_set_error_callback': ['void', ['pointer']],
    'audio_capturer_start': ['void', []],
    'audio_capturer_stop': ['void', []],
    'audio_capturer_destroy': ['void', []]
});

// PCM数据回调函数
const pcmCallback = ffi.Callback('void', ['pointer', 'int', 'double', 'int', 'int'], 
    function(dataPtr, dataSize, sampleRate, channels, bitsPerSample) {
        // 将C指针转换为Buffer
        const buffer = ref.reinterpret(dataPtr, dataSize);
        
        console.log(`Received PCM data: ${dataSize} bytes, ${sampleRate}Hz, ${channels} channels, ${bitsPerSample} bits`);
        
        // 这里可以处理PCM数据
        // 例如：保存到文件、发送到网络、进行音频处理等
        
        // 示例：保存前1000字节到文件（仅作演示）
        if (dataSize > 0) {
            const fs = require('fs');
            const sampleData = buffer.slice(0, Math.min(1000, dataSize));
            // fs.appendFileSync('audio_sample.pcm', sampleData);
        }
    }
);

// 错误回调函数
const errorCallback = ffi.Callback('void', ['string'], 
    function(error) {
        console.error('Audio capture error:', error);
    }
);

class MacAudioCapturer {
    constructor() {
        this.isInitialized = false;
    }
    
    async init() {
        if (this.isInitialized) return true;
        
        const success = lib.audio_capturer_create();
        if (!success) {
            throw new Error('Failed to create audio capturer');
        }
        
        // 设置回调函数
        lib.audio_capturer_set_pcm_callback(pcmCallback);
        lib.audio_capturer_set_error_callback(errorCallback);
        
        this.isInitialized = true;
        return true;
    }
    
    start() {
        if (!this.isInitialized) {
            throw new Error('Audio capturer not initialized');
        }
        lib.audio_capturer_start();
        console.log('Audio capture started');
    }
    
    stop() {
        if (!this.isInitialized) return;
        lib.audio_capturer_stop();
        console.log('Audio capture stopped');
    }
    
    destroy() {
        if (!this.isInitialized) return;
        lib.audio_capturer_destroy();
        this.isInitialized = false;
        console.log('Audio capturer destroyed');
    }
}

// 使用示例
async function main() {
    const capturer = new MacAudioCapturer();
    
    try {
        console.log('Initializing audio capturer...');
        await capturer.init();
        
        console.log('Starting audio capture...');
        capturer.start();
        
        // 运行10秒后停止
        setTimeout(() => {
            console.log('Stopping audio capture...');
            capturer.stop();
            capturer.destroy();
            process.exit(0);
        }, 10000);
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// 处理程序退出
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, cleaning up...');
    if (typeof capturer !== 'undefined') {
        capturer.stop();
        capturer.destroy();
    }
    process.exit(0);
});

// 如果直接运行此文件，执行示例
if (require.main === module) {
    main().catch(console.error);
}

module.exports = MacAudioCapturer;