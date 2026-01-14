import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import ConsultationForm from "../../src/components/consult/ConsultationForm";

export default function StaysScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Curated Stays" }} />
      <ConsultationForm
        type="stays"
        title="Find Unique Stays"
        subtitle="From luxury villas to boutique hotels."
        showDestination={true}
        showDates={true}
        showTravelers={true}
        showBudget={true}
        placeholderNotes="Preferences? (e.g. Pool, Beachfront, City Center)"
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
