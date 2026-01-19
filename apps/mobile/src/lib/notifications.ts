import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { account, ID } from "./appwrite";
import { authService } from "./authService";

// ... (previous content)

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

      if (!projectId) {
        console.log(
          "Push notifications skipped: Project ID not found (EAS init required).",
        );
        return;
      }

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
          "Push Notifications skipped: Missing google-services.json configuration.",
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

// ...

export async function savePushToken(
  token: string,
  userId: string,
): Promise<void> {
  if (!userId) return;

  try {
    // 1. Save Expo Token to User Profile
    if (token) {
      await authService.updateProfile(userId, { pushToken: token } as any);
    }
  } catch {
    // Failed to save push token
  }
}

export async function registerAppwritePushTarget(userId: string) {
  if (!userId) return;

  // 2. Register FCM Device Token with Appwrite (CRITICAL for Provider Test)
  if (Device.isDevice && Platform.OS === "android") {
    try {
      // Ensure permissions are granted before getting token?
      // Usually called after registerForPushNotificationsAsync which requests permissions.

      const deviceTokenData = await Notifications.getDevicePushTokenAsync();
      const fcmToken = deviceTokenData.data;

      // Check if target already exists? Appwrite doesn't have "getPushTarget" easily exposed on client
      // creating new one with unique ID is standard.
      // Ideally we store the targetId in local storage to avoid duplicating.

      // For now, let's try creating it. Appwrite might return 409 if duplicate ID,
      // but we don't have a stable ID for the device without storage.
      // Let's use ID.unique() for now and rely on Appwrite to handle multiple targets per user (which is allowed).

      await account.createPushTarget(
        ID.unique(), // targetId
        fcmToken, // token
        "fcm", // providerId (should match what user set up? No, this is internal 'fcm' or 'apns')
        // Actually, this should be 'fcm' for Android.
      );
      console.log("Appwrite Push Target Registered ✅");
    } catch (e: any) {
      if (
        e.code === 409 ||
        e.message?.includes("already exists") ||
        e.type === "general_argument_invalid" // sometimes Appwrite returns this for dups
      ) {
        // Target already registered, which is fine.
        console.log("Appwrite Push Target Already Registered ✅");
      } else {
        console.log("Appwrite Push Registration Info:", e.message);
      }
    }
  }
}

/**
 * Trigger a local notification immediately
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
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
