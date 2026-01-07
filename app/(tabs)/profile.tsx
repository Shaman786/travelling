import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/hooks/useAuth";
import { useStore } from "../../src/store/useStore";

interface UploadedFile {
  name: string;
  uri: string;
  size?: number;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useStore(); // Keep user from store
  const { logout } = useAuth(); // Use useAuth for proper server logout
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  const handleLogout = async () => {
    await logout(); // This now calls authService.logout() to delete server session
    router.replace("/(auth)/login");
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
    } catch (err) {
      console.log("Document Picker Error", err);
    }
  };

  // WhatsApp support - configure number in Admin Dashboard
  const openWhatsApp = () => {
    // TODO: Get support number from backend/config
    const supportNumber = ""; // Configure via Admin Dashboard
    if (!supportNumber) {
      alert(
        "WhatsApp support not configured. Please use the Support Tickets feature."
      );
      return;
    }
    const message = "Hello! I need help with my travel booking.";
    const url = `whatsapp://send?phone=${supportNumber}&text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(url).catch(() => {
      alert("WhatsApp is not installed on this device.");
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
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
            {user?.email || "guest@travelling.app"}
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          {/* Travel Vault */}
          <Card style={styles.card} mode="elevated">
            <Card.Title
              title="Travel Vault"
              subtitle="Store passports, visas & IDs"
              left={(props) => (
                <Avatar.Icon
                  {...props}
                  icon="safe"
                  style={{ backgroundColor: theme.colors.primary }}
                />
              )}
            />
            <Card.Content>
              {documents.length === 0 ? (
                <Text variant="bodySmall" style={styles.emptyText}>
                  No documents uploaded yet.
                </Text>
              ) : (
                documents.map((doc, idx) => (
                  <View key={idx} style={styles.docItem}>
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
                  </View>
                ))
              )}
              <Button
                mode="outlined"
                onPress={handleUpload}
                icon="cloud-upload"
                style={styles.actionBtn}
              >
                Upload Document
              </Button>
            </Card.Content>
          </Card>

          {/* Expert Support */}
          <Card style={[styles.card, { marginTop: 16 }]} mode="elevated">
            <Card.Content style={styles.supportContent}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                  Need Help?
                </Text>
                <Text variant="bodySmall">
                  Chat with our travel experts instantly via WhatsApp.
                </Text>
              </View>
              <IconButton
                icon="whatsapp"
                mode="contained"
                containerColor="#25D366"
                iconColor="#fff"
                size={30}
                onPress={openWhatsApp}
              />
            </Card.Content>
          </Card>

          {/* Account Actions */}
          <Surface style={styles.menuContainer} elevation={0}>
            <List.Section>
              <List.Subheader>Account Settings</List.Subheader>
              <List.Item
                title="Edit Profile"
                left={(props) => (
                  <List.Icon {...props} icon="account-edit-outline" />
                )}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/profile/edit" as any)}
              />
              <List.Item
                title="My Favorites"
                left={(props) => <List.Icon {...props} icon="heart" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/favorites" as any)}
              />
              <List.Item
                title="Change Password"
                left={(props) => <List.Icon {...props} icon="lock-reset" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/profile/change-password" as any)}
              />
              <List.Item
                title="Support Tickets"
                left={(props) => <List.Icon {...props} icon="ticket-account" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/support" as any)}
              />
              <Divider />
              <List.Item
                title="Logout"
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
    elevation: 2,
    marginBottom: 20,
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
    borderRadius: 12,
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
    textAlign: "center",
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F5F7FA",
    padding: 8,
    borderRadius: 8,
  },
  docName: {
    marginLeft: 8,
    flex: 1,
  },
  actionBtn: {
    marginTop: 10,
    borderColor: "#0056D2",
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
