import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Button,
  NativeModules,
  Alert,
  AppState,
} from "react-native";

const { DeviceLock } = NativeModules;

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const intervalRef = useRef(null);
  const hasPromptedForAdmin = useRef(false);

  const checkAdminStatus = useCallback(async () => {
    if (DeviceLock && DeviceLock.isAdminActive) {
      try {
        const active = await DeviceLock.isAdminActive();
        const enabled = Boolean(active);
        setIsAdmin(enabled);
        return enabled;
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    }

    setIsAdmin(false);
    return false;
  }, []);

  const promptForAdmin = useCallback(async () => {
    if (DeviceLock && DeviceLock.requestAdminPermission) {
      try {
        const granted = await DeviceLock.requestAdminPermission();
        if (granted) {
          setIsAdmin(true);
        }
        return granted;
      } catch (error) {
        console.error("Error requesting admin permission:", error);
        throw error;
      }
    }

    return false;
  }, []);

  useEffect(() => {
    (async () => {
      const active = await checkAdminStatus();
      if (!active && !hasPromptedForAdmin.current) {
        hasPromptedForAdmin.current = true;
        try {
          await promptForAdmin();
        } catch (error) {
          Alert.alert("Error", "Failed to open device admin settings.");
        }
      }
    })();
  }, [checkAdminStatus, promptForAdmin]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        checkAdminStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [checkAdminStatus]);

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

  const lockDevice = async () => {
    if (DeviceLock && DeviceLock.lockNow) {
      try {
        await DeviceLock.lockNow();
        setIsAdmin(true);
      } catch (error) {
        if (error?.code === "DEVICE_ADMIN_NOT_ACTIVE") {
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
                    await promptForAdmin();
                  } catch (e) {
                    Alert.alert(
                      "Error",
                      "Failed to open device admin settings."
                    );
                  }
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "Unable to lock device",
            error?.message ?? "Failed to lock the device."
          );
        }
      }
    } else {
      Alert.alert("Warning", "Device lock functionality is not available.");
    }
  };

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
        <Button title="Lock Device" onPress={lockDevice} />
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
});

export default App;
