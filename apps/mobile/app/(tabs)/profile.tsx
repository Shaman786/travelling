import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  List,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { GlassSurface } from "../../src/components/ui/GlassSurface";
import { useAuth } from "../../src/hooks/useAuth";
import { useStore } from "../../src/store/useStore";
import { borderRadius, shadows } from "../../src/theme";

interface UploadedFile {
  name: string;
  uri: string;
  size?: number;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const user = useStore((state) => state.user);
  const { logout } = useAuth();
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  const toggleLanguage = () => {
    const current = i18n.language;
    const next = current === "en" ? "hi" : current === "hi" ? "ar" : "en";
    i18n.changeLanguage(next);
  };

  // ... (keep handleLogout, handleUpload, openWhatsApp)
  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleUpload = async () => {
    // ... implementation unchanged
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setDocuments((prev) => [
          ...prev,
          { name: file.name, uri: file.uri, size: file.size },
        ]);
      }
    } catch {
      // Document picker cancelled or error
    }
  };

  const openWhatsApp = () => {
    const supportNumber = process.env.EXPO_PUBLIC_SUPPORT_PHONE || "";
    if (!supportNumber) {
      Toast.info(
        "WhatsApp support not configured. Please use Support Tickets."
      );
      return;
    }
    const message = "Hello! I need help with my travel booking.";
    const url = `whatsapp://send?phone=${supportNumber}&text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(url).catch(() => {
      Toast.error("WhatsApp is not installed on this device.");
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <GlassSurface style={styles.header} intensity={40}>
          {user?.avatar ? (
            <Avatar.Image size={100} source={{ uri: user.avatar }} />
          ) : (
            <Avatar.Text
              size={100}
              label={user?.name?.substring(0, 2).toUpperCase() || "U"}
            />
          )}
          <Text variant="headlineMedium" style={styles.name}>
            {user?.name || "Guest"}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email || "guest@host-palace.app"}
          </Text>
        </GlassSurface>

        <View style={styles.sectionContainer}>
          {/* Travel Vault */}
          <Surface style={styles.card} elevation={2}>
            <View style={styles.cardHeader}>
              <Avatar.Icon
                size={48}
                icon="safe"
                style={{ backgroundColor: theme.colors.primaryContainer }}
                color={theme.colors.primary}
              />
              <View style={{ marginLeft: 16 }}>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                  {t("travel_vault")}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.outline }}
                >
                  {t("store_docs_subtitle") ??
                    "Secure your important documents"}
                </Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              {documents.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={40}
                    color={theme.colors.outlineVariant}
                  />
                  <Text variant="bodySmall" style={styles.emptyText}>
                    {t("no_docs")}
                  </Text>
                </View>
              ) : (
                documents.map((doc, idx) => (
                  <Surface key={idx} style={styles.docItem} elevation={0}>
                    <List.Icon
                      icon="file-document-outline"
                      color={theme.colors.secondary}
                    />
                    <Text
                      variant="bodyMedium"
                      style={styles.docName}
                      numberOfLines={1}
                    >
                      {doc.name}
                    </Text>
                  </Surface>
                ))
              )}
              <Button
                mode="contained"
                onPress={handleUpload}
                icon="cloud-upload"
                style={styles.actionBtn}
                contentStyle={{ height: 44 }}
              >
                {t("upload_doc")}
              </Button>
            </View>
          </Surface>

          {/* Expert Support */}
          <Surface style={[styles.card, { marginTop: 16 }]} elevation={2}>
            <View style={styles.supportContent}>
              <View style={{ flex: 1 }}>
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "bold", marginBottom: 4 }}
                >
                  {t("support")}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.outline }}
                >
                  {t("chat_expert_subtitle") ??
                    "Need help? Chat with an expert instantly."}
                </Text>
              </View>
              <IconButton
                icon="whatsapp"
                mode="contained"
                containerColor="#25D366"
                iconColor="#fff"
                size={28}
                onPress={openWhatsApp}
              />
            </View>
          </Surface>

          {/* Account Actions */}
          <Surface style={styles.menuContainer} elevation={0}>
            <List.Section>
              <List.Subheader>{t("account_settings")}</List.Subheader>

              <List.Item
                title={`${t("language")}: ${i18n.language.toUpperCase()}`}
                left={(props) => <List.Icon {...props} icon="translate" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={toggleLanguage}
              />

              <List.Item
                title={t("edit_profile")}
                left={(props) => (
                  <List.Icon {...props} icon="account-edit-outline" />
                )}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/profile/edit" as any)}
              />
              <List.Item
                title={t("my_favorites")}
                left={(props) => <List.Icon {...props} icon="heart" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/favorites" as any)}
              />
              <List.Item
                title={t("change_password")}
                left={(props) => <List.Icon {...props} icon="lock-reset" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/profile/change-password" as any)}
              />
              <List.Item
                title={t("support_tickets")}
                left={(props) => <List.Icon {...props} icon="ticket-account" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/support" as any)}
              />
              <Divider />
              <List.Item
                title={t("logout")}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="logout"
                    color={theme.colors.error}
                  />
                )}
                onPress={handleLogout}
                titleStyle={{ color: theme.colors.error }}
              />
            </List.Section>
          </Surface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    ...shadows.sm,
  },
  name: {
    fontWeight: "bold",
    marginTop: 16,
    color: "#1A1A2E",
  },
  email: {
    color: "#666",
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.md,
    overflow: "hidden",
    padding: 16,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardContent: {
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
  },
  emptyText: {
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F5F7FA",
    padding: 8,
    borderRadius: 12,
  },
  docName: {
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
  actionBtn: {
    marginTop: 8,
    borderRadius: 12,
  },
  supportContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuContainer: {
    marginTop: 20,
    backgroundColor: "transparent",
  },
});
