import Foundation
import HealthKit
import React

@objc(TrailHealthKit)
class TrailHealthKit: NSObject {
  
  private let store = HKHealthStore()
  
  @objc static func requiresMainQueueSetup() -> Bool { return false }
  
  @objc func requestAuthorization(
    _ readTypes: [String],
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard HKHealthStore.isHealthDataAvailable() else {
      reject("E_NO_HEALTH", "HealthKit not available", nil)
      return
    }
    var types = Set<HKObjectType>()
    for t in readTypes {
      if let qt = quantityType(for: t) { types.insert(qt) }
      else if let ct = categoryType(for: t) { types.insert(ct) }
      else if t == "workout" { types.insert(HKObjectType.workoutType()) }
    }
    store.requestAuthorization(toShare: nil, read: types) { ok, err in
      if let err = err { reject("E_AUTH", err.localizedDescription, err) }
      else { resolve(ok) }
    }
  }
  
  @objc func queryDailySum(
    _ typeId: String, date: String, unit: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let qt = quantityType(for: typeId) else { reject("E_TYPE", "Unknown: \(typeId)", nil); return }
    let cal = Calendar.current
    let d = iso(date) ?? Date()
    let start = cal.startOfDay(for: d)
    let end = cal.date(byAdding: .day, value: 1, to: start)!
    let pred = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
    let q = HKStatisticsQuery(quantityType: qt, quantitySamplePredicate: pred, options: .cumulativeSum) { _, stats, err in
      if let err = err { reject("E_QUERY", err.localizedDescription, err); return }
      resolve(stats?.sumQuantity()?.doubleValue(for: self.hkUnit(for: unit)) ?? 0.0)
    }
    store.execute(q)
  }
  
  @objc func queryPeriodSum(
    _ typeId: String, startDate: String, endDate: String, unit: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let qt = quantityType(for: typeId) else { reject("E_TYPE", "Unknown: \(typeId)", nil); return }
    let start = iso(startDate) ?? Date()
    let end = iso(endDate) ?? Date()
    let pred = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
    let q = HKStatisticsQuery(quantityType: qt, quantitySamplePredicate: pred, options: .cumulativeSum) { _, stats, err in
      if let err = err { reject("E_QUERY", err.localizedDescription, err); return }
      resolve(stats?.sumQuantity()?.doubleValue(for: self.hkUnit(for: unit)) ?? 0.0)
    }
    store.execute(q)
  }
  
  @objc func queryLatestValue(
    _ typeId: String, unit: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let qt = quantityType(for: typeId) else { reject("E_TYPE", "Unknown: \(typeId)", nil); return }
    let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
    let q = HKSampleQuery(sampleType: qt, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, err in
      if let err = err { reject("E_QUERY", err.localizedDescription, err); return }
      guard let s = samples?.first as? HKQuantitySample else { resolve(nil); return }
      resolve(s.quantity.doubleValue(for: self.hkUnit(for: unit)))
    }
    store.execute(q)
  }
  
  @objc func queryWorkoutCount(
    _ startDate: String, endDate: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let start = iso(startDate) ?? Date()
    let end = iso(endDate) ?? Date()
    let pred = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
    let q = HKSampleQuery(sampleType: HKObjectType.workoutType(), predicate: pred, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, err in
      if let err = err { reject("E_QUERY", err.localizedDescription, err); return }
      resolve(samples?.count ?? 0)
    }
    store.execute(q)
  }
  
  @objc func querySleepDuration(
    _ date: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let ct = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else { reject("E_TYPE", "Sleep N/A", nil); return }
    let cal = Calendar.current
    let d = iso(date) ?? Date()
    let noon = cal.date(bySettingHour: 12, minute: 0, second: 0, of: d)!
    let prevEvening = cal.date(byAdding: .hour, value: -18, to: noon)!
    let pred = HKQuery.predicateForSamples(withStart: prevEvening, end: noon, options: .strictStartDate)
    let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
    let q = HKSampleQuery(sampleType: ct, predicate: pred, limit: HKObjectQueryNoLimit, sortDescriptors: [sort]) { _, samples, err in
      if let err = err { reject("E_QUERY", err.localizedDescription, err); return }
      var total: Double = 0
      for s in (samples as? [HKCategorySample]) ?? [] {
        if s.value != HKCategoryValueSleepAnalysis.inBed.rawValue {
          total += s.endDate.timeIntervalSince(s.startDate)
        }
      }
      resolve(total / 3600.0)
    }
    store.execute(q)
  }
  
  @objc func queryStandHours(
    _ date: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let ct = HKObjectType.categoryType(forIdentifier: .appleStandHour) else { reject("E_TYPE", "Stand N/A", nil); return }
    let cal = Calendar.current
    let d = iso(date) ?? Date()
    let start = cal.startOfDay(for: d)
    let end = cal.date(byAdding: .day, value: 1, to: start)!
    let pred = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
    let q = HKSampleQuery(sampleType: ct, predicate: pred, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, err in
      if let err = err { reject("E_QUERY", err.localizedDescription, err); return }
      let stood = (samples as? [HKCategorySample])?.filter { $0.value == HKCategoryValueAppleStandHour.stood.rawValue }.count ?? 0
      resolve(stood)
    }
    store.execute(q)
  }
  
  @objc func queryActivitySummary(
    _ date: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let cal = Calendar.current
    let d = iso(date) ?? Date()
    let components = cal.dateComponents([.year, .month, .day], from: d)
    let pred = HKQuery.predicateForActivitySummary(with: components)
    let q = HKActivitySummaryQuery(predicate: pred) { _, summaries, err in
      if let err = err { reject("E_QUERY", err.localizedDescription, err); return }
      guard let s = summaries?.first else { resolve(nil); return }
      resolve([
        "activeCalories": s.activeEnergyBurned.doubleValue(for: .kilocalorie()),
        "exerciseMinutes": s.appleExerciseTime.doubleValue(for: .minute()),
        "standHours": s.appleStandHours.doubleValue(for: .count()),
        "moveGoal": s.activeEnergyBurnedGoal.doubleValue(for: .kilocalorie()),
        "exerciseGoal": s.appleExerciseTimeGoal.doubleValue(for: .minute()),
        "standGoal": s.appleStandHoursGoal.doubleValue(for: .count()),
      ])
    }
    store.execute(q)
  }
  
  // MARK: - Helpers
  private func quantityType(for id: String) -> HKQuantityType? {
    let map: [String: HKQuantityTypeIdentifier] = [
      "steps": .stepCount, "active_calories": .activeEnergyBurned,
      "exercise_minutes": .appleExerciseTime, "distance_walk_run": .distanceWalkingRunning,
      "flights_climbed": .flightsClimbed, "resting_heart_rate": .restingHeartRate,
      "hrv": .heartRateVariabilitySDNN, "vo2max": .vo2Max, "water_intake": .dietaryWater,
    ]
    guard let id = map[id] else { return nil }
    return HKQuantityType.quantityType(forIdentifier: id)
  }
  private func categoryType(for id: String) -> HKCategoryType? {
    let map: [String: HKCategoryTypeIdentifier] = [
      "sleep": .sleepAnalysis, "mindful_minutes": .mindfulSession, "stand_hours": .appleStandHour,
    ]
    guard let id = map[id] else { return nil }
    return HKCategoryType.categoryType(forIdentifier: id)
  }
  private func hkUnit(for unit: String) -> HKUnit {
    switch unit {
    case "count": return .count(); case "kcal": return .kilocalorie()
    case "min": return .minute(); case "hr": return .hour()
    case "mi": return .mile(); case "fl_oz": return .fluidOunceUS()
    case "bpm": return HKUnit(from: "count/min")
    case "ms": return .secondUnit(with: .milli)
    case "mL/kg/min": return HKUnit(from: "ml/kg*min")
    default: return .count()
    }
  }
  private func iso(_ s: String) -> Date? {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return f.date(from: s) ?? ISO8601DateFormatter().date(from: s)
  }
}
