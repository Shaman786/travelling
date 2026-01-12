/**
 * Login Callback Screen
 *
 * Handles 'travelling://login-callback' deep link for Magic URL Login.
 *
 * Query Params:
 * - userId: string
 * - secret: string
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import { authService } from "../../src/lib/authService";

export default function LoginCallbackScreen() {
  const { userId, secret } = useLocalSearchParams<{
    userId: string;
    secret: string;
  }>();
  const theme = useTheme();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const verify = React.useCallback(async () => {
    try {
      await authService.completeMagicLinkLogin(userId, secret);
      await refreshUser();
      setStatus("success");

      // Auto redirect after short delay
      setTimeout(() => {
        router.replace("/(auth)/post-login-options" as any);
      }, 1500);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Login failed.");
    }
  }, [userId, secret, refreshUser, router]);

  useEffect(() => {
    if (userId && secret) {
      verify();
    } else {
      setStatus("error");
      setErrorMsg("Invalid login link.");
    }
  }, [userId, secret, verify]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        {status === "verifying" && (
          <>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.text}>Logging you in...</Text>
          </>
        )}

        {status === "success" && (
          <>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              Success!
            </Text>
            <Text style={styles.text}>
              You have been successfully logged in.
            </Text>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </>
        )}

        {status === "error" && (
          <>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.error }]}
            >
              Login Failed
            </Text>
            <Text style={styles.text}>{errorMsg}</Text>
            <Button
              mode="contained"
              onPress={() => router.replace("/(auth)/login")}
              style={styles.button}
            >
              Back to Login
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  button: {
    minWidth: 150,
  },
});
