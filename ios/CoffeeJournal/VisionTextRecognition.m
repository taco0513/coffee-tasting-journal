#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VisionTextRecognition, NSObject)

RCT_EXTERN_METHOD(recognizeText:(NSString *)imagePath
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

@end