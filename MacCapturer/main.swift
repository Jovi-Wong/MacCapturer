//
//  main.swift
//  MacCapturer
//
//  Created by jovi on 2025/5/12.
//

import Foundation
import ScreenCaptureKit
import AVFoundation

// PCM数据处理类
class PCMDataHandler: NSObject, PCMDataDelegate {
    func onPCMData(_ data: Data, sampleRate: Double, channels: Int, bitsPerSample: Int) {
        print("Received PCM data: \(data.count) bytes, \(sampleRate)Hz, \(channels) channels, \(bitsPerSample) bits")
        // 这里可以处理PCM数据，比如写入文件、网络传输等
    }
    
    func onError(_ error: String) {
        print("Audio capture error: \(error)")
    }
}

// 全局变量用于signal处理
var globalCapturer: AudioCapturer?

// Signal处理函数
func handleSIGINT(signal: Int32) {
    print("\nStopping audio capture...")
    if let capturer = globalCapturer {
        Task {
            await capturer.stopCapturing()
            exit(0)
        }
    } else {
        exit(0)
    }
}

// 主程序
func main() async {
    print("MacCapturer - System Audio PCM Capture")
    print("======================================")
    print("Process ID: \(ProcessInfo.processInfo.processIdentifier)")
    
    // 请求屏幕录制权限
    print("Requesting screen recording permission...")
    let hasPermission = await requestScreenRecordingPermission()
    
    if !hasPermission {
        print("❌ Screen recording permission is required!")
        print("Please grant permission in:")
        print("System Settings > Privacy & Security > Screen Recording")
        print("Then restart this application.")
        exit(1)
    }
    
    print("✅ Screen recording permission granted")
    
    // 创建音频捕获器
    let capturer = AudioCapturer()
    globalCapturer = capturer
    let handler = PCMDataHandler()
    capturer.delegate = handler
    
    // 启动捕获
    print("Starting audio capture...")
    let success = await capturer.startCapturing()
    if success {
        print("Audio capture started successfully")
        print("Press Ctrl+C to stop...")
        
        // 设置信号处理器来优雅地停止捕获
        signal(SIGINT, handleSIGINT)
        
        // 保持程序运行
        await withUnsafeContinuation { (continuation: UnsafeContinuation<Void, Never>) in
            // 永远不调用continuation.resume，让程序一直运行
        }
    } else {
        print("Failed to start audio capture")
        exit(1)
    }
}

// 请求屏幕录制权限
func requestScreenRecordingPermission() async -> Bool {
    do {
        // 尝试获取可共享内容来检查权限
        _ = try await SCShareableContent.current
        return true
    } catch {
        return false
    }
}

// 启动主程序
Task {
    await main()
}


