import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const TimerSection = ({
  formatScheduledDuration,
  isLockScheduled,
  scheduledRemainingMs,
  formatRemainingTime,
  openTimePicker,
  cancelScheduledLock,
  scheduleLock,
}) => {
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
});

export default TimerSection;
