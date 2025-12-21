import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import styles from "../styles/TimerSection.styles";

const DropdownSelect = ({ label, value, options, onSelect, disabled }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <Text style={styles.dropdownButtonText}>
          {value.toString().padStart(2, "0")}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.toString()}
              style={styles.optionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item && styles.optionItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item && styles.optionTextSelected,
                    ]}
                  >
                    {item.toString().padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const TimerSection = ({
  selectedHours,
  selectedMinutes,
  onHoursChange,
  onMinutesChange,
  isLockScheduled,
  scheduledRemainingMs,
  formatRemainingTime,
  cancelScheduledLock,
  scheduleLock,
  lockDevice,
}) => {
  const hasTimeSelected = selectedHours > 0 || selectedMinutes > 0;

  // Generate hours options (0-23)
  const hoursOptions = Array.from({ length: 24 }, (_, i) => i);

  // Generate minutes options (0-59)
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Lock Timer</Text>
      <Text style={styles.description}>
        Select how long before your device automatically locks
      </Text>

      {/* Dropdowns Row */}
      <View style={styles.pickersRow}>
        <DropdownSelect
          label="Hours"
          value={selectedHours}
          options={hoursOptions}
          onSelect={onHoursChange}
          disabled={isLockScheduled}
        />
        <DropdownSelect
          label="Minutes"
          value={selectedMinutes}
          options={minutesOptions}
          onSelect={onMinutesChange}
          disabled={isLockScheduled}
        />
      </View>

      {/* Countdown Display */}
      {isLockScheduled && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>Locking in</Text>
          <Text style={styles.countdown}>
            {formatRemainingTime(scheduledRemainingMs)}
          </Text>
        </View>
      )}

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isLockScheduled
            ? styles.cancelButton
            : hasTimeSelected
            ? styles.activeButton
            : styles.disabledButton,
        ]}
        onPress={isLockScheduled ? cancelScheduledLock : scheduleLock}
        disabled={!isLockScheduled && !hasTimeSelected}
      >
        <Text
          style={[
            styles.actionButtonText,
            !isLockScheduled && !hasTimeSelected && styles.disabledButtonText,
          ]}
        >
          {isLockScheduled ? "Cancel Timer" : "Start Timer"}
        </Text>
      </TouchableOpacity>

      {/* Test Lock Button */}
      <TouchableOpacity style={styles.testButton} onPress={lockDevice}>
        <Text style={styles.testButtonText}>🔒 Test Lock (Lock Now)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TimerSection;
