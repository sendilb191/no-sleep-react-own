package com.nosleepapp.managers;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.nosleepapp.MyDeviceAdminReceiver;
import com.nosleepapp.utils.LogEmitter;

/**
 * Manages Android Device Administrator operations for the NoSleep App.
 * 
 * This manager handles all interactions with Android's DevicePolicyManager:
 * - lockNow(): Immediately locks the device screen
 * - requestAdminPermission(): Opens system settings to grant admin access
 * - isAdminActive(): Checks if the app has device admin privileges
 * 
 * Prerequisites:
 * - MyDeviceAdminReceiver must be registered in AndroidManifest.xml
 * - User must manually enable Device Administrator permission in Settings
 * 
 * Usage:
 * - Instantiated by DeviceLockModule with ReactApplicationContext
 * - Uses async Callback interface to communicate results back to the module
 * 
 * @see MyDeviceAdminReceiver
 * @see android.app.admin.DevicePolicyManager
 */
public class DeviceAdminManager {

    private final ReactApplicationContext reactContext;
    private final LogEmitter logEmitter;

    public interface Callback {
        void onSuccess(Object result);
        void onError(String code, String message, Exception exception);
    }

    public DeviceAdminManager(ReactApplicationContext reactContext, LogEmitter logEmitter) {
        this.reactContext = reactContext;
        this.logEmitter = logEmitter;
    }

    private DevicePolicyManager getDevicePolicyManager() {
        return (DevicePolicyManager) reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE);
    }

    private ComponentName getAdminComponent() {
        return new ComponentName(reactContext, MyDeviceAdminReceiver.class);
    }

    /**
     * Locks the device immediately if admin permissions are active.
     */
    public void lockNow(Callback callback) {
        try {
            DevicePolicyManager dpm = getDevicePolicyManager();
            if (dpm == null) {
                logEmitter.emit("lockNow: DevicePolicyManager unavailable");
                callback.onError("DEVICE_POLICY_MANAGER_UNAVAILABLE", "DevicePolicyManager service unavailable", null);
                return;
            }

            ComponentName adminComponent = getAdminComponent();

            if (dpm.isAdminActive(adminComponent)) {
                try {
                    dpm.lockNow();
                    logEmitter.emit("lockNow: device locked successfully");
                    callback.onSuccess(null);
                } catch (SecurityException exception) {
                    logEmitter.emit("lockNow: SecurityException - " + exception.getMessage());
                    callback.onError("LOCK_NOW_FAILED", "Device lock failed: " + exception.getMessage(), exception);
                }
            } else {
                logEmitter.emit("lockNow: admin not active");
                callback.onError("DEVICE_ADMIN_NOT_ACTIVE", 
                    "Device admin not active. Enable the app as a device administrator in system settings.", null);
            }
        } catch (Exception e) {
            logEmitter.emit("lockNow: unexpected error - " + e.getMessage());
            callback.onError("UNEXPECTED_ERROR", "An unexpected error occurred: " + e.getMessage(), e);
        }
    }

    /**
     * Requests device administrator permission from the user.
     */
    public void requestAdminPermission(Callback callback) {
        try {
            DevicePolicyManager dpm = getDevicePolicyManager();
            if (dpm == null) {
                logEmitter.emit("requestAdminPermission: DevicePolicyManager unavailable");
                callback.onError("DEVICE_POLICY_MANAGER_UNAVAILABLE", "DevicePolicyManager service unavailable", null);
                return;
            }

            ComponentName adminComponent = getAdminComponent();

            if (dpm.isAdminActive(adminComponent)) {
                logEmitter.emit("requestAdminPermission: admin already active");
                callback.onSuccess(true);
                return;
            }

            Intent intent = createAdminRequestIntent(adminComponent);
            logEmitter.emit("requestAdminPermission: launching device admin settings");

            launchAdminSettings(intent, callback);
        } catch (Exception e) {
            logEmitter.emit("requestAdminPermission: unexpected error - " + e.getMessage());
            callback.onError("REQUEST_ADMIN_FAILED", "Failed to request admin permission: " + e.getMessage(), e);
        }
    }

    private Intent createAdminRequestIntent(ComponentName adminComponent) {
        Intent intent = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
        intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent);
        intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION,
            "This app needs device administrator permission to lock your device.");
        return intent;
    }

    private void launchAdminSettings(Intent intent, Callback callback) {
        UiThreadUtil.runOnUiThread(() -> {
            try {
                Activity currentActivity = reactContext.getCurrentActivity();
                if (currentActivity != null) {
                    currentActivity.startActivity(intent);
                    logEmitter.emit("requestAdminPermission: started activity with current activity");
                } else {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    reactContext.startActivity(intent);
                    logEmitter.emit("requestAdminPermission: started activity with application context");
                }
                callback.onSuccess(false);
            } catch (Exception startException) {
                logEmitter.emit("requestAdminPermission: failed to launch settings - " + startException.getMessage());
                callback.onError("REQUEST_ADMIN_FAILED", 
                    "Failed to launch device admin settings: " + startException.getMessage(), startException);
            }
        });
    }

    /**
     * Checks if device administrator is currently active.
     */
    public void isAdminActive(Callback callback) {
        try {
            DevicePolicyManager dpm = getDevicePolicyManager();
            if (dpm == null) {
                logEmitter.emit("isAdminActive: DevicePolicyManager unavailable");
                callback.onError("DEVICE_POLICY_MANAGER_UNAVAILABLE", "DevicePolicyManager service unavailable", null);
                return;
            }

            ComponentName adminComponent = getAdminComponent();
            boolean active = dpm.isAdminActive(adminComponent);
            logEmitter.emit("isAdminActive: " + (active ? "active" : "inactive"));
            callback.onSuccess(active);
        } catch (Exception e) {
            logEmitter.emit("isAdminActive: error - " + e.getMessage());
            callback.onError("CHECK_ADMIN_FAILED", "Failed to check admin status: " + e.getMessage(), e);
        }
    }
}
