import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface StepTrackerProps {
  currentStatus: string;
}

const StepTracker = ({ currentStatus }: StepTrackerProps) => {
  const theme = useTheme();

  // Determine current step index based on status string
  const getStepIndex = (status: string) => {
    switch (status) {
      case "processing":
      case "confirmed":
        return 0;
      case "visa_approved":
        return 1; // Assuming mapping
      case "ready_to_fly":
        return 2;
      case "completed":
        return 3;
      default:
        return 0;
    }
  };

  const steps = [
    {
      title: "Booking Confirmed",
      status: "completed" as const,
      description: "Your trip is locked in.",
    },
    {
      title: "Visa Processing",
      status: "current" as const,
      description: "Documents under review.",
    },
    {
      title: "Ready to Fly",
      status: "upcoming" as const,
      description: "Pack your bags!",
    },
    {
      title: "Trip Completed",
      status: "upcoming" as const,
      description: "Hope you had fun!",
    },
  ];

  const activeIndex = getStepIndex(currentStatus);

  // Update statuses dynamically
  // Update statuses dynamically
  const dynamicSteps = steps.map((step, index) => ({
    ...step,
    status: (index < activeIndex
      ? "completed"
      : index === activeIndex
        ? "current"
        : "upcoming") as "completed" | "current" | "upcoming",
    date: undefined,
  }));

  return (
    <View style={styles.container}>
      {dynamicSteps.map((step, index) => {
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
