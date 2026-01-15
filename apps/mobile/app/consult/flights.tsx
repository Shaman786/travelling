import { Stack } from "expo-router";
import React from "react";
import DealHunter from "../../src/components/consult/DealHunter";

export default function FlightsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DealHunter />
    </>
  );
}
