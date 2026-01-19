/**
 * 5-Tab Navigation Layout
 *
 * Home | Chat | Schedule | Saved | Profile
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Micro-component for Animated Tab Icon
const TabIcon = ({
  focused,
  name,
  color,
}: {
  focused: boolean;
  name: any;
  color: string;
}) => {
  return (
    <MotiView
      animate={{
        scale: focused ? 1.2 : 1,
        translateY: focused ? -2 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 15,
      }}
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialCommunityIcons name={name} size={26} color={color} />
      {focused && (
        <MotiView
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "absolute",
            bottom: -8,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
          }}
        />
      )}
    </MotiView>
  );
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? insets.bottom + 10 : 20,
          left: 20,
          right: 20,
          borderRadius: 32,
          height: 64,
          backgroundColor: theme.dark
            ? "rgba(30,30,30,0.8)" // Fallback for android if glass fails or needs bg
            : "rgba(255,255,255,0.8)",
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 5 },
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          height: 64,
          padding: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              name={focused ? "chat" : "chat-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mytrips"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              name={focused ? "calendar-check" : "calendar-check-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              name={focused ? "heart" : "heart-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              name={focused ? "account-circle" : "account-circle-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
