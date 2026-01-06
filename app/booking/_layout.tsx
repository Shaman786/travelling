/**
 * Booking Wizard Layout
 *
 * Handles the multi-step booking flow.
 */

import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function BookingLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="[packageId]/dates"
        options={{
          title: "Select Dates",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="[packageId]/travelers"
        options={{
          title: "Travelers",
          headerBackTitle: "Dates",
        }}
      />
      <Stack.Screen
        name="[packageId]/details"
        options={{
          title: "Traveler Details",
          headerBackTitle: "Travelers",
        }}
      />
      <Stack.Screen
        name="[packageId]/review"
        options={{
          title: "Review & Pay",
          headerBackTitle: "Details",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Booking Details",
        }}
      />
    </Stack>
  );
}
