import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { List, Text, useTheme } from "react-native-paper";

const FAQ_DATA = [
  {
    id: "1",
    question: "How do I book a trip?",
    answer:
      "To book a trip, navigate to the Home screen, browse the available packages, select one you like, and tap on 'Details'. From there, click 'Book Now' to proceed with payment.",
  },
  {
    id: "2",
    question: "Can I cancel my booking?",
    answer:
      "Yes, you can cancel your booking from the 'My Trips' section. Please check the refund policy for the specific package as cancellation fees may apply.",
  },
  {
    id: "3",
    question: "What payment methods are accepted?",
    answer:
      "We accept major credit cards (Visa, MasterCard, Amex) and digital wallets via our secure payment partner Airwallex.",
  },
  {
    id: "4",
    question: "How do I contact support?",
    answer:
      "You can contact support by creating a ticket in the 'Support' section of the app, or by emailing us directly at support@travelling.com.",
  },
  {
    id: "5",
    question: "Is my payment information secure?",
    answer:
      "Absolutely. We use industry-standard encryption and do not store your card details on our servers. All payments are processed securely by Airwallex.",
  },
];

export default function FAQScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Frequently Asked Questions",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.onBackground },
          headerTintColor: theme.colors.primary,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[styles.header, { borderBottomColor: theme.colors.outline }]}
        >
          <MaterialCommunityIcons
            name="comment-question-outline"
            size={48}
            color={theme.colors.primary}
          />
          <Text
            variant="titleLarge"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Help Center
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Find answers to common questions about your bookings and account.
          </Text>
        </View>

        <List.Section>
          {FAQ_DATA.map((item) => (
            <List.Accordion
              key={item.id}
              title={item.question}
              titleNumberOfLines={2}
              titleStyle={[styles.question, { color: theme.colors.onSurface }]}
              style={[
                styles.accordion,
                {
                  backgroundColor: theme.colors.surface,
                  borderBottomColor: theme.colors.outline,
                },
              ]}
              theme={{ colors: { primary: theme.colors.primary } }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="help-circle-outline"
                  color={theme.colors.primary}
                />
              )}
            >
              <View
                style={[
                  styles.answerContainer,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.answer,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.answer}
                </Text>
              </View>
            </List.Accordion>
          ))}
        </List.Section>

        <View style={styles.contactSection}>
          <Text
            style={[styles.contactTitle, { color: theme.colors.onBackground }]}
          >
            Still need help?
          </Text>
          <TouchableOpacity
            style={[
              styles.contactButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => router.push("/support/create")}
          >
            <Text
              style={[
                styles.contactButtonText,
                { color: theme.colors.onPrimary },
              ]}
            >
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  title: {
    marginTop: 16,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
    maxWidth: "80%",
  },
  accordion: {
    borderBottomWidth: 1,
  },
  question: {
    fontWeight: "600",
  },
  answerContainer: {
    padding: 16,
  },
  answer: {
    lineHeight: 22,
  },
  contactSection: {
    padding: 24,
    alignItems: "center",
    marginTop: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  contactButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
