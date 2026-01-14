import React from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Modal, Portal, Text, useTheme } from "react-native-paper";

interface TravelerSelectorProps {
  visible: boolean;
  onDismiss: () => void;
  adults: number;
  setAdults: (count: number) => void;
  childrenCount: number;
  setChildren: (count: number) => void;
  infants: number;
  setInfants: (count: number) => void;
}

export default function TravelerSelector({
  visible,
  onDismiss,
  adults,
  setAdults,
  childrenCount,
  setChildren,
  infants,
  setInfants,
}: TravelerSelectorProps) {
  const theme = useTheme();

  /* const totalTravelers = adults + childrenCount + infants; */

  const renderCounter = (
    label: string,
    subLabel: string,
    value: number,
    onChange: (delta: number) => void,
    min: number = 0,
    max: number = 10
  ) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
          {label}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
          {subLabel}
        </Text>
      </View>
      <View style={styles.counter}>
        <IconButton
          icon="minus"
          mode="outlined"
          size={16}
          onPress={() => onChange(-1)}
          disabled={value <= min}
        />
        <Text
          variant="titleMedium"
          style={{ width: 30, textAlign: "center", fontWeight: "bold" }}
        >
          {value}
        </Text>
        <IconButton
          icon="plus"
          mode="outlined"
          size={16}
          onPress={() => onChange(1)}
          disabled={value >= max}
        />
      </View>
    </View>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text variant="titleLarge" style={styles.title}>
          Select Travelers
        </Text>

        {renderCounter(
          "Adults",
          "Age 12+",
          adults,
          (delta) => setAdults(adults + delta),
          1
        )}
        {renderCounter("Children", "Age 2-11", childrenCount, (delta) =>
          setChildren(childrenCount + delta)
        )}
        {renderCounter("Infants", "Under 2", infants, (delta) =>
          setInfants(infants + delta)
        )}

        {infants > adults && (
          <Text
            style={{ color: theme.colors.error, marginTop: 8, fontSize: 12 }}
          >
            * Each infant requires an adult
          </Text>
        )}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 24,
    margin: 20,
    borderRadius: 16,
    elevation: 4,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
  },
});
