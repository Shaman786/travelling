import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../src/store/useStore";

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const login = useStore((state) => state.login);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    setLoading(true);
    // Mock signup delay
    setTimeout(() => {
      login({
        id: "user_new_" + Date.now(),
        name: name,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${name}`,
      });
      setLoading(false);
      router.replace("/(tabs)");
    }, 1000);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Join Travelling
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Start your journey with us
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSignup}
          loading={loading}
          style={styles.button}
          contentStyle={{ height: 50 }}
        >
          Create Account
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.textButton}
        >
          Already have an account? Sign In
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  textButton: {
    marginTop: 8,
  },
});
