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
import { authService } from "../../src/lib/authService";

type Step = "register" | "verify";

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signup } = useAuth();

  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // OTP verification removed - using email link verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await signup(email, password, name);
      if (success) {
        // Account created and verification email sent
        // Move to OTP verification step
        setStep("verify");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    try {
      await authService.sendVerificationEmail();
      setError(""); // Clear error
      alert("Verification email resent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  // handleSkipVerification removed as confusing

  if (step === "verify") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.primary }]}
          >
            Verify Your Email
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            We sent a verification link to:
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.email, { color: theme.colors.primary }]}
          >
            {email}
          </Text>
        </View>

        <View style={styles.verifyContent}>
          <Text variant="bodyMedium" style={styles.instructions}>
            Please check your email and click the verification link to complete
            your registration.
          </Text>

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={() => router.replace("/(auth)/login")}
            style={styles.button}
            contentStyle={{ height: 50 }}
          >
            Go to Login
          </Button>

          <Button
            mode="outlined"
            onPress={handleResendCode}
            loading={loading}
            style={styles.button}
          >
            Resend Verification Email
          </Button>

          <Button
            mode="text"
            onPress={() => setStep("register")}
            style={styles.textButton}
          >
            Use a different email
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

          {error ? (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
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
  },
  subtitle: {
    color: "#666",
    marginTop: 8,
  },
  email: {
    fontWeight: "600",
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  verifyContent: {
    gap: 16,
    alignItems: "center",
  },
  instructions: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    width: "100%",
  },
  textButton: {
    marginTop: 8,
  },
});
