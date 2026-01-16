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
  // Using explicit relative path as per project structure
  const { GlassSurface } = require("../../src/components/ui/GlassSurface");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    clearError();
    const success = await login(email.trim().toLowerCase(), password);
    if (success) {
      router.replace("/(tabs)");
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../../assets/images/auth-background.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      {/* Dark Overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.4)" },
        ]}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.contentContainer}>
            {/* Logo/Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Image
                  source={require("../../assets/images/login-hero.png")}
                  style={{ width: 120, height: 120 }}
                  contentFit="contain"
                />
              </View>
              <Text
                variant="displaySmall"
                style={[styles.title, { color: "#fff" }]}
              >
                Host-Palace
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Your premium travel consultancy
              </Text>
            </View>

            {/* Glass Form */}
            <GlassSurface intensity={20} style={styles.glassForm}>
              <View style={styles.form}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError();
                  }}
                  mode="flat"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor={theme.colors.primary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  left={<TextInput.Icon icon="email-outline" color="#555" />}
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }} // Translucent input
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError();
                  }}
                  mode="flat"
                  style={styles.input}
                  underlineColor="transparent"
                  activeUnderlineColor={theme.colors.primary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="lock-outline" color="#555" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                      color="#555"
                    />
                  }
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }} // Translucent input
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
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading || !email || !password}
                  style={styles.button}
                  contentStyle={{ height: 52 }}
                  labelStyle={{ fontSize: 16, fontWeight: "bold" }}
                  buttonColor={theme.colors.primary}
                >
                  Sign In
                </Button>

                <Button
                  mode="text"
                  onPress={() => router.push("/(auth)/forgot-password" as any)}
                  textColor="#fff"
                  style={{ marginTop: 8 }}
                >
                  Forgot Password?
                </Button>
              </View>
            </GlassSurface>

            {/* Footer Action */}
            <View style={styles.footer}>
              <Text style={{ color: "#eee" }}>Don&apos;t have an account?</Text>
              <Button
                mode="contained-tonal"
                onPress={() => router.push("/(auth)/signup" as any)}
                style={styles.secondaryButton}
                compact
              >
                Create Account
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
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    // Removed background and padding to fix "white box" issue
    marginBottom: 16,
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
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  glassForm: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "transparent", // Let container handle bg or contentStyle
    borderRadius: 12,
    borderTopLeftRadius: 12, // Material design override
    borderTopRightRadius: 12,
    height: 56,
    overflow: "hidden",
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
    // Gradient or solid color handled by props
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  // Removed unused styles
});
