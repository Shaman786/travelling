import { Redirect, useRootNavigationState } from "expo-router";
import { Image, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useStore } from "../src/store/useStore";
import { theme } from "../src/theme";

export default function Index() {
  const rootNavigationState = useRootNavigationState();
  const user = useStore.getState().user;
  const isLoggedIn = useStore.getState().isLoggedIn;

  // Wait for navigation and hydration
  if (!rootNavigationState?.key) {
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
          source={require("../assets/images/react-logo.png")} // Fallback if icon unavailable, typically assets/images/icon.png
          style={{ width: 100, height: 100, marginBottom: 20 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isLoggedIn && user) {
    return <Redirect href={"/(tabs)" as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}
