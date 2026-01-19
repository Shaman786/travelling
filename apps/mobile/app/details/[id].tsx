import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Print from "expo-print";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  Divider,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import Animated from "react-native-reanimated";
import { Toast } from "toastify-react-native";
import { usePackage } from "../../src/hooks/usePackages";
import { reviewService } from "../../src/lib/databaseService"; // Added bookingService
import { useStore } from "../../src/store/useStore";
import { borderRadius, shadows } from "../../src/theme";
import { Review } from "../../src/types";

// Define outside component
const AnimatedImage = Animated.createAnimatedComponent(Image) as any;

export default function PackageDetailsScreen() {
  const { id, startDate, endDate, adults, children, infants } =
    useLocalSearchParams<{
      id: string;
      startDate?: string;
      endDate?: string;
      adults?: string;
      children?: string;
      infants?: string;
    }>();
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    // Fake social proof: Random viewers between 12 and 35
    setViewers(Math.floor(Math.random() * (35 - 12 + 1)) + 12);
  }, []);
  // isBooking and payment hooks removed as they are handled in wizard

  // Fetch reviews when package loads
  useEffect(() => {
    if (id && typeof id === "string") {
      fetchReviews(id);
    }
  }, [id]);

  const fetchReviews = async (packageId: string) => {
    const result = await reviewService.getPackageReviews(packageId);
    setReviews(result);
  };

  // Use the usePackage hook to fetch from Appwrite
  const {
    package: pkg,
    isLoading,
    error,
  } = usePackage(typeof id === "string" ? id : "");

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !pkg) {
    return (
      <View style={styles.center}>
        <Text>Package not found</Text>
      </View>
    );
  }

  const handleBookTrip = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }

    // Initialize draft with package info
    useStore.getState().updateBookingDraft({
      packageId: pkg.$id,
      packageTitle: pkg.title,
      destination: pkg.country || pkg.destination,
      packagePrice: pkg.price,
      // Default dates if not set
      departureDate: startDate ? new Date(startDate) : new Date(),
      returnDate: endDate
        ? new Date(endDate)
        : new Date(Date.now() + (parseInt(pkg.duration) || 7) * 86400000),
      currentStep: 0,

      // Use search params or defaults
      travelers: [], // Will be generated in travelers step or we could pre-gen placeholders here
      adultsCount: adults ? parseInt(adults) : 1,
      childrenCount: children ? parseInt(children) : 0,
      infantsCount: infants ? parseInt(infants) : 0,
    });

    router.push(`/booking/${pkg.$id}/dates` as any);
  };

  const generatePDF = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; color: #0056D2; margin-bottom: 10px; }
              .price { font-size: 20px; color: #FFC107; font-weight: bold; }
              .image { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .timeline-item { margin-bottom: 15px; }
              .day { font-weight: bold; color: #0056D2; }
              .desc { color: #666; font-size: 14px; margin-top: 5px; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${pkg.title}</div>
              <div class="price">$${pkg.price}</div>
            </div>
            
            <img src="${pkg.imageUrl}" class="image" />
            
            <div class="section-title">Overview</div>
            <p>${pkg.description}</p>
            
            <div class="section-title">Itinerary</div>
            ${pkg.itinerary
              .map(
                (day) => `
              <div class="timeline-item">
                <div class="day">Day ${day.day}: ${day.title}</div>
                <div class="desc">${day.description}</div>
              </div>
            `,
              )
              .join("")}
            
            <div class="footer">
              Generated by Host-Palace
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      Toast.error("Failed to generate PDF");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerTintColor: "#fff", // Keep white for hero image overlay
          headerRight: () => (
            <MaterialCommunityIcons
              name="file-download-outline"
              size={24}
              color="#fff"
              style={{ marginRight: 16 }}
              onPress={generatePDF}
            />
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Same Hero Container Code... adjusted slightly for header */}
        <View style={styles.heroContainer}>
          <AnimatedImage
            source={{ uri: pkg.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            sharedTransitionTag={`image-${pkg.$id}`}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.8)"]}
            style={styles.heroGradient}
          />

          <View style={styles.titleContainer}>
            <Chip style={styles.regionChip} textStyle={{ color: "#fff" }}>
              {pkg.country}
            </Chip>
            <Text variant="headlineMedium" style={styles.heroTitle}>
              {pkg.title}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.contentContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Trust & Urgency Banner */}
          <Surface
            style={[
              styles.trustBanner,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
            elevation={0}
          >
            <View style={styles.trustHeader}>
              <View
                style={[
                  styles.viewersBadge,
                  { backgroundColor: theme.colors.errorContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name="eye"
                  size={14}
                  color={theme.colors.error}
                />
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.error,
                    fontWeight: "bold",
                    marginLeft: 4,
                  }}
                >
                  {viewers} viewing now
                </Text>
              </View>
              <View
                style={[styles.viewersBadge, { backgroundColor: "#FFF8E1" }]}
              >
                <MaterialCommunityIcons name="fire" size={14} color="#FF9800" />
                <Text
                  variant="labelSmall"
                  style={{
                    color: "#E65100",
                    fontWeight: "bold",
                    marginLeft: 4,
                  }}
                >
                  Popular choice!
                </Text>
              </View>
            </View>

            <View style={styles.trustBadgesRow}>
              <View style={styles.badge}>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.primary,
                    fontWeight: "bold",
                    marginLeft: 6,
                  }}
                >
                  Free Cancellation
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.colors.secondaryContainer,
                    borderColor: theme.colors.secondaryContainer,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color={theme.colors.secondary}
                />
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.secondary,
                    fontWeight: "bold",
                    marginLeft: 6,
                  }}
                >
                  Best Price Guaranteed
                </Text>
              </View>
            </View>
          </Surface>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="labelMedium">{pkg.duration}</Text>
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
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Overview
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.description,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {pkg.description}
          </Text>

          {/* Inclusions */}
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            What&apos;s Included
          </Text>
          <View style={styles.inclusionsGrid}>
            {pkg.inclusions.map((item, index) => (
              <View key={index} style={styles.inclusionItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={theme.colors.tertiary}
                />
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.inclusionText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {/* Gallery Section */}
          {pkg.images && pkg.images.length > 0 && (
            <>
              <Text
                variant="titleLarge"
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                ]}
              >
                Gallery
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryContainer}
              >
                {pkg.images.map((img, index) => (
                  <View key={index} style={styles.galleryItem}>
                    <Image
                      source={{ uri: img }}
                      style={styles.galleryImage}
                      contentFit="cover"
                    />
                  </View>
                ))}
              </ScrollView>
              <Divider style={styles.divider} />
            </>
          )}

          {/* Itinerary Timeline */}
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
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
                <Surface
                  style={[
                    styles.timelineCard,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  elevation={1}
                >
                  {day.image && (
                    <View style={styles.dayImageContainer}>
                      <Image
                        source={{ uri: day.image }}
                        style={styles.dayImage}
                        contentFit="cover"
                      />
                    </View>
                  )}
                  <Text
                    variant="titleMedium"
                    style={[styles.dayTitle, { color: theme.colors.onSurface }]}
                  >
                    {day.title}
                  </Text>
                  <Text
                    variant="bodySmall"
                    numberOfLines={3}
                    style={[
                      styles.dayDesc,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {day.description}
                  </Text>
                </Surface>
              </View>
            ))}
          </View>

          {/* Reviews Section */}
          <Divider style={styles.divider} />
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Reviews
          </Text>
          {reviews.length === 0 ? (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.outline, fontStyle: "italic" }}
            >
              No reviews yet. Be the first to review!
            </Text>
          ) : (
            reviews.map((review) => (
              <Surface
                key={review.$id}
                style={[
                  styles.reviewCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                elevation={1}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  {review.userAvatar ? (
                    <Image
                      source={{ uri: review.userAvatar }}
                      style={{ width: 32, height: 32, borderRadius: 16 }} // Keep Avatar circle
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={32}
                      color={theme.colors.secondary}
                    />
                  )}
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
                      {review.userName}
                    </Text>
                    <View style={{ flexDirection: "row" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <MaterialCommunityIcons
                          key={star}
                          name={star <= review.rating ? "star" : "star-outline"}
                          size={14}
                          color="#FFC107"
                        />
                      ))}
                    </View>
                  </View>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.outline }}
                  >
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text variant="bodyMedium">{review.comment}</Text>
              </Surface>
            ))
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <Surface
        style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]}
        elevation={4}
      >
        <View>
          <Text variant="labelMedium" style={{ color: theme.colors.outline }}>
            Total Price
          </Text>
          <View style={styles.priceRow}>
            <Text
              variant="headlineSmall"
              style={[styles.price, { color: theme.colors.primary }]}
            >
              ${pkg.price}
            </Text>
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {" "}
              / person
            </Text>
          </View>
        </View>
        <Button
          mode="contained"
          onPress={handleBookTrip}
          icon="check-circle"
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
    // backgroundColor: "#F5F7FA", handled dynamically
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl, // Updated to xl
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
    // color: "#1A1A2E", handled dynamically
  },
  description: {
    // color: "#666", handled dynamically
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
    borderRadius: borderRadius.md,
    // backgroundColor: "#fff", handled dynamically
    marginBottom: 16,
    ...shadows.sm,
  },
  dayTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    // color handled dynamically
  },
  dayDesc: {
    // color: "#666",
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
    // backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 30, // Safe area
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    ...shadows.lg,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    color: "#0056D2", // Maybe should be primary?
    fontWeight: "bold",
  },
  bookButton: {
    borderRadius: borderRadius.md,
    paddingHorizontal: 8,
  },
  reviewCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: borderRadius.md,
    // backgroundColor: "#fff",
    ...shadows.sm,
  },
  galleryContainer: {
    gap: 12,
    paddingRight: 24,
    marginBottom: 24,
  },
  galleryItem: {
    width: 200,
    height: 140,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  dayImageContainer: {
    width: "100%",
    height: 120,
    marginBottom: 12,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
  },
  dayImage: {
    width: "100%",
    height: "100%",
  },
  trustBanner: {
    marginBottom: 24,
    // backgroundColor: "#fff", handled dynamically
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    // borderColor: "#f0f0f0", handled dynamically
    ...shadows.sm,
  },
  trustHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewersBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trustBadgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0Fdf4", // Light green
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
});
