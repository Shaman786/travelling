import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Searchbar, Text, TouchableRipple, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export interface Country {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

// Common countries list (Expand as needed)
const COUNTRIES: Country[] = [
  { name: "India", code: "IN", dial_code: "+91", flag: "🇮🇳" },
  { name: "United States", code: "US", dial_code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dial_code: "+44", flag: "🇬🇧" },
  { name: "United Arab Emirates", code: "AE", dial_code: "+971", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "SA", dial_code: "+966", flag: "🇸🇦" },
  { name: "Qatar", code: "QA", dial_code: "+974", flag: "🇶🇦" },
  { name: "Singapore", code: "SG", dial_code: "+65", flag: "🇸🇬" },
  { name: "Malaysia", code: "MY", dial_code: "+60", flag: "🇲🇾" },
  { name: "Thailand", code: "TH", dial_code: "+66", flag: "🇹🇭" },
  { name: "Indonesia", code: "ID", dial_code: "+62", flag: "🇮🇩" },
  { name: "Australia", code: "AU", dial_code: "+61", flag: "🇦🇺" },
  { name: "Canada", code: "CA", dial_code: "+1", flag: "🇨🇦" },
  { name: "Germany", code: "DE", dial_code: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dial_code: "+33", flag: "🇫🇷" },
  { name: "Kuwait", code: "KW", dial_code: "+965", flag: "🇰🇼" },
  { name: "Oman", code: "OM", dial_code: "+968", flag: "🇴🇲" },
  { name: "Bahrain", code: "BH", dial_code: "+973", flag: "🇧🇭" },
];

interface CountryCodePickerProps {
  value: string;
  onSelect: (country: Country) => void;
  visible: boolean;
  onDismiss: () => void;
}

export function CountryCodePicker({
  value,
  onSelect,
  visible,
  onDismiss,
}: CountryCodePickerProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter countries
  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dial_code.includes(searchQuery)
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            Select Country Code
          </Text>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>

        <Searchbar
          placeholder="Search country or code"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          elevation={0}
        />

        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableRipple
              onPress={() => {
                onSelect(item);
                onDismiss();
                setSearchQuery("");
              }}
            >
              <View style={styles.item}>
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={[styles.code, { color: theme.colors.outline }]}>
                  {item.dial_code}
                </Text>
              </View>
            </TouchableRipple>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBar: {
    margin: 16,
    backgroundColor: "#f5f5f5",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  code: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
