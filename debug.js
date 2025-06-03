console.log('🧪 MacCapturer Debug Test');
console.log('========================');

const { spawn } = require('child_process');
const path = require('path');

const executablePath = path.join(__dirname, 'build', 'MacCapturer');
console.log('📁 Executable path:', executablePath);

// 检查文件是否存在
const fs = require('fs');
if (!fs.existsSync(executablePath)) {
    console.error('❌ Executable not found!');
    process.exit(1);
}

console.log('✅ Executable exists');

// 检查文件权限
try {
    fs.accessSync(executablePath, fs.constants.F_OK | fs.constants.X_OK);
    console.log('✅ Executable has proper permissions');
} catch (error) {
    console.error('❌ Permission error:', error.message);
    process.exit(1);
}

console.log('🚀 Spawning MacCapturer process...');

const child = spawn(executablePath, [], {
    stdio: ['pipe', 'pipe', 'pipe']
});

console.log('📋 Process spawned with PID:', child.pid);

child.stdout.on('data', (data) => {
    console.log('📤 STDOUT:', data.toString().trim());
});

child.stderr.on('data', (data) => {
    console.log('📤 STDERR:', data.toString().trim());
});

child.on('close', (code, signal) => {
    console.log(`🔚 Process closed: code=${code}, signal=${signal}`);
});

child.on('error', (error) => {
    console.error('❌ Process error:', error);
});

// 5秒后强制停止
setTimeout(() => {
    console.log('⏰ Timeout reached, killing process...');
    child.kill('SIGINT');
    
    setTimeout(() => {
        if (!child.killed) {
            console.log('🔪 Force killing process...');
            child.kill('SIGKILL');
        }
        process.exit(0);
    }, 2000);
}, 5000);

console.log('⏳ Waiting for output (5 seconds)...');
