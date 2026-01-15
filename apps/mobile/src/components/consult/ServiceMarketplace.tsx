import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import databaseService from "../../lib/databaseService";
import { useStore } from "../../store/useStore";

const SERVICES = [
  { id: "forex", label: "Forex", icon: "cash-multiple" },
  { id: "sim", label: "SIM / E-SIM", icon: "sim" },
  { id: "transfer", label: "Airport Transfer", icon: "car-hatchback" },
  { id: "lounge", label: "Lounge Access", icon: "sofa" },
  { id: "guide", label: "Tour Guide", icon: "account-tie-voice" },
  { id: "other", label: "Other", icon: "dots-horizontal" },
];

export default function ServiceMarketplace() {
  const router = useRouter();
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const showDialog = (id: string) => {
    setSelectedService(id);
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setSelectedService(null);
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!selectedService) return;

    setLoading(true);
    try {
      const serviceLabel = SERVICES.find(
        (s) => s.id === selectedService
      )?.label;
      const payload = {
        userId: user?.$id,
        userName: user?.name,
        userPhone: user?.phone,
        type: "other_service",
        destination: "Any",
        notes: `Service: ${serviceLabel}. \nDetails: ${notes}`,
      };

      await databaseService.consultations.createConsultation(payload);
      Toast.success("Service Requested!");
      hideDialog();
    } catch (error: any) {
      Toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
          Travel Essentials
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text
          variant="headlineSmall"
          style={{ marginBottom: 24, fontWeight: "bold" }}
        >
          What else do you need?
        </Text>

        <View style={styles.grid}>
          {SERVICES.map((s) => (
            <Card
              key={s.id}
              style={styles.card}
              onPress={() => showDialog(s.id)}
              mode="elevated"
            >
              <Card.Content style={{ alignItems: "center", padding: 16 }}>
                <MaterialCommunityIcons
                  name={s.icon as any}
                  size={40}
                  color={theme.colors.primary}
                />
                <Text
                  variant="titleSmall"
                  style={{ marginTop: 12, textAlign: "center" }}
                >
                  {s.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>
              Request {SERVICES.find((s) => s.id === selectedService)?.label}
            </Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                Tell us more about your requirements (Dates, Amount, etc.)
              </Text>
              <TextInput
                label="Details"
                mode="outlined"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              <Button
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                Submit
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  content: {
    padding: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  card: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
  },
});
