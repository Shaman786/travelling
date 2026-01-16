import { Image } from "expo-image"; // Updated import
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
import { Toast } from "toastify-react-native";
import { useAuth } from "../../src/hooks/useAuth";
// Explicit require for GlassSurface

import { GlassSurface } from "../../src/components/ui/GlassSurface";

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signup } = useAuth();

  // const [step, setStep] = useState<Step>("register");
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
        // Account created and auto-logged in
        Toast.success("Welcome to Host-Palace!");
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Background Image Component (reused)
  const BackgroundLayer = () => (
    <>
      <Image
        source={require("../../assets/images/auth-background.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.5)" },
        ]}
      />
    </>
  );

  return (
    <View style={styles.container}>
      <BackgroundLayer />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <Text
                variant="displaySmall"
                style={[styles.title, { color: "#fff" }]}
              >
                Join Us
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Start your dream journey
              </Text>
            </View>

            <GlassSurface intensity={20} style={styles.glassContainer}>
              <View style={styles.form}>
                <TextInput
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  mode="flat"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor={theme.colors.primary}
                  left={<TextInput.Icon icon="account" color="#555" />}
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                />
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="flat"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor={theme.colors.primary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  left={<TextInput.Icon icon="email-outline" color="#555" />}
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                />
                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="flat"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor={theme.colors.primary}
                  secureTextEntry
                  left={<TextInput.Icon icon="lock-outline" color="#555" />}
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
                />

                {error ? (
                  <HelperText
                    type="error"
                    visible={!!error}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.8)",
                      borderRadius: 4,
                    }}
                  >
                    {error}
                  </HelperText>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleSignup}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={{ height: 52 }}
                  labelStyle={{ fontSize: 16, fontWeight: "bold" }}
                  buttonColor={theme.colors.primary}
                >
                  Create Account
                </Button>
              </View>
            </GlassSurface>

            <View style={styles.footer}>
              <Text style={{ color: "#eee" }}>Already have an account?</Text>
              <Button
                mode="text"
                onPress={() => router.back()}
                textColor={theme.colors.primaryContainer}
              >
                Sign In
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  glassContainer: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: "#e0e0e0",
    marginTop: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    color: "#eee",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "transparent",
    borderRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: 56,
    overflow: "hidden",
  },
  button: {
    borderRadius: 12,
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
});
