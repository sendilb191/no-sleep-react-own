import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useLog } from "../context/LogContext";

const DebugLogList = () => {
  const { logs } = useLog();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Logs</Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
      >
        {logs.length === 0 ? (
          <Text style={styles.logLine}>No logs yet</Text>
        ) : (
          logs.map((log, index) => (
            <Text key={index} style={styles.logLine}>
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
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
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
