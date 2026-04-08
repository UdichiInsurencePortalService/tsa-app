import { StyleSheet, Text, View } from "react-native";

export default function support() {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>This is a placeholder screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  subtitle: {
    fontSize: 16,
  },
});
