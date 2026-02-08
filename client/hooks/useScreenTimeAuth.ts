// hooks/useScreenTimeAuth.ts
import { useCallback, useState } from "react";
import { Alert, Platform } from "react-native";

let DeviceActivity: typeof import("react-native-device-activity") | null = null;

if (Platform.OS === "ios") {
  DeviceActivity = require("react-native-device-activity");
}

export type AuthStatus =
  | "notDetermined"
  | "approved"
  | "denied"
  | "unavailable";

export function useScreenTimeAuth() {
  const [status, setStatus] = useState<AuthStatus>(
    Platform.OS === "ios" ? "notDetermined" : "unavailable",
  );
  const [isLoading, setIsLoading] = useState(false);

  const requestAuthorization = useCallback(async () => {
    if (Platform.OS !== "ios" || !DeviceActivity) {
      setStatus("unavailable");
      return false;
    }

    setIsLoading(true);
    try {
      // This triggers the native iOS Screen Time permission dialog
      await DeviceActivity.requestAuthorization();
      setStatus("approved");
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Screen Time authorization failed:", error);
      setStatus("denied");
      setIsLoading(false);

      Alert.alert(
        "Screen Time Access Required",
        "Please enable Screen Time access in Settings > Screen Time > App Name to use this feature.",
        [{ text: "OK" }],
      );
      return false;
    }
  }, []);

  const revokeAuthorization = useCallback(async () => {
    if (Platform.OS !== "ios" || !DeviceActivity) return;
    try {
      DeviceActivity.revokeAuthorization();
      setStatus("notDetermined");
    } catch (error) {
      console.error("Failed to revoke authorization:", error);
    }
  }, []);

  return {
    status,
    isLoading,
    requestAuthorization,
    revokeAuthorization,
    isAuthorized: status === "approved",
    isIOS: Platform.OS === "ios",
  };
}
