import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import ConsultationForm from "../../src/components/consult/ConsultationForm";

export default function ExpertScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Talk to an Expert" }} />
      <ConsultationForm
        type="expert"
        title="Expert Consultation"
        subtitle="Get advice from our seasoned travel experts via call or chat."
        placeholderNotes="What topics would you like to discuss? (e.g. Best time to visit, Safety, Budgeting)"
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
