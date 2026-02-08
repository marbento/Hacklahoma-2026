import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Settings & preferences</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 20 },
  subtitle: { fontSize: 16, color: "#888" },
});
