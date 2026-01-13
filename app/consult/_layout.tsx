import { Stack } from "expo-router";

export default function ConsultLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="plan-trip" />
      <Stack.Screen name="expert" />
      <Stack.Screen name="visa" />
      <Stack.Screen name="stays" />
      <Stack.Screen name="flights" />
      <Stack.Screen name="group" />
      <Stack.Screen name="insurance" />
      <Stack.Screen name="more" />
    </Stack>
  );
}
