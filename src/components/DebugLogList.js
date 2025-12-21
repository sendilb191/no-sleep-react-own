import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { useLog } from "../context/LogContext";
import styles from "../styles/DebugLogList.styles";

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

export default DebugLogList;
