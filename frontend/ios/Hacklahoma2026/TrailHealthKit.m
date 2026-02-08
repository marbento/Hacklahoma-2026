#import <React/RCTBridgeModule.h>
#import <HealthKit/HealthKit.h>

@interface TrailHealthKit : NSObject <RCTBridgeModule>
@property (nonatomic, strong) HKHealthStore *store;
@end

@implementation TrailHealthKit

RCT_EXPORT_MODULE();

- (instancetype)init {
  self = [super init];
  if (self) { _store = [[HKHealthStore alloc] init]; }
  return self;
}

+ (BOOL)requiresMainQueueSetup { return NO; }

#pragma mark - Type Helpers

- (HKQuantityType *)quantityTypeFor:(NSString *)typeId {
  static NSDictionary *map;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    map = @{
      @"steps": HKQuantityTypeIdentifierStepCount,
      @"active_calories": HKQuantityTypeIdentifierActiveEnergyBurned,
      @"exercise_minutes": HKQuantityTypeIdentifierAppleExerciseTime,
      @"distance_walk_run": HKQuantityTypeIdentifierDistanceWalkingRunning,
      @"flights_climbed": HKQuantityTypeIdentifierFlightsClimbed,
      @"resting_heart_rate": HKQuantityTypeIdentifierRestingHeartRate,
      @"hrv": HKQuantityTypeIdentifierHeartRateVariabilitySDNN,
      @"vo2max": HKQuantityTypeIdentifierVO2Max,
      @"water_intake": HKQuantityTypeIdentifierDietaryWater,
    };
  });
  NSString *identifier = map[typeId];
  return identifier ? [HKQuantityType quantityTypeForIdentifier:identifier] : nil;
}

- (HKCategoryType *)categoryTypeFor:(NSString *)typeId {
  static NSDictionary *map;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    map = @{
      @"sleep": HKCategoryTypeIdentifierSleepAnalysis,
      @"mindful_minutes": HKCategoryTypeIdentifierMindfulSession,
      @"stand_hours": HKCategoryTypeIdentifierAppleStandHour,
    };
  });
  NSString *identifier = map[typeId];
  return identifier ? [HKCategoryType categoryTypeForIdentifier:identifier] : nil;
}

- (HKUnit *)hkUnitFor:(NSString *)unit {
  if ([unit isEqualToString:@"count"]) return [HKUnit countUnit];
  if ([unit isEqualToString:@"kcal"]) return [HKUnit kilocalorieUnit];
  if ([unit isEqualToString:@"min"]) return [HKUnit minuteUnit];
  if ([unit isEqualToString:@"hr"]) return [HKUnit hourUnit];
  if ([unit isEqualToString:@"mi"]) return [HKUnit mileUnit];
  if ([unit isEqualToString:@"fl_oz"]) return [HKUnit fluidOunceUSUnit];
  if ([unit isEqualToString:@"bpm"]) return [[HKUnit countUnit] unitDividedByUnit:[HKUnit minuteUnit]];
  if ([unit isEqualToString:@"ms"]) return [HKUnit unitFromString:@"ms"];
  if ([unit isEqualToString:@"mL/kg/min"]) return [HKUnit unitFromString:@"ml/kg*min"];
  return [HKUnit countUnit];
}

- (NSDate *)parseISO:(NSString *)str {
  NSISO8601DateFormatter *f = [[NSISO8601DateFormatter alloc] init];
  f.formatOptions = NSISO8601DateFormatWithInternetDateTime | NSISO8601DateFormatWithFractionalSeconds;
  NSDate *d = [f dateFromString:str];
  if (!d) {
    f.formatOptions = NSISO8601DateFormatWithInternetDateTime;
    d = [f dateFromString:str];
  }
  return d ?: [NSDate date];
}

#pragma mark - Authorization

RCT_EXPORT_METHOD(requestAuthorization:(NSArray *)readTypes
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  if (![HKHealthStore isHealthDataAvailable]) {
    reject(@"E_NO_HEALTH", @"HealthKit not available", nil);
    return;
  }
  NSMutableSet *types = [NSMutableSet set];
  for (NSString *t in readTypes) {
    HKQuantityType *qt = [self quantityTypeFor:t];
    if (qt) { [types addObject:qt]; continue; }
    HKCategoryType *ct = [self categoryTypeFor:t];
    if (ct) { [types addObject:ct]; continue; }
    if ([t isEqualToString:@"workout"]) { [types addObject:[HKWorkoutType workoutType]]; }
  }
  [self.store requestAuthorizationToShareTypes:nil readTypes:types completion:^(BOOL ok, NSError *err) {
    if (err) reject(@"E_AUTH", err.localizedDescription, err);
    else resolve(@(ok));
  }];
}

#pragma mark - Daily Sum

RCT_EXPORT_METHOD(queryDailySum:(NSString *)typeId date:(NSString *)date unit:(NSString *)unit
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  HKQuantityType *qt = [self quantityTypeFor:typeId];
  if (!qt) { reject(@"E_TYPE", [NSString stringWithFormat:@"Unknown: %@", typeId], nil); return; }
  NSCalendar *cal = [NSCalendar currentCalendar];
  NSDate *d = [self parseISO:date];
  NSDate *start = [cal startOfDayForDate:d];
  NSDate *end = [cal dateByAddingUnit:NSCalendarUnitDay value:1 toDate:start options:0];
  NSPredicate *pred = [HKQuery predicateForSamplesWithStartDate:start endDate:end options:HKQueryOptionStrictStartDate];
  HKStatisticsQuery *q = [[HKStatisticsQuery alloc] initWithQuantityType:qt quantitySamplePredicate:pred options:HKStatisticsOptionCumulativeSum completionHandler:^(HKStatisticsQuery *query, HKStatistics *stats, NSError *err) {
    if (err) { reject(@"E_QUERY", err.localizedDescription, err); return; }
    double val = stats.sumQuantity ? [stats.sumQuantity doubleValueForUnit:[self hkUnitFor:unit]] : 0.0;
    resolve(@(val));
  }];
  [self.store executeQuery:q];
}

#pragma mark - Period Sum

RCT_EXPORT_METHOD(queryPeriodSum:(NSString *)typeId startDate:(NSString *)startDate endDate:(NSString *)endDate unit:(NSString *)unit
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  HKQuantityType *qt = [self quantityTypeFor:typeId];
  if (!qt) { reject(@"E_TYPE", [NSString stringWithFormat:@"Unknown: %@", typeId], nil); return; }
  NSDate *start = [self parseISO:startDate];
  NSDate *end = [self parseISO:endDate];
  NSPredicate *pred = [HKQuery predicateForSamplesWithStartDate:start endDate:end options:HKQueryOptionStrictStartDate];
  HKStatisticsQuery *q = [[HKStatisticsQuery alloc] initWithQuantityType:qt quantitySamplePredicate:pred options:HKStatisticsOptionCumulativeSum completionHandler:^(HKStatisticsQuery *query, HKStatistics *stats, NSError *err) {
    if (err) { reject(@"E_QUERY", err.localizedDescription, err); return; }
    double val = stats.sumQuantity ? [stats.sumQuantity doubleValueForUnit:[self hkUnitFor:unit]] : 0.0;
    resolve(@(val));
  }];
  [self.store executeQuery:q];
}

#pragma mark - Latest Value

RCT_EXPORT_METHOD(queryLatestValue:(NSString *)typeId unit:(NSString *)unit
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  HKQuantityType *qt = [self quantityTypeFor:typeId];
  if (!qt) { reject(@"E_TYPE", [NSString stringWithFormat:@"Unknown: %@", typeId], nil); return; }
  NSSortDescriptor *sort = [NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO];
  HKSampleQuery *q = [[HKSampleQuery alloc] initWithSampleType:qt predicate:nil limit:1 sortDescriptors:@[sort] resultsHandler:^(HKSampleQuery *query, NSArray *samples, NSError *err) {
    if (err) { reject(@"E_QUERY", err.localizedDescription, err); return; }
    if (samples.count == 0) { resolve([NSNull null]); return; }
    HKQuantitySample *s = samples.firstObject;
    resolve(@([s.quantity doubleValueForUnit:[self hkUnitFor:unit]]));
  }];
  [self.store executeQuery:q];
}

#pragma mark - Workout Count

RCT_EXPORT_METHOD(queryWorkoutCount:(NSString *)startDate endDate:(NSString *)endDate
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSDate *start = [self parseISO:startDate];
  NSDate *end = [self parseISO:endDate];
  NSPredicate *pred = [HKQuery predicateForSamplesWithStartDate:start endDate:end options:HKQueryOptionStrictStartDate];
  HKSampleQuery *q = [[HKSampleQuery alloc] initWithSampleType:[HKWorkoutType workoutType] predicate:pred limit:HKObjectQueryNoLimit sortDescriptors:nil resultsHandler:^(HKSampleQuery *query, NSArray *samples, NSError *err) {
    if (err) { reject(@"E_QUERY", err.localizedDescription, err); return; }
    resolve(@(samples.count));
  }];
  [self.store executeQuery:q];
}

#pragma mark - Sleep

RCT_EXPORT_METHOD(querySleepDuration:(NSString *)date
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  HKCategoryType *ct = [HKCategoryType categoryTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis];
  NSCalendar *cal = [NSCalendar currentCalendar];
  NSDate *d = [self parseISO:date];
  NSDate *noon = [cal dateBySettingHour:12 minute:0 second:0 ofDate:d options:0];
  NSDate *prevEvening = [cal dateByAddingUnit:NSCalendarUnitHour value:-18 toDate:noon options:0];
  NSPredicate *pred = [HKQuery predicateForSamplesWithStartDate:prevEvening endDate:noon options:HKQueryOptionStrictStartDate];
  NSSortDescriptor *sort = [NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:YES];
  HKSampleQuery *q = [[HKSampleQuery alloc] initWithSampleType:ct predicate:pred limit:HKObjectQueryNoLimit sortDescriptors:@[sort] resultsHandler:^(HKSampleQuery *query, NSArray *samples, NSError *err) {
    if (err) { reject(@"E_QUERY", err.localizedDescription, err); return; }
    double total = 0;
    for (HKCategorySample *s in samples) {
      if (s.value != HKCategoryValueSleepAnalysisInBed) {
        total += [s.endDate timeIntervalSinceDate:s.startDate];
      }
    }
    resolve(@(total / 3600.0));
  }];
  [self.store executeQuery:q];
}

#pragma mark - Stand Hours

RCT_EXPORT_METHOD(queryStandHours:(NSString *)date
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  HKCategoryType *ct = [HKCategoryType categoryTypeForIdentifier:HKCategoryTypeIdentifierAppleStandHour];
  NSCalendar *cal = [NSCalendar currentCalendar];
  NSDate *d = [self parseISO:date];
  NSDate *start = [cal startOfDayForDate:d];
  NSDate *end = [cal dateByAddingUnit:NSCalendarUnitDay value:1 toDate:start options:0];
  NSPredicate *pred = [HKQuery predicateForSamplesWithStartDate:start endDate:end options:HKQueryOptionStrictStartDate];
  HKSampleQuery *q = [[HKSampleQuery alloc] initWithSampleType:ct predicate:pred limit:HKObjectQueryNoLimit sortDescriptors:nil resultsHandler:^(HKSampleQuery *query, NSArray *samples, NSError *err) {
    if (err) { reject(@"E_QUERY", err.localizedDescription, err); return; }
    NSInteger stood = 0;
    for (HKCategorySample *s in samples) {
      if (s.value == HKCategoryValueAppleStandHourStood) stood++;
    }
    resolve(@(stood));
  }];
  [self.store executeQuery:q];
}

#pragma mark - Activity Summary

RCT_EXPORT_METHOD(queryActivitySummary:(NSString *)date
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSCalendar *cal = [NSCalendar currentCalendar];
  NSDate *d = [self parseISO:date];
  NSDateComponents *comp = [cal components:(NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay) fromDate:d];
  comp.calendar = cal;
  NSPredicate *pred = [HKQuery predicateForActivitySummaryWithDateComponents:comp];
  HKActivitySummaryQuery *q = [[HKActivitySummaryQuery alloc] initWithPredicate:pred resultsHandler:^(HKActivitySummaryQuery *query, NSArray<HKActivitySummary *> *summaries, NSError *err) {
    if (err) { reject(@"E_QUERY", err.localizedDescription, err); return; }
    if (summaries.count == 0) { resolve([NSNull null]); return; }
    HKActivitySummary *s = summaries.firstObject;
    resolve(@{
      @"activeCalories": @([s.activeEnergyBurned doubleValueForUnit:[HKUnit kilocalorieUnit]]),
      @"exerciseMinutes": @([s.appleExerciseTime doubleValueForUnit:[HKUnit minuteUnit]]),
      @"standHours": @([s.appleStandHours doubleValueForUnit:[HKUnit countUnit]]),
      @"moveGoal": @([s.activeEnergyBurnedGoal doubleValueForUnit:[HKUnit kilocalorieUnit]]),
      @"exerciseGoal": @([s.appleExerciseTimeGoal doubleValueForUnit:[HKUnit minuteUnit]]),
      @"standGoal": @([s.appleStandHoursGoal doubleValueForUnit:[HKUnit countUnit]]),
    });
  }];
  [self.store executeQuery:q];
}

@end