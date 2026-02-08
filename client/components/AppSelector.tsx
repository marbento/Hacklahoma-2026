// components/AppSelector.tsx
import React, { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

let DeviceActivity: typeof import("react-native-device-activity") | null = null;
if (Platform.OS === "ios") {
  DeviceActivity = require("react-native-device-activity");
}

interface AppSelectorProps {
  onSelectionChange: (selection: string | null) => void;
}

export function AppSelector({ onSelectionChange }: AppSelectorProps) {
  const [selection, setSelection] = useState<string | null>(null);

  if (Platform.OS !== "ios" || !DeviceActivity) {
    return (
      <View style={styles.fallback}>
        <Text>App selection is only available on iOS</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select apps to monitor:</Text>
      {/* This renders Apple's native FamilyActivityPicker */}
      <DeviceActivity.DeviceActivitySelectionView
        style={styles.picker}
        familyActivitySelection={selection}
        onSelectionChange={(event) => {
          const newSelection = event.nativeEvent.familyActivitySelection;
          setSelection(newSelection);
          onSelectionChange(newSelection);
        }}
      />
      {selection && <Text style={styles.selected}>Apps selected</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  picker: { width: "100%", height: 400 },
  fallback: { padding: 16, alignItems: "center" },
  selected: { marginTop: 8, color: "green", fontWeight: "600" },
});
