import Foundation
import Vision
import UIKit

@objc(VisionTextRecognition)
class VisionTextRecognition: NSObject {
  
  @objc
  func recognizeText(_ imagePath: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    
    guard let image = UIImage(contentsOfFile: imagePath) else {
      rejecter("IMAGE_LOAD_ERROR", "Failed to load image from path", nil)
      return
    }
    
    guard let cgImage = image.cgImage else {
      rejecter("IMAGE_CONVERSION_ERROR", "Failed to convert UIImage to CGImage", nil)
      return
    }
    
    let request = VNRecognizeTextRequest { (request, error) in
      if let error = error {
        rejecter("VISION_ERROR", "Vision framework error: \(error.localizedDescription)", error)
        return
      }
      
      guard let observations = request.results as? [VNRecognizedTextObservation] else {
        rejecter("NO_OBSERVATIONS", "No text observations found", nil)
        return
      }
      
      var recognizedText = ""
      var totalConfidence: Float = 0
      var textCount = 0
      
      for observation in observations {
        guard let topCandidate = observation.topCandidates(1).first else { continue }
        
        recognizedText += topCandidate.string + "\n"
        totalConfidence += topCandidate.confidence
        textCount += 1
      }
      
      let averageConfidence = textCount > 0 ? totalConfidence / Float(textCount) : 0
      
      let result: [String: Any] = [
        "text": recognizedText.trimmingCharacters(in: .whitespacesAndNewlines),
        "confidence": averageConfidence
      ]
      
      resolver(result)
    }
    
    // Configure the request for better accuracy
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["en-US", "ko-KR"] // Support English and Korean
    request.usesLanguageCorrection = true
    
    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    
    do {
      try handler.perform([request])
    } catch {
      rejecter("VISION_PERFORM_ERROR", "Failed to perform vision request: \(error.localizedDescription)", error)
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}