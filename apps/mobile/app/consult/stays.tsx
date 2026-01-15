import { Stack } from "expo-router";
import React from "react";
import VibeFinder from "../../src/components/consult/VibeFinder";

export default function StaysScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <VibeFinder />
    </>
  );
}
