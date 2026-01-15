import { Stack } from "expo-router";
import React from "react";
import ConciergeConnect from "../../src/components/consult/ConciergeConnect";

export default function ExpertScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ConciergeConnect />
    </>
  );
}
