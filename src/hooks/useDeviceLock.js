import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState, NativeModules } from "react-native";
import BackgroundTimer from "react-native-background-timer";

const { DeviceLock } = NativeModules;

const useDeviceLock = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasOverlayPermission, setHasOverlayPermission] = useState(false);
  const hasPromptedForAdmin = useRef(false);
  const hasPromptedForOverlay = useRef(false);
  const hasShownOneMinuteWarning = useRef(false);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [isLockScheduled, setIsLockScheduled] = useState(false);
  const [scheduledRemainingMs, setScheduledRemainingMs] = useState(0);
  const backgroundTimerRef = useRef(null);

  const stopBackgroundTimer = useCallback(() => {
    if (backgroundTimerRef.current) {
      BackgroundTimer.clearInterval(backgroundTimerRef.current);
      backgroundTimerRef.current = null;
    }
  }, []);

  const resetScheduledLockState = useCallback(() => {
    stopBackgroundTimer();
    setIsLockScheduled(false);
    setScheduledRemainingMs(0);
    hasShownOneMinuteWarning.current = false;
  }, [stopBackgroundTimer]);

  const testToast = useCallback(() => {
    if (DeviceLock && DeviceLock.showToast) {
      DeviceLock.showToast("🔔 Toast notification is working!");
    } else {
      Alert.alert("Error", "Toast functionality not available");
    }
  }, []);

  const checkOverlayPermission = useCallback(async () => {
    if (DeviceLock && DeviceLock.canDrawOverlays) {
      try {
        const canDraw = await DeviceLock.canDrawOverlays();
        setHasOverlayPermission(Boolean(canDraw));
        return Boolean(canDraw);
      } catch {
        setHasOverlayPermission(false);
        return false;
      }
    }
    setHasOverlayPermission(false);
    return false;
  }, []);

  const requestOverlayPermission = useCallback(() => {
    if (DeviceLock && DeviceLock.requestOverlayPermission) {
      Alert.alert(
        "Overlay Permission Required",
        "To show the 1-minute warning on top of other apps, please enable 'Display over other apps' permission.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              hasPromptedForOverlay.current = true;
              DeviceLock.requestOverlayPermission();
            },
          },
        ]
      );
    }
  }, []);

  const checkAdminStatus = useCallback(async () => {
    if (DeviceLock && DeviceLock.isAdminActive) {
      try {
        const active = await DeviceLock.isAdminActive();
        setIsAdmin(Boolean(active));
        return Boolean(active);
      } catch {
        setIsAdmin(false);
        return false;
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
        } else {
          setTimeout(() => checkAdminStatus(), 500);
        }
        return granted;
      } catch {
        return false;
      }
    }
    return false;
  }, [checkAdminStatus]);

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
      resetScheduledLockState();
    }

    if (!DeviceLock || !DeviceLock.lockNow) {
      Alert.alert("Warning", "Device lock functionality is not available.");
      return;
    }

    try {
      await DeviceLock.lockNow();
      setIsAdmin(true);
    } catch (error) {
      if (error?.code === "DEVICE_ADMIN_NOT_ACTIVE") {
        Alert.alert(
          "Device Administrator Required",
          "This app needs device administrator permission to lock your device.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Grant Permission",
              onPress: async () => {
                hasPromptedForAdmin.current = true;
                await promptForAdmin();
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
  }, [isLockScheduled, promptForAdmin, resetScheduledLockState]);

  const scheduleLock = useCallback(() => {
    if (!DeviceLock || !DeviceLock.lockNow) {
      Alert.alert(
        "Warning",
        "Device lock functionality is not available on this device."
      );
      return;
    }

    const totalMinutes = selectedHours * 60 + selectedMinutes;
    if (totalMinutes <= 0) {
      Alert.alert(
        "Invalid duration",
        "Please select at least 1 minute before starting the timer."
      );
      return;
    }

    stopBackgroundTimer();
    hasShownOneMinuteWarning.current = totalMinutes <= 1; // Don't show warning if timer is 1 min or less

    const totalMs = totalMinutes * 60 * 1000;
    setScheduledRemainingMs(totalMs);
    setIsLockScheduled(true);

    const ONE_MINUTE_MS = 60 * 1000;

    // Use BackgroundTimer for background execution
    backgroundTimerRef.current = BackgroundTimer.setInterval(() => {
      setScheduledRemainingMs((prev) => {
        const next = Math.max(prev - 1000, 0);

        // Check for 1-minute warning inside the timer callback (works in background)
        if (
          next <= ONE_MINUTE_MS &&
          next > 0 &&
          !hasShownOneMinuteWarning.current
        ) {
          hasShownOneMinuteWarning.current = true;
          // Call showToast directly from native module
          if (DeviceLock && DeviceLock.showToast) {
            DeviceLock.showToast("⚠️ Device will lock in 1 minute!");
          }
        }

        return next;
      });
    }, 1000);
  }, [selectedHours, selectedMinutes, stopBackgroundTimer]);

  const cancelScheduledLock = useCallback(() => {
    if (!isLockScheduled) {
      return;
    }
    resetScheduledLockState();
    Alert.alert("Timer Cancelled", "The lock timer has been cancelled.");
  }, [isLockScheduled, resetScheduledLockState]);

  // Request all permissions on mount
  useEffect(() => {
    (async () => {
      // Check and request admin permission
      const adminActive = await checkAdminStatus();
      if (!adminActive && !hasPromptedForAdmin.current) {
        hasPromptedForAdmin.current = true;
        await promptForAdmin();
      }

      // Check and request overlay permission
      const hasOverlay = await checkOverlayPermission();
      if (!hasOverlay && !hasPromptedForOverlay.current) {
        hasPromptedForOverlay.current = true;
        requestOverlayPermission();
      }
    })();
  }, [
    checkAdminStatus,
    promptForAdmin,
    checkOverlayPermission,
    requestOverlayPermission,
  ]);

  // Re-check permissions when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        checkAdminStatus();
        checkOverlayPermission();
      }
    });
    return () => subscription.remove();
  }, [checkAdminStatus, checkOverlayPermission]);

  // Lock device when countdown reaches zero
  useEffect(() => {
    if (isLockScheduled && scheduledRemainingMs === 0) {
      stopBackgroundTimer();
      setIsLockScheduled(false);
      lockDevice();
    }
  }, [isLockScheduled, lockDevice, scheduledRemainingMs, stopBackgroundTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopBackgroundTimer();
  }, [stopBackgroundTimer]);

  return {
    isAdmin,
    hasOverlayPermission,
    isLockScheduled,
    scheduledRemainingMs,
    selectedHours,
    selectedMinutes,
    setSelectedHours,
    setSelectedMinutes,
    formatRemainingTime,
    cancelScheduledLock,
    scheduleLock,
    lockDevice,
    testToast,
    requestOverlayPermission,
  };
};

export default useDeviceLock;
