import React, { Component, ErrorInfo, ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Surface, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRestart = () => {
    // Basic restart: clear error state.
    // For full restart, might need expo-updates or just let user close app.
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <Surface style={styles.surface} elevation={2}>
            <Text variant="headlineMedium" style={styles.title}>
              Oops! Something went wrong.
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              The application encountered an unexpected error.
            </Text>

            <ScrollView style={styles.errorBox}>
              <Text style={styles.errorText}>
                {this.state.error?.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text style={styles.stackTrace}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>

            <Button
              mode="contained"
              onPress={this.handleRestart}
              style={styles.button}
            >
              Try Again
            </Button>
          </Surface>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFEBEE", // Light red background
    justifyContent: "center",
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    maxHeight: "80%",
  },
  title: {
    color: "#D32F2F",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: "#D32F2F",
    fontWeight: "bold",
    marginBottom: 10,
  },
  stackTrace: {
    fontSize: 10,
    color: "#333",
    fontFamily: "monospace",
  },
  button: {
    width: "100%",
  },
});
