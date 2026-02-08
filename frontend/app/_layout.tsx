// frontend/app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootNavigator() {
  const { isLoading, isLoggedIn, hasCompletedOnboarding } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inOnboarding = segments[0] === "onboarding";

    if (!isLoggedIn && !inOnboarding) {
      // Not logged in → go to welcome
      router.replace("/onboarding/welcome");
    } else if (isLoggedIn && !hasCompletedOnboarding && !inOnboarding) {
      // Logged in but hasn't finished onboarding → send back to connect-services
      router.replace("/onboarding/connect-services");
    } else if (isLoggedIn && hasCompletedOnboarding && inOnboarding) {
      // Done with everything → go to main app
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
  loading: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
  },
});
