import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { List, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={{ padding: 20 }}>
        <Text variant="headlineMedium" style={{ fontWeight: "bold" }}>
          More Services
        </Text>
      </View>
      <List.Section>
        <List.Item
          title="Forex Cards"
          left={(props) => <List.Icon {...props} icon="currency-usd" />}
          onPress={() => {}}
        />
        <List.Item
          title="Airport Transfers"
          left={(props) => <List.Icon {...props} icon="car" />}
          onPress={() => {}}
        />
        <List.Item
          title="Gift Cards"
          left={(props) => <List.Icon {...props} icon="gift" />}
          onPress={() => {}}
        />
        <List.Item
          title="Contact Support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          onPress={() => {}}
        />
      </List.Section>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1 } });
