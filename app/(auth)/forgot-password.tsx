/**
 * Forgot Password Screen
 *
 * Request password reset via email.
 */

import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import {
  Button,
  HelperText,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { authService } from "../../src/lib/authService";

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (): boolean => {
    setEmailError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const handleResetRequest = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email.trim().toLowerCase());
      setEmailSent(true);
      Toast.success("Reset link sent to your email!");
    } catch (error: any) {
      Toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.successContainer}>
          <IconButton
            icon="email-check-outline"
            size={64}
            iconColor={theme.colors.primary}
          />
          <Text
            variant="headlineSmall"
            style={[styles.successTitle, { color: theme.colors.primary }]}
          >
            Check Your Email
          </Text>
          <Text variant="bodyLarge" style={styles.successText}>
            We&apos;ve sent a password reset link to:
          </Text>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.primary, marginVertical: 8 }}
          >
            {email}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.successText, { marginTop: 16 }]}
          >
            Click the link in the email to reset your password. If you
            don&apos;t see it, check your spam folder.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.replace("/(auth)/login")}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Back to Login
          </Button>
          <Button
            mode="text"
            onPress={() => setEmailSent(false)}
            style={{ marginTop: 8 }}
          >
            Try a different email
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            style={styles.backButton}
          />

          {/* Header */}
          <View style={styles.header}>
            <Text
              variant="displaySmall"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              Forgot Password?
            </Text>
            <Text
              variant="bodyLarge"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              No worries! Enter your email and we&apos;ll send you a reset link.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              left={<TextInput.Icon icon="email-outline" />}
              error={!!emailError}
              style={styles.input}
            />
            {emailError && <HelperText type="error">{emailError}</HelperText>}

            <Button
              mode="contained"
              onPress={handleResetRequest}
              loading={isLoading}
              disabled={isLoading}
              contentStyle={styles.buttonContent}
              style={styles.button}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Button
              mode="text"
              onPress={() => router.back()}
              style={{ marginTop: 16 }}
            >
              Back to Login
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: -8,
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 4,
  },
  button: {
    borderRadius: 8,
    marginTop: 24,
  },
  buttonContent: {
    height: 52,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  successTitle: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    textAlign: "center",
    color: "#666",
  },
});
