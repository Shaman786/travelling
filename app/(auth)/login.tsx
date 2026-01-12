import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../src/lib/authService";

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // Optional: Check pre-filled email from secure store
    SecureStore.getItemAsync("user_email").then((stored) => {
      if (stored) setEmail(stored);
    });
  }, []);

  const handleMagicLogin = async () => {
    if (!email) return;
    setIsLoading(true);
    setAuthError("");
    try {
      await authService.initiateMagicLinkLogin(email);
      await SecureStore.setItemAsync("user_email", email);
      setIsEmailSent(true);
    } catch (error: any) {
      setAuthError(error.message || "Failed to send magic link");
    } finally {
      setIsLoading(false);
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
        {!isEmailSent ? (
          <>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {authError ? (
              <HelperText type="error" visible={!!authError}>
                {authError}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleMagicLogin}
              loading={isLoading}
              disabled={isLoading || !email}
              style={styles.button}
              contentStyle={{ height: 50 }}
            >
              Send Magic Link
            </Button>

            <View style={styles.divider}>
              <Text>OR</Text>
            </View>

            <Button
              mode="outlined"
              onPress={() => router.push("/(auth)/login-phone" as any)}
              style={styles.button}
              icon="cellphone"
            >
              Continue with Phone
            </Button>
          </>
        ) : (
          <View style={styles.successContainer}>
            <MaterialCommunityIcons
              name="email-check"
              size={64}
              color={theme.colors.primary}
            />
            <Text variant="headlineSmall" style={styles.successTitle}>
              Check your inbox!
            </Text>
            <Text style={styles.successText}>
              We sent a magic link to {email}. Click the link to log in.
            </Text>
            <Button
              mode="text"
              onPress={() => setIsEmailSent(false)}
              style={styles.textButton}
            >
              Try different email
            </Button>
          </View>
        )}
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
  divider: {
    alignItems: "center",
    marginVertical: 16,
  },
  successContainer: {
    alignItems: "center",
    padding: 16,
  },
  successTitle: {
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  successText: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
});
