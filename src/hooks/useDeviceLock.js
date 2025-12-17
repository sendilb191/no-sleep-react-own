import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  AppState,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

const { DeviceLock } = NativeModules;

const useDeviceLock = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const hasPromptedForAdmin = useRef(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const countdownIntervalRef = useRef(null);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(1);
  const [isLockScheduled, setIsLockScheduled] = useState(false);
  const [scheduledRemainingMs, setScheduledRemainingMs] = useState(0);

  const appendLog = useCallback((message) => {
    const timestamp = new Date().toISOString();
    setDebugLogs((prev) => [`${timestamp} - ${message}`, ...prev].slice(0, 50));
  }, []);

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

  const checkAdminStatus = useCallback(async () => {
    if (DeviceLock && DeviceLock.isAdminActive) {
      try {
        const active = await DeviceLock.isAdminActive();
        const enabled = Boolean(active);
        setIsAdmin(enabled);
        appendLog(`checkAdminStatus -> ${enabled ? "ACTIVE" : "INACTIVE"}`);
        return enabled;
      } catch (error) {
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
        appendLog(`promptForAdmin error: ${error?.message ?? "unknown"}`);
        throw error;
      }
    }

    return false;
  }, [appendLog, checkAdminStatus]);

  const formatScheduledDuration = useCallback(() => {
    const hoursText = `${selectedHours}h`;
    const minutesText = `${selectedMinutes.toString().padStart(2, "0")}m`;
    return `${hoursText} ${minutesText}`;
  }, [selectedHours, selectedMinutes]);

  const openTimePicker = useCallback(() => {
    try {
      const initial = new Date();
      initial.setHours(selectedHours);
      initial.setMinutes(selectedMinutes);
      initial.setSeconds(0);
      initial.setMilliseconds(0);

      DateTimePickerAndroid.open({
        mode: "time",
        is24Hour: true,
        value: initial,
        onChange: (_, selectedDate) => {
          if (!selectedDate) {
            appendLog("Time picker dismissed without selection");
            return;
          }

          const hours = selectedDate.getHours();
          const minutes = selectedDate.getMinutes();
          setSelectedHours(hours);
          setSelectedMinutes(minutes);
          const minutesLabel = minutes.toString().padStart(2, "0");
          appendLog(`Time picker -> selected ${hours}h ${minutesLabel}m`);
        },
      });
    } catch (error) {
      appendLog(`Error opening time picker: ${error.message}`);
      Alert.alert("Error", "Failed to open time picker.");
    }
  }, [appendLog, selectedHours, selectedMinutes]);

  const formatRemainingTime = useCallback((ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }, []);

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
  }, [appendLog, checkAdminStatus, promptForAdmin]);

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

  const state = useMemo(
    () => ({
      isAdmin,
      debugLogs,
      isLockScheduled,
      scheduledRemainingMs,
    }),
    [debugLogs, isAdmin, isLockScheduled, scheduledRemainingMs]
  );

  const actions = useMemo(
    () => ({
      formatScheduledDuration,
      formatRemainingTime,
      openTimePicker,
      cancelScheduledLock,
      scheduleLock,
      lockDevice,
    }),
    [
      cancelScheduledLock,
      formatRemainingTime,
      formatScheduledDuration,
      lockDevice,
      openTimePicker,
      scheduleLock,
    ]
  );

  return {
    ...state,
    ...actions,
  };
};

export default useDeviceLock;
