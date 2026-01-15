import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  IconButton,
  SegmentedButtons,
  Surface,
  Switch,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import databaseService from "../../lib/databaseService";
import { useStore } from "../../store/useStore";

export default function InsuranceCalc() {
  const router = useRouter();
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [type, setType] = useState("single");
  const [region, setRegion] = useState("asia");
  const [addons, setAddons] = useState({
    adventure: false,
    gadget: false,
    cancellation: false,
  });
  const [loading, setLoading] = useState(false);

  const toggleAddon = (key: keyof typeof addons) => {
    setAddons({ ...addons, [key]: !addons[key] });
  };

  const handleRequest = async () => {
    setLoading(true);
    try {
      const payload = {
        userId: user?.$id,
        userName: user?.name,
        userPhone: user?.phone,
        type: "insurance",
        destination: region.toUpperCase(),
        notes: `Type: ${type}. \nAddons: ${Object.keys(addons)
          .filter((k) => addons[k as keyof typeof addons])
          .join(", ")}`,
      };

      await databaseService.consultations.createConsultation(payload);
      Toast.success("Quote request received! 🛡️");
      router.back();
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
          Insurance Calculator
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={styles.card} elevation={1}>
          <MaterialCommunityIcons
            name="shield-check"
            size={48}
            color={theme.colors.primary}
            style={{ alignSelf: "center", marginBottom: 16 }}
          />
          <Text
            variant="bodyMedium"
            style={{
              textAlign: "center",
              marginBottom: 24,
              color: theme.colors.onSurfaceVariant,
            }}
          >
            Get comprehensive travel protection starting at just $10.
          </Text>

          <Text variant="titleSmall" style={styles.label}>
            Trip Type
          </Text>
          <SegmentedButtons
            value={type}
            onValueChange={setType}
            buttons={[
              { value: "single", label: "Single Trip" },
              { value: "multi", label: "Annual Multi" },
            ]}
            style={{ marginBottom: 24 }}
          />

          <Text variant="titleSmall" style={styles.label}>
            Region
          </Text>
          <SegmentedButtons
            value={region}
            onValueChange={setRegion}
            buttons={[
              { value: "domestic", label: "Domestic" },
              { value: "asia", label: "Asia" },
              { value: "world", label: "Worldwide" },
            ]}
            style={{ marginBottom: 24 }}
          />

          <Text variant="titleSmall" style={styles.label}>
            Add-ons
          </Text>

          <View style={styles.addonRow}>
            <Text variant="bodyMedium" style={{ flex: 1 }}>
              Adventure Sports Cover
            </Text>
            <Switch
              value={addons.adventure}
              onValueChange={() => toggleAddon("adventure")}
            />
          </View>
          <View style={styles.addonRow}>
            <Text variant="bodyMedium" style={{ flex: 1 }}>
              Gadget Protection
            </Text>
            <Switch
              value={addons.gadget}
              onValueChange={() => toggleAddon("gadget")}
            />
          </View>
          <View style={styles.addonRow}>
            <Text variant="bodyMedium" style={{ flex: 1 }}>
              Cancellation for Any Reason
            </Text>
            <Switch
              value={addons.cancellation}
              onValueChange={() => toggleAddon("cancellation")}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleRequest}
            loading={loading}
            disabled={loading}
            style={{ marginTop: 32 }}
            contentStyle={{ height: 56 }}
          >
            Get Quote
          </Button>
        </Surface>
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
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});
