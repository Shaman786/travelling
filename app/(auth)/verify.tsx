import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../src/lib/authService";

export default function VerifyScreen() {
  const { userId, secret } = useLocalSearchParams<{
    userId: string;
    secret: string;
  }>();
  const router = useRouter();
  const theme = useTheme();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [errorDetails, setErrorDetails] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await authService.completeVerification(userId, secret);
        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setErrorDetails(error.message || "Failed to verify email.");
      }
    };

    if (userId && secret) {
      verifyEmail();
    } else {
      setStatus("error");
      setErrorDetails("Invalid verification link.");
    }
  }, [userId, secret]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        {status === "verifying" && (
          <>
            <ActivityIndicator size="large" style={styles.icon} />
            <Text variant="titleMedium">Verifying your email...</Text>
          </>
        )}

        {status === "success" && (
          <>
            <Text
              variant="headlineMedium"
              style={{ color: theme.colors.primary, marginBottom: 16 }}
            >
              Success!
            </Text>
            <Text
              variant="bodyLarge"
              style={{ textAlign: "center", marginBottom: 32 }}
            >
              Your email has been verified. You can now fully access your
              account.
            </Text>
            <Button mode="contained" onPress={() => router.replace("/(tabs)")}>
              Go to Home
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <Text
              variant="headlineMedium"
              style={{ color: theme.colors.error, marginBottom: 16 }}
            >
              Verification Failed
            </Text>
            <Text
              variant="bodyLarge"
              style={{ textAlign: "center", marginBottom: 32 }}
            >
              {errorDetails}
            </Text>
            <Button
              mode="contained"
              onPress={() => router.replace("/(auth)/login")}
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
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginBottom: 24,
  },
});
