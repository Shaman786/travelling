import { Stack } from "expo-router";
import React from "react";
import VisaChecker from "../../src/components/consult/VisaChecker";

export default function VisaScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <VisaChecker />
    </>
  );
}
