package com.nosleepapp;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.nosleepapp.managers.DeviceAdminManager;
import com.nosleepapp.managers.OverlayManager;
import com.nosleepapp.utils.LogEmitter;

/**
 * React Native Native Module for device lock and overlay functionality.
 * 
 * Provides the following capabilities:
 * - Device locking (requires device admin permissions)
 * - Overlay/toast message display
 * - Permission management for admin and overlay features
 * 
 * Access from JavaScript: NativeModules.DeviceLock
 */
public class DeviceLockModule extends ReactContextBaseJavaModule {

    private static final String MODULE_NAME = "DeviceLock";

    private final LogEmitter logEmitter;
    private final DeviceAdminManager deviceAdminManager;
    private final OverlayManager overlayManager;

    public DeviceLockModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.logEmitter = new LogEmitter(reactContext);
        this.deviceAdminManager = new DeviceAdminManager(reactContext, logEmitter);
        this.overlayManager = new OverlayManager(reactContext, logEmitter);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    // ============================================================
    // Device Admin Methods
    // ============================================================

    /**
     * Locks the device immediately.
     * Requires device administrator permission to be active.
     */
    @ReactMethod
    public void lockNow(Promise promise) {
        deviceAdminManager.lockNow(new DeviceAdminManager.Callback() {
            @Override
            public void onSuccess(Object result) {
                promise.resolve(result);
            }

            @Override
            public void onError(String code, String message, Exception exception) {
                promise.reject(code, message, exception);
            }
        });
    }

    /**
     * Opens system settings to request device administrator permission.
     * Returns true if already active, false if settings were opened.
     */
    @ReactMethod
    public void requestAdminPermission(Promise promise) {
        deviceAdminManager.requestAdminPermission(new DeviceAdminManager.Callback() {
            @Override
            public void onSuccess(Object result) {
                promise.resolve(result);
            }

            @Override
            public void onError(String code, String message, Exception exception) {
                promise.reject(code, message, exception);
            }
        });
    }

    /**
     * Checks if the app has device administrator permission.
     */
    @ReactMethod
    public void isAdminActive(Promise promise) {
        deviceAdminManager.isAdminActive(new DeviceAdminManager.Callback() {
            @Override
            public void onSuccess(Object result) {
                promise.resolve(result);
            }

            @Override
            public void onError(String code, String message, Exception exception) {
                promise.reject(code, message, exception);
            }
        });
    }

    // ============================================================
    // Overlay Methods
    // ============================================================

    /**
     * Shows a toast/overlay message.
     * Uses system overlay if permission granted, otherwise falls back to Toast.
     */
    @ReactMethod
    public void showToast(String message) {
        overlayManager.showToast(message);
    }

    /**
     * Checks if the app has permission to draw overlays.
     */
    @ReactMethod
    public void canDrawOverlays(Promise promise) {
        try {
            promise.resolve(overlayManager.canDrawOverlays());
        } catch (Exception e) {
            promise.reject("CHECK_OVERLAY_FAILED", e.getMessage(), e);
        }
    }

    /**
     * Opens system settings to request overlay permission.
     */
    @ReactMethod
    public void requestOverlayPermission() {
        overlayManager.requestOverlayPermission();
    }

    // ============================================================
    // Event Emitter Support
    // ============================================================

    /**
     * Required for React Native's NativeEventEmitter.
     */
    @ReactMethod
    public void addListener(String eventName) {
        // Required for RN built-in Event Emitter
    }

    /**
     * Required for React Native's NativeEventEmitter.
     */
    @ReactMethod
    public void removeListeners(Integer count) {
        // Required for RN built-in Event Emitter
    }
}
