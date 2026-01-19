/**
 * ConsultingGrid Component
 *
 * Horizontal scrolling grid of consulting/service options.
 * Fetches services dynamically from the backend.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import databaseService from "../../lib/databaseService";
import { shadows } from "../../theme";

interface ServiceItem {
  $id: string;
  label: string;
  icon: string;
  gradient: [string, string];
  route: string;
}

function GridItem({
  item,
  onPress,
  labelColor,
}: {
  item: ServiceItem;
  onPress: () => void;
  labelColor: string;
}) {
  const animateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.92 : 1,
          opacity: pressed ? 0.85 : 1,
        };
      },
    [],
  );

  return (
    <MotiPressable
      style={styles.item}
      onPress={onPress}
      animate={animateState}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 400,
      }}
    >
      <View style={styles.shadowContainer}>
        <LinearGradient
          colors={item.gradient}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={28}
            color="#fff"
          />
        </LinearGradient>
      </View>
      <Text
        style={[styles.label, { color: labelColor }]}
        numberOfLines={2}
        variant="labelSmall"
      >
        {item.label}
      </Text>
    </MotiPressable>
  );
}

export default function ConsultingGrid() {
  const router = useRouter();
  const theme = useTheme();
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    const loadServices = async () => {
      const data = await databaseService.content.getServices();
      setServices(data);
    };
    loadServices();
  }, []);

  if (services.length === 0) {
    return null;
  }

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {services.map((item) => (
          <GridItem
            key={item.$id}
            item={item}
            onPress={() => router.push(item.route as any)}
            labelColor={theme.colors.onSurface}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  item: {
    width: 72,
    alignItems: "center",
  },
  shadowContainer: {
    ...shadows.sm,
    borderRadius: 24,
    marginBottom: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 11,
    lineHeight: 14,
  },
});
