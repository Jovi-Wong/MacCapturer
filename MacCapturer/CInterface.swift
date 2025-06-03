//
//  CInterface.swift
//  MacCapturer
//
//  Created by jovi on 2025/5/12.
//

import Foundation

// C函数指针类型定义
public typealias PCMDataCallback = @convention(c) (UnsafePointer<UInt8>, Int, Double, Int32, Int32) -> Void
public typealias ErrorCallback = @convention(c) (UnsafePointer<CChar>) -> Void

// 全局变量保存回调和捕获器实例
private var gPCMCallback: PCMDataCallback?
private var gErrorCallback: ErrorCallback?
private var gAudioCapturer: AudioCapturer?

// PCM数据代理实现
private class CInterfaceDelegate: NSObject, PCMDataDelegate {
    func onPCMData(_ data: Data, sampleRate: Double, channels: Int, bitsPerSample: Int) {
        data.withUnsafeBytes { bytes in
            if let callback = gPCMCallback {
                callback(bytes.bindMemory(to: UInt8.self).baseAddress!, 
                        data.count, 
                        sampleRate, 
                        Int32(channels), 
                        Int32(bitsPerSample))
            }
        }
    }
    
    func onError(_ error: String) {
        if let callback = gErrorCallback {
            error.withCString { cString in
                callback(cString)
            }
        }
    }
}

private let gDelegate = CInterfaceDelegate()

// C接口函数
@_cdecl("audio_capturer_create")
public func audio_capturer_create() -> Bool {
    gAudioCapturer = AudioCapturer()
    gAudioCapturer?.delegate = gDelegate
    return gAudioCapturer != nil
}

@_cdecl("audio_capturer_set_pcm_callback")
public func audio_capturer_set_pcm_callback(_ callback: @escaping PCMDataCallback) {
    gPCMCallback = callback
}

@_cdecl("audio_capturer_set_error_callback")
public func audio_capturer_set_error_callback(_ callback: @escaping ErrorCallback) {
    gErrorCallback = callback
}

@_cdecl("audio_capturer_start")
public func audio_capturer_start() {
    guard let capturer = gAudioCapturer else { return }
    
    Task {
        let success = await capturer.startCapturing()
        if !success {
            gDelegate.onError("Failed to start audio capture")
        }
    }
}

@_cdecl("audio_capturer_stop")
public func audio_capturer_stop() {
    guard let capturer = gAudioCapturer else { return }
    
    Task {
        await capturer.stopCapturing()
    }
}

@_cdecl("audio_capturer_destroy")
public func audio_capturer_destroy() {
    if let capturer = gAudioCapturer {
        Task {
            await capturer.stopCapturing()
        }
    }
    gAudioCapturer = nil
    gPCMCallback = nil
    gErrorCallback = nil
}