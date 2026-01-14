import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import ConsultationForm from "../../src/components/consult/ConsultationForm";

export default function InsuranceScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Travel Insurance" }} />
      <ConsultationForm
        type="insurance"
        title="Protect Your Trip"
        subtitle="Comprehensive coverage for medical, cancellation, and baggage."
        showDestination={true}
        showDates={true}
        showTravelers={true}
        placeholderNotes="Age of travelers? Any pre-existing conditions?"
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
