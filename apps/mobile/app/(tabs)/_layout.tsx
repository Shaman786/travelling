/**
 * 5-Tab Navigation Layout
 *
 * Home | Chat | Schedule | Saved | Profile
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useNavigationMode } from "react-native-navigation-mode";
import { useTheme } from "react-native-paper";
import { colors, shadows } from "../../src/theme";

export default function TabsLayout() {
  const theme = useTheme();
  const { navigationMode } = useNavigationMode();

  // Only add extra padding for 3-button navigation on Android 15+ (edge-to-edge)
  const is3ButtonNav = navigationMode?.type === "3_button";
  const isAndroid15 = Platform.OS === "android" && Platform.Version >= 35;
  const navBarPadding =
    is3ButtonNav && isAndroid15
      ? (navigationMode?.navigationBarHeight ?? 0)
      : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          height: 65 + navBarPadding,
          paddingTop: 8,
          paddingBottom: 8 + navBarPadding,
          ...shadows.md,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrapper : undefined}>
              <MaterialCommunityIcons
                name={focused ? "home" : "home-outline"}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrapper : undefined}>
              <MaterialCommunityIcons
                name={focused ? "chat" : "chat-outline"}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="mytrips"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrapper : undefined}>
              <MaterialCommunityIcons
                name={focused ? "calendar-check" : "calendar-check-outline"}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrapper : undefined}>
              <MaterialCommunityIcons
                name={focused ? "heart" : "heart-outline"}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrapper : undefined}>
              <MaterialCommunityIcons
                name={focused ? "account-circle" : "account-circle-outline"}
                size={26}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconWrapper: {
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
