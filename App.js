import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Button,
  NativeModules,
  Pressable,
  NativeEventEmitter,
  Alert,
  AppState,
  ScrollView,
} from "react-native";

const { DeviceLock } = NativeModules;

const HOURS_OPTIONS = [1, 2, 3, 4, 5];
const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const intervalRef = useRef(null);
  const hasPromptedForAdmin = useRef(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const countdownIntervalRef = useRef(null);
  const [selectedHours, setSelectedHours] = useState(HOURS_OPTIONS[0]);
  const [selectedMinutes, setSelectedMinutes] = useState(MINUTE_OPTIONS[0]);
  const [isLockScheduled, setIsLockScheduled] = useState(false);
  const [scheduledRemainingMs, setScheduledRemainingMs] = useState(0);

  const appendLog = useCallback((message) => {
    const timestamp = new Date().toISOString();
    setDebugLogs((prev) => [`${timestamp} - ${message}`, ...prev].slice(0, 50));
  }, []);

  const checkAdminStatus = useCallback(async () => {
    if (DeviceLock && DeviceLock.isAdminActive) {
      try {
        const active = await DeviceLock.isAdminActive();
        const enabled = Boolean(active);
        setIsAdmin(enabled);
        appendLog(`checkAdminStatus -> ${enabled ? "ACTIVE" : "INACTIVE"}`);
        return enabled;
      } catch (error) {
        console.error("Error checking admin status:", error);
        appendLog(`checkAdminStatus error: ${error?.message ?? "unknown"}`);
      }
    }

    setIsAdmin(false);
    appendLog("checkAdminStatus -> fallback INACTIVE");
    return false;
  }, [appendLog]);

  const promptForAdmin = useCallback(async () => {
    if (DeviceLock && DeviceLock.requestAdminPermission) {
      try {
        const granted = await DeviceLock.requestAdminPermission();
        if (granted) {
          setIsAdmin(true);
          appendLog("promptForAdmin -> granted");
        } else {
          appendLog("promptForAdmin -> launched settings (waiting for result)");
          setTimeout(() => {
            checkAdminStatus();
          }, 500);
        }
        return granted;
      } catch (error) {
        console.error("Error requesting admin permission:", error);
        appendLog(`promptForAdmin error: ${error?.message ?? "unknown"}`);
        throw error;
      }
    }

    return false;
  }, [checkAdminStatus, appendLog]);

  useEffect(() => {
    if (!DeviceLock) {
      return undefined;
    }

    const emitter = new NativeEventEmitter(DeviceLock);
    const subscription = emitter.addListener("DeviceLockLog", (message) => {
      appendLog(`[native] ${message}`);
    });

    return () => {
      subscription.remove();
    };
  }, [appendLog]);

  useEffect(() => {
    (async () => {
      const active = await checkAdminStatus();
      if (!active && !hasPromptedForAdmin.current) {
        hasPromptedForAdmin.current = true;
        appendLog("Initial admin check inactive -> prompting user");
        try {
          await promptForAdmin();
        } catch (error) {
          Alert.alert("Error", "Failed to open device admin settings.");
          appendLog("Initial prompt failed to launch settings");
        }
      }
    })();
  }, [checkAdminStatus, promptForAdmin, appendLog]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        appendLog("AppState change -> active, refreshing admin state");
        checkAdminStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [appendLog, checkAdminStatus]);

  useEffect(() => {
    if (!isStopwatchRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedMs((prev) => prev + 1000);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStopwatchRunning]);

  const formatElapsedTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const startStopwatch = () => {
    if (!isStopwatchRunning) {
      setIsStopwatchRunning(true);
    }
  };

  const pauseStopwatch = () => {
    if (isStopwatchRunning) {
      setIsStopwatchRunning(false);
    }
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setElapsedMs(0);
  };

  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const resetScheduledLockState = useCallback(() => {
    stopCountdown();
    setIsLockScheduled(false);
    setScheduledRemainingMs(0);
  }, [stopCountdown]);

  const formatScheduledDuration = useCallback(() => {
    const hoursText = `${selectedHours}h`;
    const minutesText = `${selectedMinutes}m`;
    return `${hoursText} ${minutesText}`;
  }, [selectedHours, selectedMinutes]);

  const formatRemainingTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const lockDevice = useCallback(async () => {
    if (isLockScheduled) {
      appendLog("lockDevice -> cancelling scheduled lock before execution");
      resetScheduledLockState();
    }

    if (!DeviceLock || !DeviceLock.lockNow) {
      appendLog("lockDevice -> DeviceLock module missing");
      Alert.alert("Warning", "Device lock functionality is not available.");
      return;
    }

    try {
      await DeviceLock.lockNow();
      setIsAdmin(true);
      appendLog("lockDevice -> success");
    } catch (error) {
      if (error?.code === "DEVICE_ADMIN_NOT_ACTIVE") {
        appendLog("lockDevice -> admin not active, prompting");
        Alert.alert(
          "Device Administrator Required",
          "This app needs device administrator permission to lock your device.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Grant Permission",
              onPress: async () => {
                try {
                  hasPromptedForAdmin.current = true;
                  appendLog("User tapped Grant Permission");
                  await promptForAdmin();
                } catch (e) {
                  appendLog("Grant Permission flow failed");
                  Alert.alert("Error", "Failed to open device admin settings.");
                }
              },
            },
          ]
        );
      } else {
        appendLog(`lockDevice error: ${error?.message ?? "unknown"}`);
        Alert.alert(
          "Unable to lock device",
          error?.message ?? "Failed to lock the device."
        );
      }
    }
  }, [appendLog, isLockScheduled, promptForAdmin, resetScheduledLockState]);

  const scheduleLock = useCallback(() => {
    if (!DeviceLock || !DeviceLock.lockNow) {
      appendLog("scheduleLock -> DeviceLock module missing");
      Alert.alert(
        "Warning",
        "Device lock functionality is not available on this device."
      );
      return;
    }

    const totalMinutes = selectedHours * 60 + selectedMinutes;
    if (totalMinutes <= 0) {
      appendLog("scheduleLock -> invalid duration");
      Alert.alert(
        "Invalid duration",
        "Select at least one minute before activating the app lock."
      );
      return;
    }

    stopCountdown();

    const totalMs = totalMinutes * 60 * 1000;
    setScheduledRemainingMs(totalMs);
    setIsLockScheduled(true);
    appendLog(`Scheduled lock in ${formatScheduledDuration()}`);

    countdownIntervalRef.current = setInterval(() => {
      setScheduledRemainingMs((prev) => Math.max(prev - 1000, 0));
    }, 1000);
  }, [
    DeviceLock,
    appendLog,
    formatScheduledDuration,
    selectedHours,
    selectedMinutes,
    stopCountdown,
  ]);

  const cancelScheduledLock = useCallback(() => {
    if (!isLockScheduled) {
      return;
    }

    resetScheduledLockState();
    appendLog("Scheduled lock cancelled");
  }, [appendLog, isLockScheduled, resetScheduledLockState]);

  useEffect(() => {
    if (isLockScheduled && scheduledRemainingMs === 0) {
      stopCountdown();
      setIsLockScheduled(false);
      appendLog("Scheduled lock countdown reached zero");
      lockDevice();
    }
  }, [
    appendLog,
    isLockScheduled,
    lockDevice,
    scheduledRemainingMs,
    stopCountdown,
  ]);

  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        <Text style={styles.title}>Hello! 👋</Text>
        <Text style={styles.name}>Sendil Bala</Text>
        <Text style={styles.subtitle}>Welcome to my React Native App</Text>
        {!isAdmin && (
          <Text style={styles.warning}>
            ⚠️ Device admin permission required
          </Text>
        )}
        <View style={styles.stopwatchContainer}>
          <Text style={styles.stopwatchLabel}>Stopwatch</Text>
          <Text style={styles.stopwatchValue}>
            {formatElapsedTime(elapsedMs)}
          </Text>
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <Button
                title="Start"
                onPress={startStopwatch}
                disabled={isStopwatchRunning}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title="Pause"
                onPress={pauseStopwatch}
                disabled={!isStopwatchRunning}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title="Reset"
                onPress={resetStopwatch}
                disabled={!elapsedMs && !isStopwatchRunning}
              />
            </View>
          </View>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerTitle}>Timed App Lock</Text>
          <Text style={styles.timerDescription}>
            Choose how long to wait before the app locks the device
            automatically.
          </Text>
          <Text style={styles.selectorLabel}>Hours</Text>
          <View style={styles.selectorRow}>
            {HOURS_OPTIONS.map((option) => {
              const isSelected = selectedHours === option;
              return (
                <Pressable
                  key={`hours-${option}`}
                  onPress={() => setSelectedHours(option)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {`${option}h`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.selectorLabel}>Minutes</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectorScroll}
            contentContainerStyle={styles.selectorScrollContent}
          >
            {MINUTE_OPTIONS.map((option) => {
              const isSelected = selectedMinutes === option;
              return (
                <Pressable
                  key={`minutes-${option}`}
                  onPress={() => setSelectedMinutes(option)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {`${option.toString().padStart(2, "0")}m`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.timerSummary}>
            Selected duration: {formatScheduledDuration()}
          </Text>
          {isLockScheduled && (
            <Text style={styles.countdown}>
              Locking in {formatRemainingTime(scheduledRemainingMs)}
            </Text>
          )}
          <View style={styles.scheduleButtonWrapper}>
            <Button
              title={
                isLockScheduled ? "Cancel Scheduled Lock" : "Activate App Lock"
              }
              onPress={isLockScheduled ? cancelScheduledLock : scheduleLock}
            />
          </View>
        </View>
        <Button title="Lock Device" onPress={lockDevice} />
        <View style={styles.logsContainer}>
          <Text style={styles.logsTitle}>Debug Logs</Text>
          <ScrollView
            style={styles.logs}
            contentContainerStyle={styles.logsContent}
          >
            {debugLogs.length === 0 ? (
              <Text style={styles.logLine}>No logs yet</Text>
            ) : (
              debugLogs.map((log, index) => (
                <Text key={index} style={styles.logLine}>
                  {log}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  stopwatchContainer: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#F5F5F7",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  stopwatchLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  stopwatchValue: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 16,
  },
  timerContainer: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    padding: 20,
  },
  timerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0A1F44",
    marginBottom: 6,
  },
  timerDescription: {
    fontSize: 14,
    color: "#344054",
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A1F44",
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  selectorScroll: {
    maxHeight: 48,
    marginBottom: 16,
  },
  selectorScrollContent: {
    alignItems: "center",
    paddingRight: 4,
  },
  chip: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#B0C4FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  chipSelected: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  chipText: {
    fontSize: 14,
    color: "#1D4ED8",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  timerSummary: {
    fontSize: 14,
    color: "#0A1F44",
    marginBottom: 8,
    fontWeight: "500",
  },
  countdown: {
    fontSize: 16,
    color: "#DC2626",
    fontWeight: "600",
    marginBottom: 12,
  },
  scheduleButtonWrapper: {
    marginTop: 4,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 6,
    minWidth: 90,
  },
  logsContainer: {
    width: "100%",
    marginTop: 20,
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    padding: 12,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  logs: {
    width: "100%",
  },
  logsContent: {
    paddingBottom: 4,
  },
  logLine: {
    fontSize: 12,
    color: "#D1D1D6",
    marginBottom: 4,
    fontFamily: "monospace",
  },
});

export default App;
