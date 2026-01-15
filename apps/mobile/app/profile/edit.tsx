/**
 * Edit Profile Screen
 *
 * Form to edit user profile information.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // Keep star import for other methods if needed, or switch specific
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { useStore } from "../../src/store/useStore";

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);
  const updateUser = useStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        // Use new MediaType if available to avoid warning, fallback to Options
        mediaTypes: (ImagePicker as any).MediaType
          ? (ImagePicker as any).MediaType.Images
          : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch {
      Toast.error("Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Toast.error("Name is required");
      return;
    }

    if (!email.trim()) {
      Toast.error("Email is required");
      return;
    }

    setIsSaving(true);
    try {
      updateUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar || undefined,
      });

      Toast.success("Profile updated successfully!");
      router.back();
    } catch {
      Toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Edit Profile",
          headerStyle: { backgroundColor: "#fff" },
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Pressable onPress={handlePickImage} style={styles.avatarWrapper}>
            {avatar ? (
              <Avatar.Image size={120} source={{ uri: avatar }} />
            ) : (
              <Avatar.Text
                size={120}
                label={name?.substring(0, 2).toUpperCase() || "U"}
              />
            )}
            <View
              style={[
                styles.editBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <MaterialCommunityIcons name="camera" size={18} color="#fff" />
            </View>
          </Pressable>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.outline, marginTop: 8 }}
          >
            Tap to change photo
          </Text>
        </View>

        {/* Form Fields */}
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          left={<TextInput.Icon icon="email" />}
        />

        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
          left={<TextInput.Icon icon="phone" />}
          placeholder="Optional"
        />

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={[styles.button, { borderColor: theme.colors.outline }]}
            contentStyle={{ height: 48 }}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            style={styles.button}
            contentStyle={{ height: 48 }}
          >
            Save Changes
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrapper: {
    position: "relative",
  },
  editBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  input: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
});
