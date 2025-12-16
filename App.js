import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Button,
  NativeModules,
  NativeEventEmitter,
  Alert,
  AppState,
  ScrollView,
} from "react-native";

const { DeviceLock } = NativeModules;

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const intervalRef = useRef(null);
  const hasPromptedForAdmin = useRef(false);
  const [debugLogs, setDebugLogs] = useState([]);

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
          appendLog(`lockDevice error: ${error?.message ?? "unknown"}`);
          Alert.alert(
            "Unable to lock device",
            error?.message ?? "Failed to lock the device."
          );
        }
      }
    } else {
      appendLog("lockDevice -> DeviceLock module missing");
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
