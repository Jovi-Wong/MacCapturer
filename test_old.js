const MacAudioCapturer = require('./node_interface');
const fs = require('fs');
const path = require('path');

console.log('MacCapturer Node.js Interface Test');
console.log('==================================');

// 检查构建文件是否存在
const executablePath = path.join(__dirname, 'build', 'MacCapturer');
if (!fs.existsSync(executablePath)) {
    console.error('❌ MacCapturer executable not found!');
    console.log('Please run: ./build.sh');
    process.exit(1);
}

console.log('✅ MacCapturer executable found');

// 创建音频捕获器实例
const capturer = new MacAudioCapturer();

// 统计数据
let dataCount = 0;
let totalBytes = 0;
const startTime = Date.now();

// 监听事件
capturer.on('started', () => {
    console.log('🎵 Audio capture started successfully');
    console.log('📊 Waiting for PCM data...');
});

capturer.on('pcmData', (info) => {
    dataCount++;
    totalBytes += info.bytes;
    
    const duration = (Date.now() - startTime) / 1000;
    const avgBytesPerSec = Math.round(totalBytes / duration);
    
    console.log(`📈 [${dataCount}] PCM: ${info.bytes} bytes | ${info.sampleRate}Hz ${info.channels}ch ${info.bitsPerSample}bit | Total: ${totalBytes} bytes | Avg: ${avgBytesPerSec} B/s`);
});

capturer.on('error', (error) => {
    console.error('❌ Error:', error.toString().trim());
});

capturer.on('close', (code) => {
    const duration = (Date.now() - startTime) / 1000;
    console.log('\n📋 Test Summary:');
    console.log(`   Duration: ${duration.toFixed(1)}s`);
    console.log(`   Data packets: ${dataCount}`);
    console.log(`   Total bytes: ${totalBytes}`);
    console.log(`   Average rate: ${Math.round(totalBytes / duration)} bytes/sec`);
    console.log(`   Exit code: ${code}`);
    
    if (dataCount === 0) {
        console.log('\n⚠️  No PCM data received. This might be due to:');
        console.log('   1. Missing screen recording permission');
        console.log('   2. No audio playing on the system');
        console.log('   3. Audio capture initialization failed');
        console.log('\n💡 Please check:');
        console.log('   - System Settings > Privacy & Security > Screen Recording');
        console.log('   - Ensure Terminal (or your app) has permission');
        console.log('   - Try playing some audio and run the test again');
    }
});

// 启动测试
console.log('🚀 Starting audio capture test...');
console.log('ℹ️  This test will run for 10 seconds');
console.log('ℹ️  Make sure to play some audio to see PCM data');

capturer.start();

// 10秒后停止
setTimeout(() => {
    console.log('\n⏰ Test duration completed, stopping capture...');
    capturer.stop();
}, 10000);

// 处理Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    capturer.stop();
    setTimeout(() => process.exit(0), 1000);
});
    
    try {
        // 初始化
        console.log('1. Initializing capturer...');
        await capturer.init();
        console.log('✓ Capturer initialized successfully');
        
        // 重写PCM回调来收集测试数据
        const originalCallback = capturer.pcmCallback;
        
        // 启动捕获
        console.log('2. Starting capture...');
        capturer.start();
        console.log('✓ Capture started');
        
        // 等待数据
        console.log('3. Waiting for audio data (5 seconds)...');
        
        const startTime = Date.now();
        const timeout = 5000; // 5秒超时
        
        while (!dataReceived && (Date.now() - startTime) < timeout) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (dataReceived) {
            console.log(`✓ Received audio data: ${totalBytes} bytes total`);
        } else {
            console.log('⚠ No audio data received (this might be normal if no audio is playing)');
        }
        
        // 停止捕获
        console.log('4. Stopping capture...');
        capturer.stop();
        console.log('✓ Capture stopped');
        
        // 清理
        console.log('5. Cleaning up...');
        capturer.destroy();
        console.log('✓ Capturer destroyed');
        
        console.log('\n✓ All tests passed!');
        
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        throw error;
    }
}

// 运行测试
if (require.main === module) {
    testAudioCapture()
        .then(() => {
            console.log('Test completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}