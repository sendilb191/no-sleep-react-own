package com.nosleepapp;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

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

    @ReactMethod
    public void lockNow(Promise promise) {
        DevicePolicyManager dpm = (DevicePolicyManager) reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE);
        if (dpm == null) {
            promise.reject("DEVICE_POLICY_MANAGER_UNAVAILABLE", "DevicePolicyManager service unavailable");
            return;
        }

        ComponentName adminComponent = new ComponentName(reactContext, MyDeviceAdminReceiver.class);

        if (dpm.isAdminActive(adminComponent)) {
            try {
                dpm.lockNow();
                promise.resolve(null);
            } catch (SecurityException exception) {
                promise.reject("LOCK_NOW_FAILED", "Device lock failed: " + exception.getMessage(), exception);
            }
        } else {
            promise.reject("DEVICE_ADMIN_NOT_ACTIVE", "Device admin not active. Enable the app as a device administrator in system settings.");
        }
    }
}
