/**
 * Verify Email Screen
 *
 * Handles 'travelling://verify' deep link.
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
import { authService } from "../../src/lib/authService";

export default function VerifyEmailScreen() {
  const { userId, secret } = useLocalSearchParams<{
    userId: string;
    secret: string;
  }>();
  const theme = useTheme();
  const router = useRouter();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const verify = React.useCallback(async () => {
    try {
      await authService.completeVerification(userId, secret);
      setStatus("success");
    } catch (err: any) {
      // It might fail if it's a Magic Link secret and we try verifyEmail.
      // We will handle this transition shortly.
      setStatus("error");
      setErrorMsg(err.message || "Verification failed.");
    }
  }, [userId, secret]);

  useEffect(() => {
    if (userId && secret) {
      verify();
    } else {
      setStatus("error");
      setErrorMsg("Invalid verification link.");
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
            <Text style={styles.text}>Verifying your email...</Text>
          </>
        )}

        {status === "success" && (
          <>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              Verified!
            </Text>
            <Text style={styles.text}>
              Your email has been successfully verified.
            </Text>
            <Button
              mode="contained"
              onPress={() => router.replace("/(tabs)")}
              style={styles.button}
            >
              Go Home
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.error }]}
            >
              Verification Failed
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
