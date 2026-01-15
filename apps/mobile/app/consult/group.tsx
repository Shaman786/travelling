import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import ConsultationForm from "../../src/components/consult/ConsultationForm";

export default function GroupToursScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Group Tours" }} />
      <ConsultationForm
        type="group"
        title="Corporate & Group Tours"
        subtitle="Planning for a large group? We handle logistics A-Z."
        showDestination={true}
        showDates={true}
        showTravelers={true}
        showBudget={true}
        placeholderNotes="Is this a corporate retreat, family reunion, or student group?"
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
