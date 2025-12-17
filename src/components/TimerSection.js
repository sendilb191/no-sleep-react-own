import React, { useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { TimePickerAndroid } from "react-native";

const TimerSection = ({
  formatScheduledDuration,
  isLockScheduled,
  scheduledRemainingMs,
  formatRemainingTime,
  showTimePicker,
  isTimePickerVisible,
  timePickerValue,
  onTimePickerChange,
  cancelScheduledLock,
  scheduleLock,
}) => {
  const [selectedTime, setSelectedTime] = useState(timePickerValue);
  const [debugLogs, setDebugLogs] = useState([]);

  const logDebug = (message) => {
    setDebugLogs((prevLogs) => [...prevLogs, message]);
  };

  const openTimePicker = async () => {
    try {
      logDebug("Opening time picker...");
      const { action, hour, minute } = await TimePickerAndroid.open({
        hour: selectedTime.getHours(),
        minute: selectedTime.getMinutes(),
        is24Hour: true,
      });
      if (action !== TimePickerAndroid.dismissedAction) {
        const newTime = new Date();
        newTime.setHours(hour);
        newTime.setMinutes(minute);
        setSelectedTime(newTime);
        onTimePickerChange(null, newTime);
        logDebug(`Time selected: ${hour}:${minute}`);
      } else {
        logDebug("Time picker dismissed.");
      }
    } catch (error) {
      logDebug(`Error opening time picker: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timed App Lock</Text>
      <Text style={styles.description}>
        Choose a delay (up to 24 hours with 1-minute precision) before the app
        locks the device automatically.
      </Text>
      <Text style={styles.label}>Delay</Text>
      <Text style={styles.summary}>
        Selected duration: {formatScheduledDuration()}
      </Text>
      <View style={styles.timePickerWrapper}>
        <Button title="Pick Delay" onPress={openTimePicker} />
      </View>
      {isLockScheduled && (
        <Text style={styles.countdown}>
          Locking in {formatRemainingTime(scheduledRemainingMs)}
        </Text>
      )}
      <View style={styles.actionWrapper}>
        <Button
          title={
            isLockScheduled ? "Cancel Scheduled Lock" : "Activate App Lock"
          }
          onPress={isLockScheduled ? cancelScheduledLock : scheduleLock}
        />
      </View>
      <ScrollView style={styles.debugView}>
        <Text style={styles.debugTitle}>Debug Logs:</Text>
        {debugLogs.map((log, index) => (
          <Text key={index} style={styles.debugLog}>{`[${
            index + 1
          }] ${log}`}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0A1F44",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#344054",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A1F44",
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: "#0A1F44",
    marginBottom: 8,
    fontWeight: "500",
  },
  timePickerWrapper: {
    marginBottom: 12,
  },
  countdown: {
    fontSize: 16,
    color: "#DC2626",
    fontWeight: "600",
    marginBottom: 12,
  },
  actionWrapper: {
    marginTop: 4,
    marginBottom: 8,
  },
  debugView: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    maxHeight: 150,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  debugLog: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
});

export default TimerSection;
