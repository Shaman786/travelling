import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Chip,
  HelperText,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { Toast } from "toastify-react-native";

import { useStore } from "../../store/useStore";
// Import databaseService from the correct file
import { ID } from "react-native-appwrite";
import { BUCKETS, storage } from "../../lib/appwrite";
import databaseService from "../../lib/databaseService";

interface ConsultationFormProps {
  type: string; // 'visa', 'flights', 'expert', etc.
  title: string;
  subtitle?: string;
  showDestination?: boolean;
  showDates?: boolean;
  showTravelers?: boolean;
  showBudget?: boolean;
  placeholderNotes?: string;
}

export default function ConsultationForm({
  type,
  title,
  subtitle,
  showDestination = false,
  showDates = false,
  showTravelers = false,
  showBudget = false,
  placeholderNotes = "Tell us more about your requirements...",
}: ConsultationFormProps) {
  const router = useRouter();
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: user?.name || "",
    userPhone: user?.phone || "",
    userEmail: user?.email || "",
    destination: "",
    dates: "",
    travelers: "",
    budget: "",
    notes: "",
  });

  const [attachment, setAttachment] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (file.size && file.size > 100 * 1024 * 1024) {
        // 100MB limit
        Toast.error("File size limit is 100MB");
        return;
      }

      setAttachment(file);
    } catch (err) {
      console.error("Pick document error:", err);
    }
  };

  const handleSubmit = async () => {
    if (!formData.userName || !formData.userPhone) {
      Toast.warn("Name and Phone Number are required.");
      return;
    }

    setLoading(true);
    try {
      let attachmentId = null;
      let attachmentName = null;

      if (attachment) {
        try {
          // Prepare file for Appwrite
          const filePayload = {
            name: attachment.name,
            type: attachment.mimeType || "application/octet-stream",
            size: attachment.size || 0,
            uri: attachment.uri,
          };

          const uploaded = await storage.createFile(
            BUCKETS.CONSULTATION_ATTACHMENTS,
            ID.unique(),
            filePayload as any
          );
          attachmentId = uploaded.$id;
          attachmentName = attachment.name;
        } catch (uploadError: any) {
          console.error("Upload failed", uploadError);
          Toast.warn("File upload failed, submitting info only.");
        }
      }

      await databaseService.consultations.createConsultation({
        ...formData,
        userId: user?.$id,
        type,
        attachmentId,
        attachmentName,
      });

      Toast.success("Request Recieved! We'll contact you shortly.");
      router.back();
    } catch (error: any) {
      Toast.error(error.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ marginBottom: 24 }}>
          <Text variant="headlineMedium" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              {subtitle}
            </Text>
          )}
        </View>

        <Surface style={styles.form} elevation={0}>
          {/* Contact Info */}
          <TextInput
            label="Full Name *"
            value={formData.userName}
            onChangeText={(t) => setFormData({ ...formData, userName: t })}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Phone Number *"
            value={formData.userPhone}
            onChangeText={(t) => setFormData({ ...formData, userPhone: t })}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            label="Email (Optional)"
            value={formData.userEmail}
            onChangeText={(t) => setFormData({ ...formData, userEmail: t })}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
          />

          {/* Dynamic Fields */}
          {showDestination && (
            <TextInput
              label="Destination(s)"
              value={formData.destination}
              onChangeText={(t) => setFormData({ ...formData, destination: t })}
              mode="outlined"
              style={styles.input}
            />
          )}

          {showDates && (
            <TextInput
              label="Preferred Dates"
              value={formData.dates}
              onChangeText={(t) => setFormData({ ...formData, dates: t })}
              mode="outlined"
              placeholder="e.g. Next month, Dec 25-30"
              style={styles.input}
            />
          )}

          <View style={styles.row}>
            {showTravelers && (
              <TextInput
                label="Travelers"
                value={formData.travelers}
                onChangeText={(t) => setFormData({ ...formData, travelers: t })}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, { flex: 1, marginRight: 8 }]}
              />
            )}
            {showBudget && (
              <TextInput
                label="Budget (Approx)"
                value={formData.budget}
                onChangeText={(t) => setFormData({ ...formData, budget: t })}
                mode="outlined"
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
              />
            )}
          </View>

          <TextInput
            label="Additional Notes"
            value={formData.notes}
            onChangeText={(t) => setFormData({ ...formData, notes: t })}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder={placeholderNotes}
            style={styles.input}
          />

          {/* File Attachment */}
          <View style={{ marginTop: 8 }}>
            <Button
              mode="outlined"
              onPress={handlePickDocument}
              icon="paperclip"
              style={{ borderColor: theme.colors.outline }}
            >
              {attachment ? "Change File" : "Attach Document / Image"}
            </Button>
            {attachment && (
              <Chip
                icon="file-document-outline"
                onClose={() => setAttachment(null)}
                style={{ marginTop: 8, alignSelf: "flex-start" }}
              >
                {attachment.name} (
                {(attachment.size ? attachment.size / 1024 / 1024 : 0).toFixed(
                  1
                )}{" "}
                MB)
              </Chip>
            )}
            <HelperText type="info">
              Max 100MB. Useful for sharing itineraries, IDs, or references.
            </HelperText>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={{ height: 48 }}
          >
            Submit Request
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  form: {
    gap: 12,
    backgroundColor: "transparent",
  },
  input: {
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    marginTop: 12,
    borderRadius: 8,
  },
});
