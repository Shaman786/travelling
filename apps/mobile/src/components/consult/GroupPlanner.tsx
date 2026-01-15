import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  IconButton,
  RadioButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import databaseService from "../../lib/databaseService";
import { useStore } from "../../store/useStore";

export default function GroupPlanner() {
  const router = useRouter();
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [groupType, setGroupType] = useState("corporate");
  const [size, setSize] = useState("10-50");
  const [themeReq, setThemeReq] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTheme = (item: string) => {
    if (themeReq.includes(item))
      setThemeReq(themeReq.filter((i) => i !== item));
    else setThemeReq([...themeReq, item]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        userId: user?.$id,
        userName: user?.name,
        userPhone: user?.phone,
        type: "group_tour",
        // Destination might be implicit or we can add a field, but keeping it simple for now as per plan
        notes: `Type: ${groupType}. \nSize: ${size}. \nThemes: ${themeReq.join(", ")}`,
      };

      await databaseService.consultations.createConsultation(payload);
      Toast.success("Group Request Sent! We handle the chaos. 🚌");
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
          Group Planner
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.label}>
            Group Type
          </Text>
          <RadioButton.Group onValueChange={setGroupType} value={groupType}>
            <View style={styles.radioRow}>
              <RadioButton.Item
                label="Corporate"
                value="corporate"
                style={styles.radioItem}
                color={theme.colors.primary}
              />
              <RadioButton.Item
                label="Student"
                value="student"
                style={styles.radioItem}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.radioRow}>
              <RadioButton.Item
                label="Family Reunion"
                value="family"
                style={styles.radioItem}
                color={theme.colors.primary}
              />
              <RadioButton.Item
                label="Other"
                value="other"
                style={styles.radioItem}
                color={theme.colors.primary}
              />
            </View>
          </RadioButton.Group>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.label}>
            Group Size
          </Text>
          <View style={styles.chipRow}>
            {["< 10", "10-50", "50-100", "100+"].map((s) => (
              <Chip
                key={s}
                selected={size === s}
                onPress={() => setSize(s)}
                showSelectedOverlay
                mode="outlined"
              >
                {s} members
              </Chip>
            ))}
          </View>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.label}>
            Goals / Theme
          </Text>
          <View style={styles.chipRow}>
            {[
              "Relaxation",
              "Adventure",
              "Team Building",
              "Education",
              "Luxury",
            ].map((t) => (
              <Chip
                key={t}
                selected={themeReq.includes(t)}
                onPress={() => toggleTheme(t)}
                showSelectedOverlay
                mode="outlined"
              >
                {t}
              </Chip>
            ))}
          </View>
        </Surface>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 24 }}
          contentStyle={{ height: 56 }}
        >
          Plan Our Trip
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
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: "row",
  },
  radioItem: {
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
