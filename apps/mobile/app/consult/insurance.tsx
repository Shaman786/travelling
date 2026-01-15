import { Stack } from "expo-router";
import React from "react";
import InsuranceCalc from "../../src/components/consult/InsuranceCalc";

export default function InsuranceScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <InsuranceCalc />
    </>
  );
}
