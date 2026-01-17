import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useNavigationMode } from "react-native-navigation-mode";
import { useTheme } from "react-native-paper";

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
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + navBarPadding,
          paddingBottom: 8 + navBarPadding,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mytrips"
        options={{
          title: "My Trips",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="ticket-confirmation"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
