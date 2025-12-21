import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useLog } from "../context/LogContext";

const DebugLogList = () => {
  const { logs, clearLogs } = useLog();

  const copyAllLogs = () => {
    if (logs.length === 0) {
      Alert.alert("No logs", "There are no logs to copy");
      return;
    }
    const logText = logs.join("\n");
    Clipboard.setString(logText);
    Alert.alert("Copied!", `${logs.length} log entries copied to clipboard`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Logs</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.copyButton} onPress={copyAllLogs}>
            <Text style={styles.buttonText}>📋 Copy</Text>
          </TouchableOpacity>
          {clearLogs && (
            <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
              <Text style={styles.buttonText}>🗑️ Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
      >
        {logs.length === 0 ? (
          <Text style={styles.logLine}>No logs yet</Text>
        ) : (
          logs.map((log, index) => (
            <Text key={index} style={styles.logLine} selectable={true}>
              {log}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
    maxHeight: 250,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  copyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  scroll: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 4,
  },
  logLine: {
    fontSize: 12,
    color: "#D1D1D6",
    marginBottom: 4,
    fontFamily: "monospace",
  },
});

export default DebugLogList;
