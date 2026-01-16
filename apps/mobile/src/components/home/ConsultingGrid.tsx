import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";
import { borderRadius } from "../../theme";

const GRID_ITEMS = [
  {
    id: "plan",
    label: "Plan Trip",
    icon: "map-outline",
    color: "#FF6B6B",
    route: "/consult/plan-trip",
  },
  {
    id: "expert",
    label: "Talk to Expert",
    icon: "headset",
    color: "#4ECDC4",
    route: "/consult/expert",
  },
  {
    id: "visa",
    label: "Visa Help",
    icon: "card-account-details-outline",
    color: "#45B7D1",
    route: "/consult/visa",
  },
  {
    id: "stays",
    label: "Curated Stays",
    icon: "bed-outline",
    color: "#96CEB4",
    route: "/consult/stays",
  },
  {
    id: "flights",
    label: "Flight Deals",
    icon: "airplane",
    color: "#FFEEAD",
    route: "/consult/flights",
  },
  {
    id: "group",
    label: "Group Tours",
    icon: "account-group-outline",
    color: "#D4A5A5",
    route: "/consult/group",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: "shield-check-outline",
    color: "#9B59B6",
    route: "/consult/insurance",
  },
  {
    id: "more",
    label: "More",
    icon: "dots-horizontal",
    color: "#95A5A6",
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
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.color + "20" },
            ]}
          >
            <Avatar.Icon
              size={40}
              icon={item.icon}
              color={item.color}
              style={{ backgroundColor: "transparent" }}
            />
          </View>
          <Text
            variant="labelSmall"
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
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  item: {
    width: "25%", // 4 items per row
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 11,
  },
});
