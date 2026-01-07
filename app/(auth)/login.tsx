import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import { useBiometrics } from "../../src/hooks/useBiometrics";

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login: authLogin, error: authError, isLoading } = useAuth();
  const { isCompatible, isEnrolled, authenticate, biometricType } =
    useBiometrics();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [canBiometric, setCanBiometric] = useState(false);

  const checkStoredCredentials = useCallback(async () => {
    try {
      if (isCompatible && isEnrolled) {
        const storedEmail = await SecureStore.getItemAsync("user_email");
        const storedPassword = await SecureStore.getItemAsync("user_password");
        if (storedEmail && storedPassword) {
          setCanBiometric(true);
        }
      }
    } catch {}
  }, [isCompatible, isEnrolled]);

  useEffect(() => {
    checkStoredCredentials();
  }, [checkStoredCredentials]);

  const handleLogin = async () => {
    if (!email || !password) return;

    const success = await authLogin(email, password);
    if (success) {
      // Save credentials for biometric next time
      await SecureStore.setItemAsync("user_email", email);
      await SecureStore.setItemAsync("user_password", password);
      router.replace("/(tabs)");
    }
  };

  const handleBiometricLogin = async () => {
    const authorized = await authenticate();
    if (authorized) {
      const storedEmail = await SecureStore.getItemAsync("user_email");
      const storedPassword = await SecureStore.getItemAsync("user_password");
      if (storedEmail && storedPassword) {
        // Pre-fill fields for visual feedback
        setEmail(storedEmail);
        setPassword(storedPassword);
        // Login
        const success = await authLogin(storedEmail, storedPassword);
        if (success) {
          router.replace("/(tabs)");
        }
      }
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
          keyboardType="email-address"
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

        {canBiometric && (
          <TouchableOpacity
            style={styles.biometricBtn}
            onPress={handleBiometricLogin}
            disabled={isLoading}
          >
            <MaterialCommunityIcons
              name={biometricType === 2 ? "face-recognition" : "fingerprint"}
              size={32}
              color={theme.colors.primary}
            />
            <Text style={{ color: theme.colors.primary, marginTop: 4 }}>
              Login with {biometricType === 2 ? "Face ID" : "Biometrics"}
            </Text>
          </TouchableOpacity>
        )}

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
  biometricBtn: {
    alignItems: "center",
    marginTop: 16,
    padding: 8,
  },
});
