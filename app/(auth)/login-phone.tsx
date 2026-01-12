/**
 * Phone Login Screen
 *
 * Primary authentication method:
 * 1. User enters Phone Number
 * 2. User enters OTP
 * 3. On success, redirects to Post-Login Options or Home
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
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
import { authService } from "../../src/lib/authService";

export default function PhoneLoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { refreshUser } = useAuth(); // To update state after login

  // State
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Step 1: Send OTP
   */
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      Toast.error("Please enter a valid phone number");
      return;
    }

    // Basic format enforcement e.g. +1... or simple addition if missing
    // Appwrite expects E.164. Let's assume user types number, we might need country code.
    // For now, let's assume strict entry or simple prefixing if user builds tailored input.
    // Adding a generic '+' if missing to help out.
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    setIsLoading(true);
    try {
      const generatedUserId =
        await authService.initiatePhoneLogin(formattedPhone);
      setUserId(generatedUserId);
      setStep("otp");
      Toast.success("OTP sent!");
    } catch (error: any) {
      Toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Step 2: Verify OTP
   */
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Toast.error("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      await authService.completePhoneLogin(userId, otp);
      await refreshUser(); // Sync global state

      Toast.success("Welcome back!");
      // Logic: If user is new vs old.
      // Appwrite doesn't explicitly tell us "isNew" on login easily without metadata.
      // We'll redirect to Post-Login options to be safe/flexible for now.
      router.replace("/(auth)/post-login-options");
    } catch (error: any) {
      Toast.error(error.message || "Invalid Code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="cellphone-key"
            size={64}
            color={theme.colors.primary}
          />
          <Text variant="headlineMedium" style={styles.title}>
            {step === "phone"
              ? "Enter Phone Number"
              : "Enter Verification Code"}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {step === "phone"
              ? "We'll send you a secure code to log in."
              : `Code sent to ${phone}`}
          </Text>
        </View>

        <View style={styles.form}>
          {step === "phone" ? (
            <>
              <TextInput
                label="Phone Number (e.g. +1234567890)"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                keyboardType="phone-pad"
                autoCapitalize="none"
                left={<TextInput.Icon icon="phone" />}
                disabled={isLoading}
              />
              <HelperText type="info">
                Include country code (e.g., +1 for US, +91 for India)
              </HelperText>
            </>
          ) : (
            <TextInput
              label="6-Digit Code"
              value={otp}
              onChangeText={setOtp}
              mode="outlined"
              keyboardType="number-pad"
              maxLength={6}
              left={<TextInput.Icon icon="lock" />}
              autoFocus
              disabled={isLoading}
            />
          )}

          <Button
            mode="contained"
            onPress={step === "phone" ? handleSendOtp : handleVerifyOtp}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={{ height: 48 }}
          >
            {step === "phone" ? "Send Code" : "Verify & Login"}
          </Button>

          {step === "otp" && (
            <Button
              mode="text"
              onPress={() => setStep("phone")}
              style={{ marginTop: 16 }}
            >
              Change Phone Number
            </Button>
          )}

          <View style={styles.divider}>
            <Text style={{ color: theme.colors.outline }}>
              Or continue with
            </Text>
          </View>

          <Button
            mode="outlined"
            onPress={() => router.push("/(auth)/login")} // Legacy/Email Login
            style={styles.secondaryButton}
            icon="email"
          >
            Email Address
          </Button>
        </View>
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
    padding: 24,
    justifyContent: "center",
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
  },
  divider: {
    alignItems: "center",
    marginVertical: 24,
  },
  secondaryButton: {
    borderColor: "#E0E0E0",
  },
});
