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
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import OfflineNotice from "../src/components/OfflineNotice";
import { useAuth } from "../src/hooks/useAuth";
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
      router.replace("/(auth)/login" as any);
    } else if (isLoggedIn) {
      if (!user?.onboardingComplete) {
        // Redirect to onboarding if not complete and not already there
        // Assuming onboarding is at /(auth)/onboarding
        if (segments[1] !== "onboarding") {
          router.replace("/(auth)/onboarding" as any);
        }
      } else if (inAuthGroup) {
        // If logged in and onboarding complete, but in auth group, go to tabs
        router.replace("/(tabs)" as any);
      }
    }
  }, [isLoggedIn, isLoading, user, segments, navigationState?.key, router]);

  return null;
}

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener(() => {
        // Could show in-app notification banner here
      });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        // Example: router.push(response.notification.request.content.data.url);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="dark" />
        <PaperProvider theme={theme}>
          <OfflineNotice />
          <AuthHandler />
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
            <Stack.Screen name="bookings" options={{ headerShown: false }} />
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
