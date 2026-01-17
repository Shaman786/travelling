import * as Notifications from "expo-notifications";
import { Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useRef } from "react";
import "react-native-get-random-values";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ToastManager from "toastify-react-native";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import OfflineNotice from "../src/components/OfflineNotice";
import WhatsAppButton from "../src/components/WhatsAppButton";
import { usePushToken } from "../src/hooks/usePushToken";
import "../src/i18n"; // Init i18n
import { theme } from "../src/theme";

// Auth redirects are handled declaratively in app/index.tsx using <Redirect>

function PushTokenHandler() {
  usePushToken();
  return null;
}

// Enable Edge-to-Edge globally

// Edge-to-Edge is enabled via app.config.ts (android.edgeToEdgeEnabled: true)
// and handled by expo-router / react-native-safe-area-context automatically.

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
