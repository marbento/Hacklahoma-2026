// frontend/app/onboarding/register.tsx
import { useState, useCallback } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Fill in both fields");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), name.trim());
      router.push("/onboarding/connect-services");
    } catch {
      try {
        await login(email.trim());
        router.push("/onboarding/connect-services");
      } catch (e: any) {
        Alert.alert("Error", e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [name, email]);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.step}>Step 1 of 3</Text>
        <Text style={s.title}>Create Your Account</Text>
        <Text style={s.subtitle}>We'll use this to save your goals and progress.</Text>

        <Text style={s.label}>Your Name</Text>
        <TextInput style={s.input} placeholder="Daniel" placeholderTextColor="#555"
          value={name} onChangeText={setName} autoCapitalize="words" autoFocus />

        <Text style={s.label}>University Email</Text>
        <TextInput style={s.input} placeholder="you@ou.edu" placeholderTextColor="#555"
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <TouchableOpacity
          style={[s.btn, (!name.trim() || !email.trim() || loading) && s.disabled]}
          onPress={handleSubmit} disabled={!name.trim() || !email.trim() || loading}
        >
          <Text style={s.btnText}>{loading ? "Creating..." : "Continue"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { flex: 1, padding: 32, justifyContent: "center" },
  step: { color: "#7C6FF7", fontSize: 13, fontWeight: "600", letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 8 },
  subtitle: { fontSize: 15, color: "#888", marginTop: 6, marginBottom: 24 },
  label: { color: "#999", fontSize: 13, marginTop: 16, marginBottom: 6, fontWeight: "600" },
  input: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 16, color: "#fff", fontSize: 16, borderWidth: 1, borderColor: "#333" },
  btn: { backgroundColor: "#7C6FF7", paddingVertical: 18, borderRadius: 14, alignItems: "center", marginTop: 32 },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  disabled: { opacity: 0.4 },
});
