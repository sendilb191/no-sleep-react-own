import React, { useState, useCallback } from "react";
import { View, Text, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLog } from "../context/LogContext";
import styles from "../styles/TimerSection.styles";

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
  const { addLog } = useLog();

  // Note: The countdown timer logic is handled in useDeviceLock hook.
  // This component only handles the UI for time selection and display.

  const openTimePicker = useCallback(() => {
    setPickerVisible(true);
    addLog("Opening time picker");
  }, [addLog]);

  const onTimeChange = useCallback(
    (event, selectedDate) => {
      setPickerVisible(false);
      if (event?.type === "dismissed") {
        addLog("Time picker dismissed.");
        return;
      }
      if (selectedDate) {
        setSelectedTime(selectedDate);
        onTimePickerChange(event, selectedDate);
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
        addLog(`Time selected: ${hours}:${minutes}`);
      }
    },
    [onTimePickerChange, addLog]
  );

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
    </View>
  );
};

export default TimerSection;
