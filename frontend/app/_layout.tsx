import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { C } from "../theme";

function RootNavigator() {
  const { isLoading, isLoggedIn, hasCompletedOnboarding } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inOnboarding = segments[0] === "onboarding";
    if (isLoggedIn && hasCompletedOnboarding && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isLoading, isLoggedIn, hasCompletedOnboarding, segments]);

  if (isLoading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator size="large" color={C.kelp} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
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
    backgroundColor: C.beige,
    justifyContent: "center",
    alignItems: "center",
  },
});
