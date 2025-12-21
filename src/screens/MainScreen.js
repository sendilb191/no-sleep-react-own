import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  Text,
  View,
  ScrollView,
  Button,
  Switch,
} from "react-native";
import TimerSection from "../components/TimerSection";
import DebugLogList from "../components/DebugLogList";
import useDeviceLock from "../hooks/useDeviceLock";
import { useLog } from "../context/LogContext";
import styles from "../styles/MainScreen.styles";

const MainScreen = () => {
  const {
    isAdmin,
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

  const { logs } = useLog();

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
          {showDebugSection && <DebugLogList logs={logs} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainScreen;
