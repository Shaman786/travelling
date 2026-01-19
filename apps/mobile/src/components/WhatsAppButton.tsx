import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useMemo, useState } from "react";
import { Linking, Platform, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import databaseService from "../lib/databaseService";

interface WhatsAppButtonProps {
  style?: ViewStyle;
  message?: string;
}

const WhatsAppButton = ({ style, message }: WhatsAppButtonProps) => {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Calculate dynamic bottom position to clear tab bar
  // TabBar uses: Math.max(insets.bottom, 16) + 84 (height)
  // We add 16px extra spacing above that
  const tabHeight = 84;
  const tabBottom =
    Platform.OS === "ios" ? insets.bottom + 10 : Math.max(insets.bottom, 16);
  const defaultBottom = tabBottom + tabHeight + 16;

  useEffect(() => {
    const loadPhone = async () => {
      const phone =
        await databaseService.content.getConfigValue("whatsapp_phone");
      setPhoneNumber(phone || "1234567890"); // Fallback
    };
    loadPhone();
  }, []);

  const handlePress = () => {
    if (!phoneNumber) return;
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
      style={[styles.container, { bottom: defaultBottom }, style]}
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
    // bottom is dynamic now
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
