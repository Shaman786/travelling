import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const EXPERTS = [
  {
    id: "1",
    name: "Sarah Jenkins",
    role: "Europe Specialist",
    rate: "$50/call",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: "2",
    name: "David Chen",
    role: "Asia & Bali Expert",
    rate: "$45/call",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    id: "3",
    name: "Maria Garcia",
    role: "Visa Consultant",
    rate: "$30/call",
    image: "https://i.pravatar.cc/150?u=a04258114e29026302d",
  },
];

export default function ExpertScreen() {
  const theme = useTheme();

  const renderItem = ({ item }: { item: (typeof EXPERTS)[0] }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <Avatar.Image size={60} source={{ uri: item.image }} />
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            {item.name}
          </Text>
          <Text variant="bodyMedium" style={{ color: "#666" }}>
            {item.role}
          </Text>
          <Text
            variant="labelLarge"
            style={{ color: theme.colors.primary, marginTop: 4 }}
          >
            {item.rate}
          </Text>
        </View>
        <Button mode="outlined" compact onPress={() => {}}>
          Call
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Talk to an Expert
        </Text>
        <Text variant="bodyMedium" style={{ color: "#666" }}>
          Video call with certified travel consultants.
        </Text>
      </View>
      <FlatList
        data={EXPERTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingBottom: 0 },
  title: { fontWeight: "bold", color: "#1A1A2E" },
  card: { marginBottom: 16, backgroundColor: "#fff" },
  cardContent: { flexDirection: "row", alignItems: "center", gap: 16 },
});
