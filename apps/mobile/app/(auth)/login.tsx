/**
 * Login Screen
 *
 * Basic email/password authentication.
 */

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
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
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    clearError();
    const success = await login(email.trim().toLowerCase(), password);
    if (success) {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={{ width: 80, height: 80, borderRadius: 16 }}
          />
          <Text
            variant="displaySmall"
            style={[styles.title, { color: theme.colors.primary }]}
          >
            Host-Palace
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Your premium travel consultancy
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearError();
            }}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            left={<TextInput.Icon icon="email-outline" />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError();
            }}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading || !email || !password}
            style={styles.button}
            contentStyle={{ height: 50 }}
          >
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => router.push("/(auth)/forgot-password" as any)}
            style={styles.textButton}
          >
            Forgot Password?
          </Button>

          {/* Social Login - Archived for future use when OAuth is configured
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
            <Text style={{ color: theme.colors.outline, marginHorizontal: 16 }}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
          </View>
          <Button mode="outlined" onPress={() => loginWithProvider("google")} icon="google" style={styles.button}>
            Continue with Google
          </Button>
          <Button mode="outlined" onPress={() => loginWithProvider("apple")} icon="apple" style={styles.button}>
            Continue with Apple
          </Button>
          */}

          <View style={{ height: 16 }} />

          <Button
            mode="outlined"
            onPress={() => router.push("/(auth)/signup" as any)}
            style={styles.button}
          >
            Create New Account
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  keyboardView: {
    flex: 1,
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
    gap: 12,
  },
  input: {
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  textButton: {
    marginTop: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
});
