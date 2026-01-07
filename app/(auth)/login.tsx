import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login: authLogin, error: authError, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Local loading state is handled by useAuth but we can sync if needed
  // or just use isLoading from hook. Let's use hook's isLoading.

  const handleLogin = async () => {
    if (!email || !password) return;

    // Call the real login method
    const success = await authLogin(email, password);
    if (success) {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")} // Fallback if image doesn't exist, ensure icon is there or use text
          style={{ width: 80, height: 80, borderRadius: 16 }}
        />
        <Text
          variant="displaySmall"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Travelling
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Your premium travel consultancy
        </Text>
      </View>

      <View style={styles.form}>
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

        {authError ? (
          <HelperText type="error" visible={!!authError}>
            {authError}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          contentStyle={{ height: 50 }}
        >
          Sign In
        </Button>

        <Button
          mode="text"
          onPress={() => router.push("/(auth)/signup")}
          style={styles.textButton}
        >
          Create an Account
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
    marginTop: 16,
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
