import * as Notifications from "expo-notifications";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ToastManager from "toastify-react-native";
import OfflineNotice from "../src/components/OfflineNotice";
import { useAuth } from "../src/hooks/useAuth";
import "../src/i18n"; // Init i18n
import { theme } from "../src/theme";

function AuthHandler() {
  const segments = useSegments();
  const router = useRouter();
  // Use useAuth instead of reading directly from store
  // This ensures checkSession() runs and verifies with backend
  const { isLoggedIn, isLoading } = useAuth();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    // IMPORTANT: Wait until auth check is complete before redirecting
    // This prevents redirecting based on stale persisted state
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/login" as any);
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)" as any);
    }
  }, [isLoggedIn, isLoading, segments, navigationState?.key, router]);

  return null;
}

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // Example: router.push(response.notification.request.content.data.url);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <PaperProvider theme={theme}>
        <OfflineNotice />
        <AuthHandler />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="details/[id]" options={{ headerShown: false }} />
        </Stack>
        <ToastManager />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
