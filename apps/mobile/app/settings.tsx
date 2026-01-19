import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useStore } from "../src/store/useStore";

import { useTheme } from "react-native-paper";

const SettingItem = ({
  icon,
  label,
  value,
  onPress,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  theme,
}: any) => (
  <Pressable
    style={({ pressed }) => [
      styles.item,
      {
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.dark
          ? "rgba(255,255,255,0.05)"
          : "rgba(0,0,0,0.05)",
      },
      pressed && { backgroundColor: theme.colors.elevation.level2 }, // Use elevation or opacity
    ]}
    onPress={isSwitch ? undefined : onPress}
  >
    <View style={styles.itemLeft}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: theme.colors.secondaryContainer },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={theme.colors.onSecondaryContainer}
        />
      </View>
      <Text style={[styles.itemLabel, { color: theme.colors.onSurface }]}>
        {label}
      </Text>
    </View>

    <View style={styles.itemRight}>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{
            false: theme.colors.surfaceVariant,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.onPrimary}
        />
      ) : (
        <>
          {value && (
            <Text style={[styles.itemValue, { color: theme.colors.outline }]}>
              {value}
            </Text>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.colors.outline}
          />
        </>
      )}
    </View>
  </Pressable>
);

// ...

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const logout = useStore((state) => state.logout);
  const preferences = useStore((state) => state.preferences);
  const updatePreferences = useStore((state) => state.updatePreferences);

  // Local state not needed, use store directly
  const notificationsEnabled = preferences?.notifications ?? true;
  const darkModeEnabled = preferences?.darkMode ?? false;

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const toggleNotifications = (val: boolean) => {
    updatePreferences({ notifications: val });
  };

  const toggleDarkMode = (val: boolean) => {
    updatePreferences({ darkMode: val });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.onBackground },
          headerTintColor: theme.colors.primary,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionHeader, { color: theme.colors.secondary }]}>
          Preferences
        </Text>
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <SettingItem
            icon="bell-outline"
            label="Push Notifications"
            isSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={toggleNotifications}
            theme={theme}
          />
          <SettingItem
            icon="theme-light-dark"
            label="Dark Mode"
            isSwitch
            switchValue={darkModeEnabled}
            onSwitchChange={toggleDarkMode}
            theme={theme}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.secondary }]}>
          Account
        </Text>
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <SettingItem
            icon="account-outline"
            label="Edit Profile"
            onPress={() => router.push("/profile/edit" as any)}
            theme={theme}
          />
          <SettingItem
            icon="lock-outline"
            label="Change Password"
            onPress={() => router.push("/profile/change-password" as any)}
            theme={theme}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.secondary }]}>
          Support
        </Text>
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <SettingItem
            icon="help-circle-outline"
            label="Help Center / FAQ"
            onPress={() => router.push("/support/faq" as any)}
            theme={theme}
          />
          <SettingItem
            icon="file-document-outline"
            label="Terms of Service"
            onPress={() => router.push("/(legal)/terms" as any)}
            theme={theme}
          />
          <SettingItem
            icon="shield-check-outline"
            label="Privacy Policy"
            onPress={() => router.push("/(legal)/privacy" as any)}
            theme={theme}
          />
        </View>

        <Pressable
          style={[
            styles.logoutButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>
            Log Out
          </Text>
        </Pressable>

        <Text style={[styles.versionText, { color: theme.colors.outline }]}>
          Version 1.2.5
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)", // Use subtle transparency for border
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemValue: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    marginTop: 24,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontWeight: "600",
    fontSize: 16,
  },
  versionText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
  },
});
