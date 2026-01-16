import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";
import { borderRadius, shadows } from "../../theme";

// Gradient Pairs for "3rd Effect" (Depth and Style)
const GRID_ITEMS = [
  {
    id: "plan",
    label: "Plan Trip",
    icon: "map-outline",
    gradient: ["#FF6B6B", "#EE5253"], // Soft Red -> Red
    route: "/consult/plan-trip",
  },
  {
    id: "expert",
    label: "Talk to Expert",
    icon: "headset",
    gradient: ["#4ECDC4", "#22A6B3"], // Teal -> Dark Teal
    route: "/consult/expert",
  },
  {
    id: "visa",
    label: "Visa Help",
    icon: "card-account-details-outline",
    gradient: ["#487EB0", "#273c75"], // Steel Blue -> Navy
    route: "/consult/visa",
  },
  {
    id: "stays",
    label: "Curated Stays",
    icon: "bed-outline",
    gradient: ["#1DD1A1", "#10AC84"], // Bright Green -> Forest
    route: "/consult/stays",
  },
  {
    id: "flights",
    label: "Flight Deals",
    icon: "airplane",
    // Replaced weak Yellow with Vibrant Amber/Orange for "Deals" visibility
    gradient: ["#FFC312", "#F79F1F"], // Sunflower -> Orange
    route: "/consult/flights",
  },
  {
    id: "group",
    label: "Group Tours",
    icon: "account-group-outline",
    gradient: ["#D980FA", "#9980FA"], // Lavender -> Purple
    route: "/consult/group",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: "shield-check-outline",
    gradient: ["#FDA7DF", "#D980FA"], // Pink -> Lavender
    route: "/consult/insurance",
  },
  {
    id: "more",
    label: "More",
    icon: "dots-horizontal",
    gradient: ["#dcdde1", "#7f8fa6"], // Grey gradients
    route: "/consult/more",
  },
];

export default function ConsultingGrid() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {GRID_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.item}
          onPress={() => router.push(item.route as any)}
        >
          <View style={styles.shadowContainer}>
            <LinearGradient
              colors={item.gradient as [string, string]}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Avatar.Icon
                size={32}
                icon={item.icon}
                color="#FFFFFF"
                style={{ backgroundColor: "transparent" }}
              />
            </LinearGradient>
          </View>
          <Text
            variant="labelSmall"
            numberOfLines={1}
            style={[styles.label, { color: theme.colors.onSurface }]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12, // Adjusted spacing
    marginBottom: 20,
    marginTop: 8,
  },
  item: {
    width: "25%", // 4 items per row
    alignItems: "center",
    marginBottom: 20,
  },
  shadowContainer: {
    ...shadows.sm, // Apply shadow to container for 3D lift
    borderRadius: borderRadius.xl,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: borderRadius.xl, // Squircle / Soft round
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 11,
    marginTop: 4,
  },
});
