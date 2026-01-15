import { Stack } from "expo-router";
import React from "react";
import TripWizard from "../../src/components/consult/TripWizard";

export default function PlanTripScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TripWizard />
    </>
  );
}
