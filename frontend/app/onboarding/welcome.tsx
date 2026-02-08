// frontend/app/onboarding/welcome.tsx
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.emoji}>🥾</Text>
        <Text style={s.title}>Trail</Text>
        <Text style={s.tagline}>Gentle nudges to keep you on your path</Text>

        <View style={s.features}>
          <Text style={s.feature}>
            📚 Sync with Canvas to track assignments
          </Text>
          <Text style={s.feature}>🎯 Set daily goals and build streaks</Text>
          <Text style={s.feature}>
            🤖 AI study plans that break down homework
          </Text>
          <Text style={s.feature}>⏱️ Nudge you when you doom-scroll</Text>
          <Text style={s.feature}>🎙️ Jarvis-like daily briefings</Text>
        </View>

        <TouchableOpacity
          style={s.btn}
          onPress={() => router.push("/onboarding/register")}
        >
          <Text style={s.btnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emoji: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 42, fontWeight: "bold", color: "#fff" },
  tagline: { fontSize: 16, color: "#888", marginTop: 8, textAlign: "center" },
  features: { marginTop: 40, gap: 14, width: "100%" },
  feature: { color: "#ccc", fontSize: 15, lineHeight: 22 },
  btn: {
    backgroundColor: "#7C6FF7",
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 14,
    marginTop: 40,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
