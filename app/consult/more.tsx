import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import ConsultationForm from "../../src/components/consult/ConsultationForm";

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Other Services" }} />
      <ConsultationForm
        type="other"
        title="Other Services"
        subtitle="Forex, SIM Cards, Airport Transfers, and more."
        showDestination={true}
        placeholderNotes="What do you need help with?"
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
