import React from "react";
import { Image, Linking, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
// @ts-ignore
import whatsappIcon from "../../assets/WhatsApp-Brand-Resource-Center/01_Glyph/01_Digital/03_PNG/White/Digital_Glyph_White.png";

const WhatsAppButton = () => {
  const theme = useTheme();

  const handlePress = () => {
    // Replace with the actual phone number
    const phoneNumber = "1234567890";
    const message = "Hello, I would like to inquire about a travel package.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;

    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: "#25D366" }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image source={whatsappIcon} style={styles.icon} contentFit="contain" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90, // Adjusted to be above standard bottom tabs/FABs
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 9999,
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
  },
});

export default WhatsAppButton;
