import * as Notifications from "expo-notifications";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { useEffect, useRef } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ToastManager from "toastify-react-native";
import { useStore } from "../src/store/useStore";
import { theme } from "../src/theme";

function AuthHandler() {
  const segments = useSegments();
  const router = useRouter();
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    // Slight delay to ensure navigation is ready
    const timer = setTimeout(() => {
      const inAuthGroup = segments[0] === "(auth)";

      if (!isLoggedIn && !inAuthGroup) {
        router.replace("/(auth)/login" as any);
      } else if (isLoggedIn && inAuthGroup) {
        router.replace("/(tabs)" as any);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoggedIn, segments, navigationState?.key, router]);

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
      <PaperProvider theme={theme}>
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
