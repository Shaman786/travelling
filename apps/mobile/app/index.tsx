import { Redirect, useRootNavigationState } from "expo-router";
import { Image, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "../src/hooks/useAuth";
import { theme } from "../src/theme";

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const { isLoggedIn, isLoading, user } = useAuth();

  // Wait for navigation and auth check
  if (!rootNavigationState?.key || isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <Image
          source={require("../assets/images/react-logo.png")}
          style={{ width: 100, height: 100, marginBottom: 20 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (isLoggedIn && user) {
    if (!user.onboardingComplete) {
      return <Redirect href="/(auth)/onboarding" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
