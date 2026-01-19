import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Divider,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { GlassSurface } from "../../src/components/ui/GlassySurface";
import { useAuth } from "../../src/hooks/useAuth";
import { useStore } from "../../src/store/useStore";
import { shadows } from "../../src/theme";

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
  const { logout, deleteAccount } = useAuth();
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  // Safe Area & Navigation Mode
  const insets = useSafeAreaInsets();
  // Base padding 100 + insets.bottom to ensure content clears the floating tab bar
  const bottomPadding = 100 + (insets.bottom || 20);

  const toggleLanguage = () => {
    const current = i18n.language;
    const next = current === "en" ? "hi" : current === "hi" ? "ar" : "en";
    i18n.changeLanguage(next);
  };

  /*
   * Actions
   */
  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("delete_account") ?? "Delete Account",
      t("delete_account_confirm") ??
        "Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.",
      [
        { text: t("cancel") ?? "Cancel", style: "cancel" },
        {
          text: t("delete") ?? "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace("/(auth)/login");
              Toast.success("Account deleted successfully");
            } catch {
              Toast.error("Failed to delete account");
            }
          },
        },
      ],
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Toast.error("Could not open link"));
  };

  const handleUpload = async () => {
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
    // Read from env or config
    const supportNumber = process.env.EXPO_PUBLIC_SUPPORT_PHONE || "";
    if (!supportNumber) {
      Toast.info(
        "WhatsApp support not configured. Please use Support Tickets.",
      );
      return;
    }
    const message = "Hello! I need help with my travel booking.";
    const url = `whatsapp://send?phone=${supportNumber}&text=${encodeURIComponent(
      message,
    )}`;
    Linking.openURL(url).catch(() => {
      Toast.error("WhatsApp is not installed on this device.");
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        <GlassSurface
          style={[styles.header, { backgroundColor: theme.colors.surface }]}
          intensity={40}
        >
          {user?.avatar ? (
            <Avatar.Image size={80} source={{ uri: user.avatar }} />
          ) : (
            <Avatar.Text
              size={80}
              label={user?.name?.substring(0, 2).toUpperCase() || "U"}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.primary}
            />
          )}
          <Text
            variant="titleLarge"
            style={[styles.name, { color: theme.colors.onSurface }]}
          >
            {user?.name || "Guest"}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.email, { color: theme.colors.onSurfaceVariant }]}
          >
            {user?.email || "guest@host-palace.app"}
          </Text>
        </GlassSurface>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.outline }]}>
            {t("travel_vault")}
          </Text>
          <Surface
            style={[
              styles.sectionBox,
              { backgroundColor: theme.colors.surface },
            ]}
            elevation={0}
          >
            {/* Travel Vault Header */}
            <Pressable style={styles.vaultHeader}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: `${theme.colors.primary}15` },
                ]}
              >
                <MaterialCommunityIcons
                  name="safe"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.itemTitle, { color: theme.colors.onSurface }]}
                >
                  {t("my_documents") ?? "My Documents"}
                </Text>
                <Text
                  style={[
                    styles.itemSubtitle,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {t("store_docs_subtitle") ?? "Secure important files"}
                </Text>
              </View>
              <Button mode="text" onPress={handleUpload} compact>
                {t("add")}
              </Button>
            </Pressable>

            {/* Documents List */}
            {documents.length > 0 && (
              <View style={styles.docList}>
                {documents.map((doc, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.docRow,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.docName,
                        { color: theme.colors.onSurface },
                      ]}
                      numberOfLines={1}
                    >
                      {doc.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Surface>

          <Text style={[styles.sectionTitle, { color: theme.colors.outline }]}>
            {t("support")}
          </Text>
          <Surface
            style={[
              styles.sectionBox,
              { backgroundColor: theme.colors.surface },
            ]}
            elevation={0}
          >
            <Pressable style={styles.menuItem} onPress={openWhatsApp}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#E0F2F1" }]}>
                  <MaterialCommunityIcons
                    name="whatsapp"
                    size={22}
                    color="#00897B"
                  />
                </View>
                <Text
                  style={[styles.itemTitle, { color: theme.colors.onSurface }]}
                >
                  {t("chat_support") ?? "Chat with Expert"}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#C7C7CC"
              />
            </Pressable>
            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.1)"
                    : "#f0f0f0",
                },
              ]}
            />
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push("/support" as any)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#FFF3E0" }]}>
                  <MaterialCommunityIcons
                    name="ticket-account"
                    size={22}
                    color="#F57C00"
                  />
                </View>
                <Text
                  style={[styles.itemTitle, { color: theme.colors.onSurface }]}
                >
                  {t("support_tickets")}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#C7C7CC"
              />
            </Pressable>
          </Surface>

          <Text style={[styles.sectionTitle, { color: theme.colors.outline }]}>
            {t("account_settings")}
          </Text>
          <Surface
            style={[
              styles.sectionBox,
              { backgroundColor: theme.colors.surface },
            ]}
            elevation={0}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push("/profile/edit" as any)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#ECEFF1" }]}>
                  <MaterialCommunityIcons
                    name="account-edit-outline"
                    size={22}
                    color="#546E7A"
                  />
                </View>
                <Text
                  style={[styles.itemTitle, { color: theme.colors.onSurface }]}
                >
                  {t("edit_profile")}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#C7C7CC"
              />
            </Pressable>
            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.1)"
                    : "#f0f0f0",
                },
              ]}
            />
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push("/favorites" as any)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#FFEBEE" }]}>
                  <MaterialCommunityIcons
                    name="heart-outline"
                    size={22}
                    color="#E53935"
                  />
                </View>
                <Text
                  style={[styles.itemTitle, { color: theme.colors.onSurface }]}
                >
                  {t("my_favorites")}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#C7C7CC"
              />
            </Pressable>
            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.1)"
                    : "#f0f0f0",
                },
              ]}
            />
            <Pressable style={styles.menuItem} onPress={toggleLanguage}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#F3E5F5" }]}>
                  <MaterialCommunityIcons
                    name="translate"
                    size={22}
                    color="#8E24AA"
                  />
                </View>
                <Text
                  style={[styles.itemTitle, { color: theme.colors.onSurface }]}
                >
                  {t("language")}: {i18n.language.toUpperCase()}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#C7C7CC"
              />
            </Pressable>
          </Surface>

          <View style={{ marginTop: 24, marginBottom: 40, gap: 12 }}>
            <Button
              mode="outlined"
              onPress={handleLogout}
              textColor={theme.colors.primary}
              style={{ borderColor: theme.colors.outline }}
            >
              {t("logout")}
            </Button>

            <Button
              mode="contained"
              onPress={handleDeleteAccount}
              buttonColor={theme.colors.error}
              textColor="#fff"
            >
              {t("delete_account") ?? "Delete Account"}
            </Button>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 16,
                marginTop: 8,
              }}
            >
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.secondary,
                  textDecorationLine: "underline",
                }}
                onPress={() => openLink("https://travelling.app/privacy")}
              >
                Privacy Policy
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.secondary,
                  textDecorationLine: "underline",
                }}
                onPress={() => openLink("https://travelling.app/terms")}
              >
                Terms of Service
              </Text>
            </View>
          </View>
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
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    ...shadows.sm,
  },
  name: {
    fontWeight: "bold",
    marginTop: 12,
  },
  email: {
    // color handled dynamically
  },
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionBox: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemSubtitle: {
    fontSize: 12,
  },
  divider: {
    marginLeft: 64, // Indent divider to align with text
  },

  // Specific for Travel Vault
  vaultHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  docList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  docName: {
    marginLeft: 8,
    fontSize: 14,
  },
});
