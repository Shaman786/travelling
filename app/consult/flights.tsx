import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import ConsultationForm from "../../src/components/consult/ConsultationForm";

export default function FlightsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Flight Deals" }} />
      <ConsultationForm
        type="flights"
        title="Best Flight Deals"
        subtitle="Let us find the cheapest and fastest connections for you."
        showDestination={true}
        showDates={true}
        showTravelers={true}
        placeholderNotes="Preferred Airlines? Specific timing?"
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
