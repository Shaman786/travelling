import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  IconButton,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import databaseService from "../../lib/databaseService";
import { useStore } from "../../store/useStore";

export default function DealHunter() {
  const router = useRouter();
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [flexible, setFlexible] = useState(true);
  const [cabinClass, setCabinClass] = useState("economy");
  const [loading, setLoading] = useState(false);

  const handleHunt = async () => {
    if (!from || !to) {
      Toast.warn("Please enter From and To locations.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        userId: user?.$id,
        userName: user?.name,
        userPhone: user?.phone,
        type: "flight_deals",
        destination: to,
        notes: `From: ${from}. \nCabin: ${cabinClass}. \nFlexible Dates: ${flexible ? "Yes" : "No"}`,
      };

      await databaseService.consultations.createConsultation(payload);
      Toast.success("Agents scanning for deals! 🕵️");
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
          Deal Hunter
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.routeContainer}>
          <TextInput
            mode="outlined"
            label="From"
            left={<TextInput.Icon icon="airplane-takeoff" />}
            value={from}
            onChangeText={setFrom}
            style={styles.input}
          />
          <View
            style={{ alignItems: "center", marginVertical: -10, zIndex: 10 }}
          >
            <View
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 20,
                padding: 4,
              }}
            >
              <MaterialCommunityIcons
                name="arrow-down"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          </View>
          <TextInput
            mode="outlined"
            label="To"
            left={<TextInput.Icon icon="airplane-landing" />}
            value={to}
            onChangeText={setTo}
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <Text variant="bodyLarge" style={{ flex: 1 }}>
            I&apos;m flexible with dates (+/- 3 days)
          </Text>
          <Switch
            value={flexible}
            onValueChange={setFlexible}
            color={theme.colors.primary}
          />
        </View>

        <Text
          variant="titleMedium"
          style={{ marginTop: 24, marginBottom: 8, fontWeight: "bold" }}
        >
          Cabin Class
        </Text>
        <SegmentedButtons
          value={cabinClass}
          onValueChange={setCabinClass}
          buttons={[
            { value: "economy", label: "Economy" },
            { value: "business", label: "Business" },
            { value: "first", label: "First" },
          ]}
        />

        <Button
          mode="contained"
          onPress={handleHunt}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 48 }}
          contentStyle={{ height: 56 }}
          icon="radar"
        >
          Start Searching
        </Button>
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
  routeContainer: {
    gap: 0,
  },
  input: {
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
});
