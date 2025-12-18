package com.nosleepapp;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.util.Log;

import androidx.annotation.Nullable;

public class DeviceLockModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public DeviceLockModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "DeviceLock";
    }

    private void emitLog(String message) {
        Log.d("DeviceLockModule", message);
        if (reactContext.hasActiveCatalystInstance()) {
            try {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("DeviceLockLog", message);
            } catch (RuntimeException exception) {
                Log.e("DeviceLockModule", "Failed to emit log", exception);
            }
        }
    }

    @ReactMethod
    public void lockNow(Promise promise) {
        try {
            DevicePolicyManager dpm = (DevicePolicyManager) reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE);
            if (dpm == null) {
                emitLog("lockNow: DevicePolicyManager unavailable");
                promise.reject("DEVICE_POLICY_MANAGER_UNAVAILABLE", "DevicePolicyManager service unavailable");
                return;
            }

            ComponentName adminComponent = new ComponentName(reactContext, MyDeviceAdminReceiver.class);

            if (dpm.isAdminActive(adminComponent)) {
                try {
                    dpm.lockNow();
                    emitLog("lockNow: device locked successfully");
                    promise.resolve(null);
                } catch (SecurityException exception) {
                    emitLog("lockNow: SecurityException - " + exception.getMessage());
                    promise.reject("LOCK_NOW_FAILED", "Device lock failed: " + exception.getMessage(), exception);
                }
            } else {
                emitLog("lockNow: admin not active");
                promise.reject("DEVICE_ADMIN_NOT_ACTIVE", "Device admin not active. Enable the app as a device administrator in system settings.");
            }
        } catch (Exception e) {
            emitLog("lockNow: unexpected error - " + e.getMessage());
            promise.reject("UNEXPECTED_ERROR", "An unexpected error occurred: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void requestAdminPermission(Promise promise) {
        try {
            DevicePolicyManager dpm = (DevicePolicyManager) reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE);
            if (dpm == null) {
                emitLog("requestAdminPermission: DevicePolicyManager unavailable");
                promise.reject("DEVICE_POLICY_MANAGER_UNAVAILABLE", "DevicePolicyManager service unavailable");
                return;
            }

            ComponentName adminComponent = new ComponentName(reactContext, MyDeviceAdminReceiver.class);

            if (dpm.isAdminActive(adminComponent)) {
                emitLog("requestAdminPermission: admin already active");
                promise.resolve(true);
                return;
            }

            Intent intent = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
            intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent);
            intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                "This app needs device administrator permission to lock your device.");

            emitLog("requestAdminPermission: launching device admin settings");

            UiThreadUtil.runOnUiThread(() -> {
                try {
                    Activity currentActivity = getCurrentActivity();
                    if (currentActivity != null) {
                        currentActivity.startActivity(intent);
                        emitLog("requestAdminPermission: started activity with current activity");
                    } else {
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        reactContext.startActivity(intent);
                        emitLog("requestAdminPermission: started activity with application context");
                    }
                    promise.resolve(false);
                } catch (Exception startException) {
                    emitLog("requestAdminPermission: failed to launch settings - " + startException.getMessage());
                    promise.reject("REQUEST_ADMIN_FAILED", "Failed to launch device admin settings: " + startException.getMessage(), startException);
                }
            });
        } catch (Exception e) {
            emitLog("requestAdminPermission: unexpected error - " + e.getMessage());
            promise.reject("REQUEST_ADMIN_FAILED", "Failed to request admin permission: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void isAdminActive(Promise promise) {
        try {
            DevicePolicyManager dpm = (DevicePolicyManager) reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE);
            if (dpm == null) {
                emitLog("isAdminActive: DevicePolicyManager unavailable");
                promise.reject("DEVICE_POLICY_MANAGER_UNAVAILABLE", "DevicePolicyManager service unavailable");
                return;
            }

            ComponentName adminComponent = new ComponentName(reactContext, MyDeviceAdminReceiver.class);
            boolean active = dpm.isAdminActive(adminComponent);
            emitLog("isAdminActive: " + (active ? "active" : "inactive"));
            promise.resolve(dpm.isAdminActive(adminComponent));
        } catch (Exception e) {
            emitLog("isAdminActive: error - " + e.getMessage());
            promise.reject("CHECK_ADMIN_FAILED", "Failed to check admin status: " + e.getMessage(), e);
        }
    }
}
