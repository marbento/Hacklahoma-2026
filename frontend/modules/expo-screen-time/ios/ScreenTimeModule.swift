// modules/expo-screen-time/ios/ScreenTimeModule.swift
import ExpoModulesCore
import FamilyControls
import DeviceActivity

public class ScreenTimeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ScreenTime")
    
    AsyncFunction("requestAuthorization") { (promise: Promise) in
      Task { @MainActor in
        do {
          try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
          
          let status = AuthorizationCenter.shared.authorizationStatus
          switch status {
          case .approved:
            promise.resolve(["status": "approved"])
          case .denied:
            promise.resolve(["status": "denied"])
          case .notDetermined:
            promise.resolve(["status": "notDetermined"])
          @unknown default:
            promise.resolve(["status": "unknown"])
          }
        } catch {
          promise.reject("AUTH_ERROR", "Failed to request authorization: \(error.localizedDescription)")
        }
      }
    }
    
    AsyncFunction("checkAuthorizationStatus") { (promise: Promise) in
      let status = AuthorizationCenter.shared.authorizationStatus
      
      switch status {
      case .approved:
        promise.resolve(["status": "approved"])
      case .denied:
        promise.resolve(["status": "denied"])
      case .notDetermined:
        promise.resolve(["status": "notDetermined"])
      @unknown default:
        promise.resolve(["status": "unknown"])
      }
    }
  }
}