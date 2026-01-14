import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import ConsultationForm from "../../src/components/consult/ConsultationForm";

export default function PlanTripScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Plan Your Trip" }} />
      <ConsultationForm
        type="plan_trip"
        title="Custom Trip Planning"
        subtitle="Tell us where you want to go, and we'll craft the perfect itinerary for you."
        showDestination={true}
        showDates={true}
        showTravelers={true}
        showBudget={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
