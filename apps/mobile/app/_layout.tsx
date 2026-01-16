import * as Notifications from "expo-notifications";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useRef } from "react";
import "react-native-get-random-values";
import { PaperProvider } from "react-native-paper";
import {
  SafeAreaProvider,
  enableEdgeToEdge,
} from "react-native-safe-area-context";
import ToastManager from "toastify-react-native";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import OfflineNotice from "../src/components/OfflineNotice";
import WhatsAppButton from "../src/components/WhatsAppButton";
import { useAuth } from "../src/hooks/useAuth";
import { usePushToken } from "../src/hooks/usePushToken";
import "../src/i18n"; // Init i18n
import { theme } from "../src/theme";

function AuthHandler() {
  const segments = useSegments();
  const router = useRouter();
  // Use useAuth instead of reading directly from store
  // This ensures checkSession() runs and verifies with backend
  const { isLoggedIn, isLoading, user } = useAuth();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    // IMPORTANT: Wait until auth check is complete before redirecting
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      // Not logged in -> go to login
      router.replace("/(auth)/login" as any);
    } else if (isLoggedIn && user) {
      // Logged in
      if (!user.onboardingComplete) {
        // Not onboarded -> go to onboarding
        if (segments[1] !== "onboarding") {
          router.replace("/(auth)/onboarding" as any);
        }
      } else if (inAuthGroup) {
        // Onboarded but in auth group -> go to home
        router.replace("/(tabs)" as any);
      }
    }
  }, [isLoggedIn, isLoading, user, segments, navigationState?.key, router]);

  return null;
}

function PushTokenHandler() {
  usePushToken();
  return null;
}

// Enable Edge-to-Edge globally
enableEdgeToEdge();

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const segments = useSegments(); // Get current segments

  useEffect(() => {
    // Register for push notifications
    // registerForPushNotificationsAsync().then((token) => {
    //   if (token) console.log("Push Token:", token);
    // });

    // Set System UI Background Color (Runtime)
    SystemUI.setBackgroundColorAsync("#F5F7FA");

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        // Could show in-app notification banner here
        console.log("Notification received:", notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const hideWhatsApp = segments[0] === "(auth)";

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="dark" />
        <PaperProvider theme={theme}>
          <OfflineNotice />
          {!hideWhatsApp && <WhatsAppButton />}
          <AuthHandler />
          <PushTokenHandler />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="details/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="consult" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="support" options={{ headerShown: false }} />
            <Stack.Screen
              name="search/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="booking" options={{ headerShown: false }} />
            <Stack.Screen />
            <Stack.Screen
              name="favorites/index"
              options={{ headerShown: false }}
            />
          </Stack>
          <ToastManager />
        </PaperProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
