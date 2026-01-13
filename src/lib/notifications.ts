import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { authService } from "./authService";

/**
 * Configure how notifications behave when the app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for Push Notifications and return the token
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  // Check if running in Expo Go
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    console.log("Push notifications are not supported in Expo Go");
    return;
  }

  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e: any) {
      if (
        e.message?.includes("FirebaseApp is not initialized") ||
        e.message?.includes("Default FirebaseApp is not initialized")
      ) {
        console.warn(
          "Push Notifications skipped: Missing google-services.json configuration."
        );
      } else {
        // Log push token error in development only
        if (__DEV__) console.log("Error getting push token:", e);
      }
    }
  } else {
    // Must use physical device for Push Notifications
  }

  return token;
}

// ... (previous content)
export async function savePushToken(
  token: string,
  userId: string
): Promise<void> {
  if (!token || !userId) return;

  try {
    // Assuming we have a 'pushToken' field in the user document
    await authService.updateProfile(userId, { pushToken: token } as any);
  } catch {
    // Failed to save push token
  }
}

/**
 * Trigger a local notification immediately
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // null means show immediately
  });
}
