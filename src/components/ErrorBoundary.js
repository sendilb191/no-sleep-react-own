import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  getErrorText = () => {
    const { error, errorInfo } = this.state;
    let text = "=== ERROR REPORT ===\n\n";
    text += `Error: ${error?.toString() || "Unknown error"}\n\n`;
    text += `Stack: ${error?.stack || "No stack trace"}\n\n`;
    text += `Component Stack: ${
      errorInfo?.componentStack || "No component stack"
    }`;
    return text;
  };

  copyError = () => {
    const errorText = this.getErrorText();
    Clipboard.setString(errorText);
    Alert.alert("Copied!", "Error details copied to clipboard");
  };

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>⚠️ Something went wrong</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>Error Message:</Text>
            <Text style={styles.errorText} selectable={true}>
              {this.state.error?.toString() || "Unknown error"}
            </Text>

            <Text style={styles.sectionTitle}>Stack Trace:</Text>
            <Text style={styles.stackText} selectable={true}>
              {this.state.error?.stack || "No stack trace available"}
            </Text>

            {this.state.errorInfo && (
              <>
                <Text style={styles.sectionTitle}>Component Stack:</Text>
                <Text style={styles.stackText} selectable={true}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.copyButton]}
              onPress={this.copyError}
            >
              <Text style={styles.buttonText}>📋 Copy All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={this.resetError}
            >
              <Text style={styles.buttonText}>🔄 Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    padding: 16,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B6B",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontFamily: "monospace",
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 8,
  },
  stackText: {
    fontSize: 12,
    color: "#D1D1D6",
    fontFamily: "monospace",
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  copyButton: {
    backgroundColor: "#007AFF",
  },
  retryButton: {
    backgroundColor: "#34C759",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ErrorBoundary;
