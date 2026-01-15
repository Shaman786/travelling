import { Stack } from "expo-router";
import React from "react";
import ServiceMarketplace from "../../src/components/consult/ServiceMarketplace";

export default function MoreScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ServiceMarketplace />
    </>
  );
}
