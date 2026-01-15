import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  IconButton,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import databaseService from "../../lib/databaseService";
import { useStore } from "../../store/useStore";

const VIBES = [
  { id: "villa", label: "Private Villa", icon: "home-modern" },
  { id: "resort", label: "Luxury Resort", icon: "palm-tree" },
  { id: "boutique", label: "Boutique Hotel", icon: "star-circle" },
  { id: "glamping", label: "Glamping", icon: "tent" },
];

const AMENITIES = [
  "Pool",
  "Beachfront",
  "Spa",
  "Gym",
  "Kid Friendly",
  "Pet Friendly",
  "Kitchen",
];

export default function VibeFinder() {
  const router = useRouter();
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [vibe, setVibe] = useState<string | null>(null);
  const [budget, setBudget] = useState("medium");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item))
      setAmenities(amenities.filter((i) => i !== item));
    else setAmenities([...amenities, item]);
  };

  const handleFind = async () => {
    if (!destination || !vibe) {
      Toast.warn("Please pick a destination and a vibe!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        userId: user?.$id,
        userName: user?.name,
        userPhone: user?.phone,
        type: "curated_stays",
        destination,
        budget,
        notes: `Vibe: ${VIBES.find((v) => v.id === vibe)?.label}. \nAmenities: ${amenities.join(", ")}`,
      };

      await databaseService.consultations.createConsultation(payload);
      Toast.success("Vibe Check Passed! We're finding your match.");
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
          Find Your Vibe
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.question}>
          1. Where to?
        </Text>
        <TextInput
          mode="outlined"
          placeholder="e.g. Bali, Maldives, Goa"
          value={destination}
          onChangeText={setDestination}
          style={{ backgroundColor: "#fff", marginBottom: 24 }}
        />

        <Text variant="headlineSmall" style={styles.question}>
          2. Pick your Vibe
        </Text>
        <View style={styles.grid}>
          {VIBES.map((v) => (
            <Card
              key={v.id}
              style={[
                styles.vibeCard,
                vibe === v.id && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setVibe(v.id)}
              mode="outlined"
            >
              <Card.Content style={{ alignItems: "center" }}>
                <MaterialCommunityIcons
                  name={v.icon as any}
                  size={40}
                  color={
                    vibe === v.id ? theme.colors.primary : theme.colors.outline
                  }
                />
                <Text
                  variant="labelMedium"
                  style={{ marginTop: 8, textAlign: "center" }}
                >
                  {v.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Text
          variant="headlineSmall"
          style={[styles.question, { marginTop: 24 }]}
        >
          3. Must-haves
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {AMENITIES.map((a) => (
            <Chip
              key={a}
              selected={amenities.includes(a)}
              onPress={() => toggleAmenity(a)}
              showSelectedOverlay
            >
              {a}
            </Chip>
          ))}
        </View>

        <Text
          variant="headlineSmall"
          style={[styles.question, { marginTop: 24 }]}
        >
          4. Budget
        </Text>
        <SegmentedButtons
          value={budget}
          onValueChange={setBudget}
          buttons={[
            { value: "low", label: "$", icon: "wallet-outline" },
            { value: "medium", label: "$$", icon: "wallet" },
            { value: "high", label: "$$$", icon: "diamond-stone" },
          ]}
        />

        <Button
          mode="contained"
          onPress={handleFind}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 32 }}
          contentStyle={{ height: 56 }}
        >
          Find Me a Stay
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
  question: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  vibeCard: {
    width: "48%",
    backgroundColor: "#fff",
  },
});
