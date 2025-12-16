package com.nosleepapp;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
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
    public void lockNow() {
        DevicePolicyManager dpm = (DevicePolicyManager) reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE);
        ComponentName adminComponent = new ComponentName(reactContext, MyDeviceAdminReceiver.class);

        if (dpm != null && dpm.isAdminActive(adminComponent)) {
            dpm.lockNow();
        } else {
            throw new RuntimeException("Device Admin not active");
        }
    }
}
