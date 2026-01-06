import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useStore } from "../src/store/useStore";
import { theme } from "../src/theme";

function AuthHandler() {
  const segments = useSegments();
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    // Slight delay to ensure navigation is ready
    const timer = setTimeout(() => {
      if (!isLoggedIn && !inAuthGroup) {
        router.replace("/(auth)/login");
      } else if (isLoggedIn && inAuthGroup) {
        router.replace("/(tabs)");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoggedIn, segments, navigationState?.key]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthHandler />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="details/[id]" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
