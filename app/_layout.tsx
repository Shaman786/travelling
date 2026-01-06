import { Stack } from "expo-router";
import { useEffect } from "react";
import { account } from "../src/lib/appwrite";

export default function RootLayout() {
  useEffect(() => {
    // Verify Appwrite connection by attempting to get account (will fail if not logged in, but still proves connectivity)
    const checkConnection = async () => {
      try {
        // Try to fetch session - even if it fails with 401, it means server is reachable
        await account.get();
        console.log("✅ Appwrite connected - user session found");
      } catch (error: any) {
        // 401 means server is reachable but no active session - that's OK for ping
        if (error.code === 401 || error.type === "general_unauthorized_scope") {
          console.log("✅ Appwrite connected - no active session");
        } else {
          console.error("❌ Appwrite connection failed:", error.message);
        }
      }
    };

    checkConnection();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
