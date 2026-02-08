// frontend/app/_layout.tsx
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

function RootNavigator() {
  const { isLoading, isLoggedIn, hasCompletedOnboarding } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!isLoggedIn && !inOnboarding) {
      router.replace("/onboarding/welcome");
    } else if (isLoggedIn && hasCompletedOnboarding && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isLoading, isLoggedIn, hasCompletedOnboarding, segments]);

  if (isLoading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color="#7C6FF7" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" },
});
