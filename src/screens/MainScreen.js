import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  Switch,
} from "react-native";
import TimerSection from "../components/TimerSection";
import DebugLogList from "../components/DebugLogList";
import useDeviceLock from "../hooks/useDeviceLock";

const MainScreen = () => {
  const {
    isAdmin,
    debugLogs,
    isLockScheduled,
    scheduledRemainingMs,
    formatScheduledDuration,
    formatRemainingTime,
    showTimePicker,
    isTimePickerVisible,
    timePickerValue,
    handleTimePickerChange,
    cancelScheduledLock,
    scheduleLock,
    lockDevice,
  } = useDeviceLock();

  const [showDebugSection, setShowDebugSection] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Hello! 👋</Text>
          <Text style={styles.name}>Sendil Bala</Text>
          <Text style={styles.subtitle}>Welcome to my React Native App</Text>
          {!isAdmin && (
            <Text style={styles.warning}>
              ⚠️ Device admin permission required
            </Text>
          )}
          <TimerSection
            formatScheduledDuration={formatScheduledDuration}
            isLockScheduled={isLockScheduled}
            scheduledRemainingMs={scheduledRemainingMs}
            formatRemainingTime={formatRemainingTime}
            showTimePicker={showTimePicker}
            isTimePickerVisible={isTimePickerVisible}
            timePickerValue={timePickerValue}
            onTimePickerChange={handleTimePickerChange}
            cancelScheduledLock={cancelScheduledLock}
            scheduleLock={scheduleLock}
          />
          <Button title="Lock Device" onPress={lockDevice} />
          <View style={styles.debugToggleRow}>
            <Text style={styles.debugToggleLabel}>Show Debug Logs</Text>
            <Switch
              value={showDebugSection}
              onValueChange={setShowDebugSection}
            />
          </View>
          {showDebugSection && <DebugLogList logs={debugLogs} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  name: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  warning: {
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  debugToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  debugToggleLabel: {
    fontSize: 14,
    color: "#0A1F44",
    fontWeight: "500",
  },
});

export default MainScreen;
