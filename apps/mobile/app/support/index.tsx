/**
 * Support Dashboard Screen
 *
 * Displays list of user's support tickets and option to create new one.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react"; // Added useState just in case
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  FAB,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import WhatsAppButton from "../../src/components/WhatsAppButton";
import { useSupport } from "../../src/hooks/useSupport";
import type { SupportTicket } from "../../src/types";

export default function SupportScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { tickets, isLoading, fetchTickets } = useSupport();

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets]),
  );

  const renderTicket = ({ item }: { item: SupportTicket }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "open":
          return theme.colors.primary;
        case "in_progress":
          return theme.colors.secondary;
        case "resolved":
          return theme.colors.tertiary;
        case "closed":
          return theme.colors.outline;
        default:
          return theme.colors.primary;
      }
    };

    const statusColor = getStatusColor(item.status);

    return (
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        mode="elevated"
        onPress={() => router.push(`/support/${item.$id}` as any)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text
                variant="titleMedium"
                style={[styles.subject, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {item.subject}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {format(new Date(item.createdAt), "MMM dd, yyyy")} •{" "}
                {item.category}
              </Text>
            </View>
            <Chip
              style={{ backgroundColor: statusColor + "20" }}
              textStyle={{
                color: statusColor,
                fontSize: 11,
                fontWeight: "bold",
              }}
            >
              {item.status.toUpperCase().replace("_", " ")}
            </Chip>
          </View>

          <Text
            variant="bodyMedium"
            numberOfLines={2}
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            {item.message}
          </Text>

          <View style={styles.cardFooter}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name="flag"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}
              >
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}{" "}
                Priority
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="ticket-confirmation-outline"
        size={64}
        color={theme.colors.outlineVariant}
      />
      <Text
        variant="titleMedium"
        style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}
      >
        No support tickets
      </Text>
      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.outline,
          marginTop: 4,
          textAlign: "center",
        }}
      >
        Need help? Create a new ticket below.
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Support Tickets" }} />

      {isLoading && tickets.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={
            tickets.length === 0 ? { flex: 1 } : styles.listContent
          }
          ListEmptyComponent={renderEmpty}
        />
      )}

      <FAB
        icon="plus"
        label="New Ticket"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => router.push("/support/create")}
      />
      <FAB
        icon="plus"
        label="New Ticket"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => router.push("/support/create")}
      />
      <WhatsAppButton
        style={{ bottom: 160 }}
        message="Hello, I need to raise a support ticket or have an issue."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  card: {
    marginBottom: 12,
    // backgroundColor: "#fff",
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  subject: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  message: {
    // color: "#666",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});
