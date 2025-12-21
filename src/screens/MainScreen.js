import React from "react";
import { SafeAreaView, StatusBar, Text, View, ScrollView } from "react-native";
import TimerSection from "../components/TimerSection";
import useDeviceLock from "../hooks/useDeviceLock";
import styles from "../styles/MainScreen.styles";

const MainScreen = () => {
  const {
    isAdmin,
    isLockScheduled,
    scheduledRemainingMs,
    formatRemainingTime,
    selectedHours,
    selectedMinutes,
    setSelectedHours,
    setSelectedMinutes,
    cancelScheduledLock,
    scheduleLock,
    lockDevice,
  } = useDeviceLock();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>NoSleep App 😴</Text>
          <Text style={styles.subtitle}>
            Schedule your device to lock after a set time
          </Text>
          {!isAdmin && (
            <Text style={styles.warning}>
              ⚠️ Device admin permission required
            </Text>
          )}
          <TimerSection
            selectedHours={selectedHours}
            selectedMinutes={selectedMinutes}
            onHoursChange={setSelectedHours}
            onMinutesChange={setSelectedMinutes}
            isLockScheduled={isLockScheduled}
            scheduledRemainingMs={scheduledRemainingMs}
            formatRemainingTime={formatRemainingTime}
            cancelScheduledLock={cancelScheduledLock}
            scheduleLock={scheduleLock}
            lockDevice={lockDevice}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MainScreen;
