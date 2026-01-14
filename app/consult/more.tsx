import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Divider, List, Text, useTheme } from "react-native-paper";
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
          description="Get best rates for your travel"
          left={(props) => <List.Icon {...props} icon="currency-usd" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            router.push({
              pathname: "/support/create",
              params: { subject: "Forex Card Inquiry" },
            })
          }
        />
        <Divider />
        <List.Item
          title="Airport Transfers"
          description="Book a cab for your arrival"
          left={(props) => <List.Icon {...props} icon="car" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            router.push({
              pathname: "/support/create",
              params: { subject: "Airport Transfer Booking" },
            })
          }
        />
        <Divider />
        <List.Item
          title="Gift Cards"
          description="Gift a travel experience"
          left={(props) => <List.Icon {...props} icon="gift" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() =>
            router.push({
              pathname: "/support/create",
              params: { subject: "Gift Card Purchase" },
            })
          }
        />
        <Divider />
        <List.Item
          title="Contact Support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push("/support")}
        />
      </List.Section>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1 } });
