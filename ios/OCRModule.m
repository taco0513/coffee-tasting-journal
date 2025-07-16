#import "OCRModule.h"
#import <Vision/Vision.h>
#import <React/RCTLog.h>

@implementation OCRModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(recognizeText:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    @try {
      // 이미지 파일 로드
      NSURL *imageURL = [NSURL URLWithString:imagePath];
      UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:imageURL]];
      
      if (!image) {
        reject(@"IMAGE_LOAD_ERROR", @"이미지를 로드할 수 없습니다", nil);
        return;
      }
      
      // Vision 요청 생성
      VNRecognizeTextRequest *request = [[VNRecognizeTextRequest alloc] initWithCompletionHandler:^(VNRequest *request, NSError *error) {
        if (error) {
          reject(@"OCR_ERROR", error.localizedDescription, error);
          return;
        }
        
        NSMutableArray *recognizedTexts = [NSMutableArray array];
        
        // 인식된 텍스트 추출
        for (VNRecognizedTextObservation *observation in request.results) {
          VNRecognizedText *topCandidate = [observation topCandidates:1].firstObject;
          if (topCandidate) {
            [recognizedTexts addObject:topCandidate.string];
            RCTLogInfo(@"인식된 텍스트: %@", topCandidate.string);
          }
        }
        
        resolve(recognizedTexts);
      }];
      
      // 한국어 인식 설정
      request.recognitionLanguages = @[@"ko-KR", @"en-US"];
      request.recognitionLevel = VNRequestTextRecognitionLevelAccurate;
      
      // 이미지 핸들러 생성 및 요청 실행
      VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithCGImage:image.CGImage options:@{}];
      NSError *error;
      [handler performRequests:@[request] error:&error];
      
      if (error) {
        reject(@"PROCESSING_ERROR", error.localizedDescription, error);
      }
    } @catch (NSException *exception) {
      reject(@"EXCEPTION", exception.reason, nil);
    }
  });
}

@end