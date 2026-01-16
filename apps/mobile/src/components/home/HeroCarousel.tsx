import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // Added useRouter import
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useBanners } from "../../hooks/useBanners";
import { shadows } from "../../theme";

const { width } = Dimensions.get("window");

const CAROUSEL_DATA = [
  {
    id: "1",
    title: "Plan Your Dream Honeymoon",
    subtitle: "Talk to an Expert Today",
    image:
      "https://images.unsplash.com/photo-1549144511-2b632d43329d?q=80&w=2070&auto=format&fit=crop",
    cta: "Plan Now",
    link: "/consult/plan-trip",
  },
  {
    id: "2",
    title: "Europe Visa in 7 Days",
    subtitle: "Guaranteed Support & Docs",
    image:
      "https://images.unsplash.com/photo-1499856839499-12fecadb64bf?q=80&w=2070&auto=format&fit=crop",
    cta: "Check Eligibility",
    link: "/consult/visa",
  },
  {
    id: "3",
    title: "Bali Like a Local",
    subtitle: "Curated Itineraries starting @ $499",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1938&auto=format&fit=crop",
    cta: "Explore",
    link: "/search",
  },
];

export default function HeroCarousel() {
  const theme = useTheme();
  const router = useRouter(); // Added router hook
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { banners } = useBanners();

  // Fallback data if no banners or loading
  const data = (banners.length > 0 ? banners : CAROUSEL_DATA).map(
    (item: any) => ({
      id: item.$id || item.id,
      title: item.title,
      subtitle: item.subtitle,
      image: item.imageUrl || item.image,
      cta: item.ctaText || item.cta,
      link: item.ctaLink || item.link, // Added link mapping
    })
  );

  // Auto-play
  useEffect(() => {
    if (data.length === 0) return;
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= data.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, data.length]);

  const handlePress = (link?: string) => {
    if (link) {
      router.push(link as any);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        >
          <View style={styles.textContainer}>
            <Text variant="headlineSmall" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {item.subtitle}
            </Text>
            <Button
              mode="contained"
              onPress={() => handlePress(item.link)}
              style={styles.button}
              labelStyle={{ fontSize: 12 }}
              compact
            >
              {item.cta}
            </Button>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data} // Use dynamic data
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      {/* Paginator */}
      <View style={styles.paginator}>
        {data.length > 0 &&
          data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex ? theme.colors.primary : "#ccc",
                  width: index === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  cardContainer: {
    width: width,
    paddingHorizontal: 20,
    ...shadows.md,
  },
  imageBackground: {
    height: 200,
    width: "100%",
    justifyContent: "flex-end",
  },
  gradient: {
    height: "100%",
    justifyContent: "flex-end",
    padding: 16,
    borderRadius: 16,
  },
  textContainer: {
    gap: 4,
    alignItems: "flex-start",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#e0e0e0",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#fff",
    opacity: 0.9,
  },
  paginator: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
