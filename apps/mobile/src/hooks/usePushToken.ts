import { useEffect } from "react";
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from "../lib/notifications";
import { useStore } from "../store/useStore";

export function usePushToken() {
  const user = useStore((state) => state.user);

  useEffect(() => {
    async function register() {
      if (user?.$id) {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await savePushToken(token, user.$id);
        }
      }
    }

    register();
  }, [user]);
}
