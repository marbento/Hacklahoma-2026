import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>Your screen time patterns</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 20 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 20 },
  subtitle: { fontSize: 16, color: "#888" },
});
