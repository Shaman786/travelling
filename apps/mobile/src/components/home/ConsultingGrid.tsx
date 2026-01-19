import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiPressable } from "moti/interactions";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { shadows } from "../../theme";

// Grid items with vector icons
const GRID_ITEMS = [
  {
    id: "plan",
    label: "Plan Trip",
    icon: "airplane",
    gradient: ["#0047AB", "#4180DB"], // Blue Theme
    route: "/consult/plan-trip",
  },
  {
    id: "expert",
    label: "Expert",
    icon: "headset",
    gradient: ["#002F75", "#0047AB"], // Darker Blue
    route: "/consult/expert",
  },
  {
    id: "visa",
    label: "Visa",
    icon: "file-document-outline",
    gradient: ["#FF6B00", "#FF9E4D"], // Orange Accent
    route: "/consult/visa",
  },
  {
    id: "stays",
    label: "Stays",
    icon: "bed",
    gradient: ["#101820", "#4B5563"], // Black/Grey
    route: "/consult/stays",
  },
  {
    id: "flights",
    label: "Flights",
    icon: "airplane-takeoff",
    gradient: ["#0047AB", "#4180DB"], // Blue Theme
    route: "/consult/flights",
  },
  {
    id: "group",
    label: "Groups",
    icon: "account-group",
    gradient: ["#002F75", "#0047AB"], // Darker Blue
    route: "/consult/group",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: "shield-check",
    gradient: ["#FF6B00", "#FF9E4D"], // Orange Accent
    route: "/consult/insurance",
  },
  {
    id: "more",
    label: "More",
    icon: "dots-horizontal",
    gradient: ["#101820", "#4B5563"], // Black/Grey
    route: "/consult/more",
  },
];

// Grid item component with Moti animations
function GridItem({
  item,
  onPress,
  labelColor,
}: {
  item: (typeof GRID_ITEMS)[0];
  onPress: () => void;
  labelColor: string;
}) {
  const animateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.92 : 1,
          opacity: pressed ? 0.85 : 1,
        };
      },
    [],
  );

  return (
    <MotiPressable
      style={styles.item}
      onPress={onPress}
      animate={animateState}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 400,
      }}
    >
      <View style={styles.shadowContainer}>
        <LinearGradient
          colors={item.gradient as [string, string]}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={28}
            color="#fff"
          />
        </LinearGradient>
      </View>
      <Text
        style={[styles.label, { color: labelColor }]}
        numberOfLines={2}
        variant="labelSmall"
      >
        {item.label}
      </Text>
    </MotiPressable>
  );
}

export default function ConsultingGrid() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {GRID_ITEMS.map((item) => (
          <GridItem
            key={item.id}
            item={item}
            onPress={() => router.push(item.route as any)}
            labelColor={theme.colors.onSurface}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  item: {
    width: 72,
    alignItems: "center",
  },
  shadowContainer: {
    ...shadows.sm,
    borderRadius: 24,
    marginBottom: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30, // Perfectly round
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 11,
    lineHeight: 14,
  },
});
