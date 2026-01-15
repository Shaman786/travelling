import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  Modal,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";

interface SortSheetProps {
  visible: boolean;
  onDismiss: () => void;
  currentSort: string;
  onApply: (sort: string) => void;
}

const SORT_OPTIONS = [
  { label: "Recommended", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

export default function SortSheet({
  visible,
  onDismiss,
  currentSort,
  onApply,
}: SortSheetProps) {
  const theme = useTheme();
  const [tempSort, setTempSort] = useState(currentSort);

  // Sync temp sort when visibility or prop changes
  useEffect(() => {
    if (visible) {
      setTempSort(currentSort);
    }
  }, [visible, currentSort]);

  const handleApply = () => {
    onApply(tempSort);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            Sort By
          </Text>
        </View>
        <Divider />
        <View style={styles.content}>
          <RadioButton.Group
            value={tempSort}
            onValueChange={(v) => setTempSort(v)}
          >
            {SORT_OPTIONS.map((opt) => (
              <RadioButton.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
                mode="android"
                position="leading"
                labelStyle={{ textAlign: "left" }}
                color={theme.colors.primary}
              />
            ))}
          </RadioButton.Group>
        </View>
        <Divider />
        <View style={styles.footer}>
          <Button mode="contained" onPress={handleApply}>
            Apply
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 16,
    // Max height handling if needed, but sort list is short
  },
  header: {
    padding: 16,
    alignItems: "center",
  },
  content: {
    paddingVertical: 8,
  },
  footer: {
    padding: 16,
  },
});
