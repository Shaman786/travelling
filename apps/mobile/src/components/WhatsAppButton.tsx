import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiPressable } from "moti/interactions";
import React, { useMemo } from "react";
import { Linking, StyleSheet, ViewStyle } from "react-native";

interface WhatsAppButtonProps {
  style?: ViewStyle;
  message?: string;
}

const WhatsAppButton = ({ style, message }: WhatsAppButtonProps) => {
  const handlePress = () => {
    // Replace with the actual phone number
    const phoneNumber = "1234567890";
    const defaultMessage =
      "Hello, I would like to inquire about a travel package.";
    const text = message || defaultMessage;

    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      text,
    )}`;

    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err),
    );
  };

  const animateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.9 : 1,
          opacity: pressed ? 0.85 : 1,
        };
      },
    [],
  );

  return (
    <MotiPressable
      style={[styles.container, style]}
      onPress={handlePress}
      animate={animateState}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 400,
      }}
    >
      <MaterialCommunityIcons name="whatsapp" size={32} color="white" />
    </MotiPressable>
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
    backgroundColor: "#25D366",
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
