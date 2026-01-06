import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  Divider,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { getPackageById } from "../../src/data/mockData";

const { width } = Dimensions.get("window");

export default function PackageDetailsScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();

  const pkg = getPackageById(typeof id === "string" ? id : "");

  if (!pkg) {
    return (
      <View style={styles.center}>
        <Text>Package not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: pkg.image }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.8)"]}
            style={styles.heroGradient}
          />

          {/* Back Button */}
          <View style={styles.topBar}>
            <Surface style={styles.iconButton} elevation={2}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#000"
                onPress={() => router.back()}
              />
            </Surface>
            <Surface style={styles.iconButton} elevation={2}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={24}
                color="#000"
              />
            </Surface>
          </View>

          {/* Title Overlay */}
          <View style={styles.titleContainer}>
            <Chip style={styles.regionChip} textStyle={{ color: "#fff" }}>
              {pkg.region}
            </Chip>
            <Text variant="headlineMedium" style={styles.heroTitle}>
              {pkg.title}
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="labelMedium">{pkg.duration_days} Days</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={24} color="#FFC107" />
              <Text variant="labelMedium">
                {pkg.rating} ({pkg.reviewCount})
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="weather-sunny"
                size={24}
                color={theme.colors.secondary}
              />
              <Text variant="labelMedium">Best Time</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Description */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Overview
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {pkg.description}
          </Text>

          {/* Inclusions */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            What's Included
          </Text>
          <View style={styles.inclusionsGrid}>
            {pkg.inclusions.map((item, index) => (
              <View key={index} style={styles.inclusionItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={theme.colors.success}
                />
                <Text variant="bodyMedium" style={styles.inclusionText}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {/* Itinerary Timeline */}
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Itinerary
          </Text>
          <View style={styles.timelineContainer}>
            {pkg.itinerary.map((day, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <Text
                    variant="titleMedium"
                    style={{ color: theme.colors.primary }}
                  >
                    Day {day.day}
                  </Text>
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: theme.colors.outlineVariant },
                    ]}
                  />
                </View>
                <Surface style={styles.timelineCard} elevation={1}>
                  <Text variant="titleMedium" style={styles.dayTitle}>
                    {day.title}
                  </Text>
                  <Text
                    variant="bodySmall"
                    numberOfLines={3}
                    style={styles.dayDesc}
                  >
                    {day.description}
                  </Text>
                </Surface>
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <Surface style={styles.bottomBar} elevation={4}>
        <View>
          <Text variant="labelMedium" style={{ color: theme.colors.outline }}>
            Total Price
          </Text>
          <View style={styles.priceRow}>
            <Text variant="headlineSmall" style={styles.price}>
              ${pkg.base_price}
            </Text>
            <Text variant="bodySmall"> / person</Text>
          </View>
        </View>
        <Button
          mode="contained"
          onPress={() => console.log("Chat with expert")}
          icon="chat"
          style={styles.bookButton}
          contentStyle={{ height: 50 }}
        >
          Plan My Trip
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    height: 350,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  regionChip: {
    backgroundColor: "rgba(0,0,0,0.6)",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  heroTitle: {
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: "#F5F7FA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  divider: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1A1A2E",
  },
  description: {
    color: "#666",
    marginBottom: 24,
    lineHeight: 22,
  },
  inclusionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  inclusionItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    gap: 8,
  },
  inclusionText: {
    fontSize: 13,
  },
  timelineContainer: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 16,
  },
  timelineLeft: {
    alignItems: "center",
    width: 50,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  timelineCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  dayTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  dayDesc: {
    color: "#666",
    fontSize: 13,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 30, // Safe area
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    color: "#0056D2",
    fontWeight: "bold",
  },
  bookButton: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },
});
