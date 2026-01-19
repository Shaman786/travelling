import { useEffect } from "react";
import {
  registerAppwritePushTarget,
  registerForPushNotificationsAsync,
  savePushToken,
} from "../lib/notifications";
import { useStore } from "../store/useStore";

export function usePushToken() {
  const user = useStore((state) => state.user);

  useEffect(() => {
    async function register() {
      if (user?.$id) {
        // 1. Try to get Expo Token (might fail if no EAS Project ID)
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await savePushToken(token, user.$id);
        }

        // 2. Always try to register FCM/Device token for Appwrite Native Push
        await registerAppwritePushTarget(user.$id);
      }
    }

    register();
  }, [user]);
}
