import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, isToday, isYesterday } from "date-fns";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { notificationService } from "../src/lib/databaseService";
import { useStore } from "../src/store/useStore";
import type { AppNotification } from "../src/types";

type NotificationSection = {
  title: string;
  data: AppNotification[];
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const user = useStore((state) => state.user);
  const [sections, setSections] = useState<NotificationSection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.$id) return;
    try {
      const data = await notificationService.getNotifications(user.$id);
      const grouped = groupNotifications(data);
      setSections(grouped);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const groupNotifications = (
    notifs: AppNotification[],
  ): NotificationSection[] => {
    const today: AppNotification[] = [];
    const yesterday: AppNotification[] = [];
    const earlier: AppNotification[] = [];

    notifs.forEach((n) => {
      const date = new Date(n.createdAt);
      if (isToday(date)) today.push(n);
      else if (isYesterday(date)) yesterday.push(n);
      else earlier.push(n);
    });

    const sections: NotificationSection[] = [];
    if (today.length > 0) sections.push({ title: "Today", data: today });
    if (yesterday.length > 0)
      sections.push({ title: "Yesterday", data: yesterday });
    if (earlier.length > 0) sections.push({ title: "Earlier", data: earlier });

    return sections;
  };

  const handleMarkAllRead = async () => {
    if (!user?.$id) return;
    // Optimistic Update
    const updatedSections = sections.map((section) => ({
      ...section,
      data: section.data.map((item) => ({ ...item, isRead: true })),
    }));
    setSections(updatedSections);

    await notificationService.markAllAsRead(user.$id);
  };

  const markAsRead = async (id: string) => {
    // Optimistic Update
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        data: section.data.map((item) =>
          item.$id === id ? { ...item, isRead: true } : item,
        ),
      })),
    );
    await notificationService.markAsRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "booking":
        return "check-circle";
      case "promo":
        return "tag";
      case "security":
        return "shield-alert";
      case "system":
        return "wallet";
      default:
        return "bell";
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "booking":
        return "#4CAF50";
      case "promo":
        return "#FF9800";
      case "security":
        return "#F44336";
      case "system":
        return "#2196F3";
      default:
        return theme.colors.primary;
    }
  };

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: NotificationSection;
  }) => (
    <Text
      variant="labelLarge"
      style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
        color: theme.colors.onSurfaceVariant,
        fontWeight: "600",
      }}
    >
      {title}
    </Text>
  );

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => markAsRead(item.$id)}
      style={[
        styles.itemContainer,
        { backgroundColor: theme.colors.surface },
        !item.isRead && { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: getColor(item.type) + "20" },
        ]}
      >
        <MaterialCommunityIcons
          name={getIcon(item.type) as any}
          size={24}
          color={getColor(item.type)}
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.headerRow}>
          <Text
            variant="titleSmall"
            style={[styles.itemTitle, { color: theme.colors.onSurface }]}
          >
            {item.title}
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.timeText, { color: theme.colors.outline }]}
          >
            {format(new Date(item.createdAt), "h:mm a")}
          </Text>
        </View>
        <Text
          variant="bodyMedium"
          numberOfLines={2}
          style={[
            styles.message,
            { color: theme.colors.onSurfaceVariant },
            !item.isRead && {
              color: theme.colors.onSurface,
            }, // Handle read/unread text
          ]}
        >
          {item.message}
        </Text>
      </View>
      {!item.isRead && (
        <View
          style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]} // Let header handle top
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Notifications",
          headerRight: () => (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
                Mark all read
              </Text>
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.onBackground },
          headerTintColor: theme.colors.primary,
          headerShadowVisible: false,
        }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.$id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        // contentContainerStyle={{ paddingBottom: 20 }} // Removed to avoid potential sticky header conflict if any
        ItemSeparatorComponent={() => (
          <Divider
            style={{
              marginLeft: 76,
              backgroundColor: theme.colors.surfaceVariant,
            }}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={() =>
          !loading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="bell-off-outline"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}
              >
                No notifications yet
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 16,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitle: {
    fontWeight: "bold",
    flex: 1,
  },
  timeText: {
    fontSize: 12,
  },
  message: {
    lineHeight: 20,
  },
  unreadMessage: {
    // handled dynamically
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
});
