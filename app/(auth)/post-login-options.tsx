/**
 * Post Login Options
 *
 * Interstitial screen to guide users after successful phone login.
 * Options:
 * 1. Plan a Trip (Wizard)
 * 2. Explore (Home)
 * 3. Complete Profile (Edit Profile)
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PostLoginOptionsScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="check-circle"
            size={64}
            color={theme.colors.primary}
          />
          <Text variant="headlineMedium" style={styles.title}>
            You&apos;re Signed In!
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            What would you like to do next?
          </Text>
        </View>

        <View style={styles.options}>
          {/* Option 1: Start Booking Wizard */}
          <Card
            style={styles.card}
            onPress={() => router.replace("/(tabs)/")} // TODO: Link to actual Wizard whenever implemented. For now Home -> "Plan Trip" btn
            mode="elevated"
          >
            <Card.Content style={styles.cardContent}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name="airplane-takeoff"
                  size={32}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.textContent}>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                  Plan a Trip Now
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.outline }}
                >
                  Start our smart booking wizard.
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.outline}
              />
            </Card.Content>
          </Card>

          {/* Option 2: Complete Profile */}
          <Card
            style={styles.card}
            onPress={() => router.push("/profile/edit")}
            mode="outlined"
          >
            <Card.Content style={styles.cardContent}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-edit"
                  size={32}
                  color={theme.colors.secondary}
                />
              </View>
              <View style={styles.textContent}>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                  Complete Profile
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.outline }}
                >
                  Add your name and details.
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.outline}
              />
            </Card.Content>
          </Card>

          {/* Option 3: Explore */}
          <Button
            mode="text"
            onPress={() => router.replace("/(tabs)/")}
            style={{ marginTop: 24 }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Skip to Home
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  options: {
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
});
