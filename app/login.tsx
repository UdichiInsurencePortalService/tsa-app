import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "689715996409-pvolq210finsa0mfa0tm6gv4b35f1jo1.apps.googleusercontent.com",
    androidClientId:
      "689715996409-pvolq210finsa0mfa0tm6gv4b35f1jo1.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const user = response.authentication;

      AsyncStorage.setItem("user", JSON.stringify(user));

      router.replace("/home"); // 🔥 FIX (hom
      // e tabs)
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TSA</Text>
      <Text style={styles.subtitle}>Talent And Skill Assess</Text>

      <View style={{ marginTop: 30 }}>
        <Button title="Continue with Google" onPress={() => promptAsync()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2D54E8", // 🔥 FIX
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff", // 🔥 FIX
  },
  subtitle: {
    fontSize: 14,
    color: "#fff", // 🔥 FIX
    marginTop: 5,
  },
});
