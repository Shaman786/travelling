/**
 * Saved Travelers Screen
 *
 * Manage frequently used traveler profiles.
 * Allows Create, Read, Delete of saved travelers.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Dialog,
  FAB,
  IconButton,
  Portal,
  RadioButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import { useAuth } from "../../src/hooks/useAuth";
import databaseService from "../../src/lib/databaseService";
import type { SavedTraveler } from "../../src/types";

export default function SavedTravelersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [travelers, setTravelers] = useState<SavedTraveler[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [passport, setPassport] = useState("");

  const loadTravelers = useCallback(async () => {
    if (!user?.$id) return;
    try {
      // @ts-ignore - databaseService types update might lag in IDE
      const data = await databaseService.travelers.getUserTravelers(user.$id);
      setTravelers(data);
    } catch {
      Toast.error("Failed to load travelers");
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    loadTravelers();
  }, [loadTravelers]);

  const handleCreate = async () => {
    if (!name || !age) {
      Toast.error("Name and Age are required");
      return;
    }

    setIsSaving(true);
    try {
      if (!user?.$id) return;

      // @ts-ignore
      await databaseService.travelers.createTraveler({
        userId: user.$id,
        name,
        age: parseInt(age),
        gender,
        passportNumber: passport || undefined,
      });

      Toast.success("Traveler saved");
      setDialogVisible(false);
      resetForm();
      loadTravelers();
    } catch {
      Toast.error("Failed to save traveler");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // @ts-ignore
      await databaseService.travelers.deleteTraveler(id);
      setTravelers((prev) => prev.filter((t) => t.$id !== id));
      Toast.success("Traveler deleted");
    } catch {
      Toast.error("Failed to delete traveler");
    }
  };

  const resetForm = () => {
    setName("");
    setAge("");
    setGender("male");
    setPassport("");
  };

  const renderItem = ({ item }: { item: SavedTraveler }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={item.gender === "female" ? "face-woman" : "face-man"}
            size={32}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            {item.name}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {item.age} years • {item.gender}
            {item.passportNumber ? ` • Passport: ${item.passportNumber}` : ""}
          </Text>
        </View>
        <IconButton
          icon="delete-outline"
          iconColor={theme.colors.error}
          onPress={() => handleDelete(item.$id)}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Saved Travelers" />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={travelers}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: theme.colors.outline }}>
                No saved travelers yet.
              </Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => setDialogVisible(true)}
        label="Add Traveler"
      />

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>Add New Traveler</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Full Name *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Age *"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />

            <Text variant="labelLarge" style={{ marginTop: 8 }}>
              Gender
            </Text>
            <RadioButton.Group
              value={gender}
              onValueChange={(v) => setGender(v as any)}
            >
              <View style={styles.radioRow}>
                <View style={styles.radioItem}>
                  <RadioButton value="male" />
                  <Text>Male</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="female" />
                  <Text>Female</Text>
                </View>
              </View>
            </RadioButton.Group>

            <TextInput
              label="Passport Number (Optional)"
              value={passport}
              onChangeText={setPassport}
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreate} loading={isSaving}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    marginTop: 40,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  radioRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
});
