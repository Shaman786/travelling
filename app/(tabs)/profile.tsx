import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  List,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../src/store/useStore";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useStore();

  const handleLogout = async () => {
    logout();
    router.replace("/");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Avatar.Image
          size={100}
          source={{ uri: user?.avatar || "https://i.pravatar.cc/300" }}
        />
        <Text variant="headlineMedium" style={styles.name}>
          {user?.name || "Guest User"}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email || "Sign in to sync your trips"}
        </Text>

        {!user && (
          <Button
            mode="contained"
            onPress={() => router.push("/")}
            style={styles.loginBtn}
          >
            Sign In / Register
          </Button>
        )}
      </View>

      <Surface style={styles.menuContainer} elevation={1}>
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Personal Information"
            left={(props) => <List.Icon {...props} icon="account-details" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Payment Methods"
            left={(props) => (
              <List.Icon {...props} icon="credit-card-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Travel Documents"
            left={(props) => <List.Icon {...props} icon="passport" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Settings</List.Subheader>
          <List.Item
            title="Notifications"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            onPress={() => {}}
          />
          <List.Item
            title="Help & Support"
            left={(props) => (
              <List.Icon {...props} icon="help-circle-outline" />
            )}
            onPress={() => {}}
          />
          <List.Item
            title="Logout"
            left={(props) => (
              <List.Icon {...props} icon="logout" color={theme.colors.error} />
            )}
            onPress={handleLogout}
            titleStyle={{ color: theme.colors.error }}
          />
        </List.Section>
      </Surface>
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
  },
  name: {
    fontWeight: "bold",
    marginTop: 16,
  },
  email: {
    color: "#666",
    marginBottom: 16,
  },
  loginBtn: {
    marginTop: 8,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 16,
  },
});
