#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TrailHealthKit, NSObject)

RCT_EXTERN_METHOD(requestAuthorization:(NSArray *)readTypes
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(queryDailySum:(NSString *)typeId
                  date:(NSString *)date
                  unit:(NSString *)unit
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(queryPeriodSum:(NSString *)typeId
                  startDate:(NSString *)startDate
                  endDate:(NSString *)endDate
                  unit:(NSString *)unit
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(queryLatestValue:(NSString *)typeId
                  unit:(NSString *)unit
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(queryWorkoutCount:(NSString *)startDate
                  endDate:(NSString *)endDate
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(querySleepDuration:(NSString *)date
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(queryStandHours:(NSString *)date
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(queryActivitySummary:(NSString *)date
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
