import { Stack } from "expo-router";
import React from "react";
import GroupPlanner from "../../src/components/consult/GroupPlanner";

export default function GroupToursScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GroupPlanner />
    </>
  );
}
