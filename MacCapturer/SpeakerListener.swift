//
//  SpeakerListener.swift
//  MacCapturer
//
//  Created by jovi on 2025/5/12.
//
import Foundation
import ScreenCaptureKit
import AVFoundation

// PCM数据回调协议
@objc public protocol PCMDataDelegate: AnyObject {
    func onPCMData(_ data: Data, sampleRate: Double, channels: Int, bitsPerSample: Int)
    func onError(_ error: String)
}

@objc public class AudioCapturer: NSObject, SCStreamDelegate, SCStreamOutput {
    private var stream: SCStream?
    private var isCapturing = false
    @objc public weak var delegate: PCMDataDelegate?
    
    private let sampleRate: Double = 48000
    private let channels: Int = 2
    private let bitsPerSample: Int = 16
    
    @objc public override init() {
        super.init()
    }
    
    @objc public func startCapturing() async -> Bool {
        guard !isCapturing else { return true }
        
        do {
            // 获取可用内容
            let availableContent = try await SCShareableContent.current
            
            // 创建配置
            let config = SCStreamConfiguration()
            
            // 配置音频捕获
            config.capturesAudio = true
            config.excludesCurrentProcessAudio = true
            config.sampleRate = Int(sampleRate)
            config.channelCount = channels
            
            // 创建过滤器 - 捕获系统音频
            let filter = SCContentFilter(display: availableContent.displays.first!, 
                                       excludingApplications: [], 
                                       exceptingWindows: [])
            
            // 创建流
            stream = SCStream(filter: filter, configuration: config, delegate: self)
            
            // 添加音频输出
            try stream?.addStreamOutput(self, type: .audio, sampleHandlerQueue: DispatchQueue(label: "audio.capture.queue"))
            
            // 开始捕获
            try await stream?.startCapture()
            
            isCapturing = true
            return true
            
        } catch {
            delegate?.onError("Failed to start audio capture: \(error.localizedDescription)")
            return false
        }
    }
    
    @objc public func stopCapturing() async {
        guard isCapturing else { return }
        
        do {
            try await stream?.stopCapture()
            stream = nil
            isCapturing = false
        } catch {
            delegate?.onError("Failed to stop audio capture: \(error.localizedDescription)")
        }
    }
    
    // MARK: - SCStreamDelegate
    
    public func stream(_ stream: SCStream, didStopWithError error: Error) {
        isCapturing = false
        delegate?.onError("Stream stopped with error: \(error.localizedDescription)")
    }
    
    // MARK: - SCStreamOutput
    
    public func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio else { return }
        
        // 将CMSampleBuffer转换为PCM数据
        convertToPCMData(sampleBuffer: sampleBuffer)
    }
    
    private func convertToPCMData(sampleBuffer: CMSampleBuffer) {
        guard let audioBufferList = try? sampleBuffer.audioBufferList else {
            delegate?.onError("Failed to get audio buffer list")
            return
        }
        
        let audioBuffer = audioBufferList.mBuffers
        
        if let data = audioBuffer.mData {
            let length = Int(audioBuffer.mDataByteSize)
            let pcmData = Data(bytes: data, count: length)
            
            // 回调PCM数据
            delegate?.onPCMData(pcmData, sampleRate: sampleRate, channels: channels, bitsPerSample: bitsPerSample)
        }
    }
}

// MARK: - CMSampleBuffer音频数据提取扩展
extension CMSampleBuffer {
    var audioBufferList: AudioBufferList? {
        get throws {
            var audioBufferList = AudioBufferList()
            var blockBuffer: CMBlockBuffer?
            
            let status = CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(
                self,
                bufferListSizeNeededOut: nil,
                bufferListOut: &audioBufferList,
                bufferListSize: MemoryLayout<AudioBufferList>.size,
                blockBufferAllocator: nil,
                blockBufferMemoryAllocator: nil,
                flags: 0,
                blockBufferOut: &blockBuffer
            )
            
            guard status == noErr else {
                throw NSError(domain: "AudioCaptureError", code: Int(status), userInfo: [NSLocalizedDescriptionKey: "Failed to get audio buffer list"])
            }
            
            return audioBufferList
        }
    }
}

@objc public class SpeakerListener: NSObject {
    @objc public func start() -> String {
        return "start listening to the speaker!"
    }
}
