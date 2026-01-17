import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useMemo, useState } from "react";
import { ImageBackground, Linking, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { remoteConfig } from "../../services/RemoteConfigService";
import { shadows } from "../../theme";
import { BannerConfig } from "../../types/banner";

const PromotionalBanner = () => {
  const theme = useTheme();
  const router = useRouter();
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const config = await remoteConfig.getFeaturedBanner();
        setBanner(config);
      } catch (error) {
        console.error("Failed to fetch banner config", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  const animateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.98 : 1,
          opacity: pressed ? 0.9 : 1,
        };
      },
    [],
  );

  if (loading || !banner) {
    return null; // Or a skeleton loader
  }

  const { content, action } = banner;

  const handlePress = () => {
    if (!action) return;

    if (action.type === "navigate") {
      router.push(action.value as any);
    } else if (action.type === "link") {
      Linking.openURL(action.value);
    }
  };

  const renderContent = () => {
    if (banner.type === "lottie" && content.lottieSource) {
      return (
        <View style={[styles.container, styles.lottieContainer]}>
          <LottieView
            source={content.lottieSource}
            autoPlay
            loop
            style={styles.lottie}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <Text variant="headlineSmall" style={styles.title}>
                {content.title}
              </Text>
              {content.subtitle && (
                <Text variant="bodyMedium" style={styles.subtitle}>
                  {content.subtitle}
                </Text>
              )}
              <Button
                mode="contained"
                onPress={handlePress}
                style={styles.button}
                buttonColor={theme.colors.primary}
              >
                Check it out
              </Button>
            </View>
          </LinearGradient>
        </View>
      );
    }

    // Default to Image/Gradient
    return (
      <View style={styles.container}>
        <ImageBackground
          source={{ uri: content.imageUrl }}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: 16 }}
        >
          <LinearGradient
            colors={
              content.gradientColors || ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]
            }
            style={styles.gradient}
          >
            <View style={styles.content}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Featured</Text>
              </View>
              <Text variant="headlineSmall" style={styles.title}>
                {content.title}
              </Text>
              {content.subtitle && (
                <Text variant="bodyMedium" style={styles.subtitle}>
                  {content.subtitle}
                </Text>
              )}
              <Button
                mode="contained"
                onPress={handlePress}
                style={styles.button}
                buttonColor={theme.colors.primary}
              >
                Book Now
              </Button>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  };

  return (
    <MotiPressable
      onPress={handlePress}
      animate={animateState}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
      }}
    >
      {renderContent()}
    </MotiPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
    height: 200,
    ...shadows.md,
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  lottieContainer: {
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 20, // Override paddingHorizontal from container
    paddingHorizontal: 0,
    width: "auto",
  },
  lottie: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: "flex-end",
  },
  content: {
    alignItems: "flex-start",
  },
  badge: {
    backgroundColor: "#FF4757",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  title: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
  },
  button: {
    borderRadius: 8,
  },
});

export default PromotionalBanner;
