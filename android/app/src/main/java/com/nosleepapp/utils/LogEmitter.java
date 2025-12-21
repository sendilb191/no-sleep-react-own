package com.nosleepapp.utils;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * Centralized logging utility for the NoSleep App native modules.
 * 
 * This utility provides dual-channel logging:
 * - Android Logcat: For native debugging (visible in Android Studio / adb logcat)
 * - React Native Events: For JavaScript debugging (via NativeEventEmitter)
 * 
 * Features:
 * - Single emit() method logs to both channels simultaneously
 * - Gracefully handles cases when React Native bridge is not active
 * - Uses consistent TAG "DeviceLockModule" for easy log filtering
 * 
 * JavaScript Usage:
 *   import { NativeEventEmitter, NativeModules } from 'react-native';
 *   const emitter = new NativeEventEmitter(NativeModules.DeviceLock);
 *   emitter.addListener('DeviceLockLog', (message) => console.log(message));
 * 
 * @see com.facebook.react.modules.core.DeviceEventManagerModule
 */
public class LogEmitter {

    private static final String TAG = "DeviceLockModule";

    private final ReactApplicationContext reactContext;

    public LogEmitter(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    /**
     * Emits a log message to both Android Logcat and React Native JS.
     */
    public void emit(String message) {
        Log.d(TAG, message);
        emitToReactNative(message);
    }

    private void emitToReactNative(String message) {
        if (!reactContext.hasActiveCatalystInstance()) {
            return;
        }

        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("DeviceLockLog", message);
        } catch (RuntimeException exception) {
            Log.e(TAG, "Failed to emit log", exception);
        }
    }
}
