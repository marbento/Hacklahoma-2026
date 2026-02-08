import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function GoalsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Goals</Text>
      <Text style={styles.subtitle}>Set what matters to you</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 20 },
  subtitle: { fontSize: 16, color: "#888" },
});
