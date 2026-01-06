import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface Step {
  title: string;
  status: "completed" | "current" | "upcoming";
  date?: string;
  description?: string;
}

interface StepTrackerProps {
  steps: Step[];
}

const StepTracker = ({ steps }: StepTrackerProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        let iconName: any = "circle-outline";
        let color = theme.colors.outline;
        let lineColor = theme.colors.outlineVariant;

        if (step.status === "completed") {
          iconName = "check-circle";
          color = theme.colors.primary;
          lineColor = theme.colors.primary;
        } else if (step.status === "current") {
          iconName = "record-circle-outline";
          color = theme.colors.secondary;
          lineColor = theme.colors.outlineVariant;
        }

        return (
          <View key={index} style={styles.stepRow}>
            {/* Left Timeline Column */}
            <View style={styles.timelineCol}>
              <MaterialCommunityIcons name={iconName} size={24} color={color} />
              {!isLast && (
                <View style={[styles.line, { backgroundColor: lineColor }]} />
              )}
            </View>

            {/* Right Content Column */}
            <View style={styles.contentCol}>
              <Text
                variant="titleSmall"
                style={[
                  styles.title,
                  step.status === "current" && {
                    color: theme.colors.secondary,
                  },
                ]}
              >
                {step.title}
              </Text>
              {step.description && (
                <Text variant="bodySmall" style={styles.description}>
                  {step.description}
                </Text>
              )}
              {step.date && (
                <Text variant="labelSmall" style={styles.date}>
                  {step.date}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  stepRow: {
    flexDirection: "row",
    minHeight: 80, // Ensure space for line between steps
  },
  timelineCol: {
    alignItems: "center",
    width: 40,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    paddingBottom: 24, // Space between steps content
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    color: "#666",
    marginBottom: 4,
  },
  date: {
    opacity: 0.6,
  },
});

export default StepTracker;
