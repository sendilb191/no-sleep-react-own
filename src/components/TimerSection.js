import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, AppState } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import DebugLogList from "../components/DebugLogList";
import { useLog } from "../context/LogContext";
import BackgroundTimer from "react-native-background-timer";

const TimerSection = ({
  formatScheduledDuration,
  isLockScheduled,
  scheduledRemainingMs,
  formatRemainingTime,
  timePickerValue,
  onTimePickerChange,
  cancelScheduledLock,
  scheduleLock,
}) => {
  const [selectedTime, setSelectedTime] = useState(timePickerValue);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const { addLog } = useLog();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    try {
      if (isLockScheduled) {
        BackgroundTimer.runBackgroundTimer(() => {
          try {
            // Logic to handle the timer countdown
            if (scheduledRemainingMs <= 0) {
              BackgroundTimer.stopBackgroundTimer();
              scheduleLock();
            }
          } catch (error) {
            addLog(`Error in background timer logic: ${error.message}`);
          }
        }, 1000); // Run every second

        return () => {
          BackgroundTimer.stopBackgroundTimer();
          addLog("Background timer stopped.");
        };
      }
    } catch (error) {
      addLog(`Error initializing background timer: ${error.message}`);
    }
  }, [isLockScheduled, scheduledRemainingMs]);

  const openTimePicker = () => {
    setPickerVisible(true);
  };

  const onTimeChange = (event, selectedDate) => {
    setPickerVisible(false);
    if (selectedDate) {
      setSelectedTime(selectedDate);
      onTimePickerChange(null, selectedDate);
      addLog(
        `Time selected: ${selectedDate.getHours()}:${selectedDate.getMinutes()}`
      );
    } else {
      addLog("Time picker dismissed.");
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
      {isPickerVisible && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
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
      <DebugLogList />
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
