import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import ConsultationForm from "../../src/components/consult/ConsultationForm";

export default function VisaScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Visa Assistance" }} />
      <ConsultationForm
        type="visa"
        title="Visa Services"
        subtitle="Hassle-free visa processing for any country."
        showDestination={true}
        showTravelers={true}
        placeholderNotes="Please specify your citizenship and any previous visa rejections."
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
