import { Redirect, Slot } from "expo-router";
import { useStore } from "../../src/store/useStore";

export default function AuthLayout() {
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Slot />;
}
