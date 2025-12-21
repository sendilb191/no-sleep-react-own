package com.nosleepapp;

import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.Toast;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.util.Log;

import androidx.annotation.Nullable;

public class DeviceLockModule extends ReactContextBaseJavaModule {

    private static final String CHANNEL_ID = "nosleep_warnings";
    private static final int NOTIFICATION_ID = 1001;

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

    @ReactMethod
    public void showToast(String message) {
        UiThreadUtil.runOnUiThread(() -> {
            try {
                // Check if we have overlay permission
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
                    // Fall back to Toast if no overlay permission
                    Toast.makeText(reactContext, message, Toast.LENGTH_LONG).show();
                    emitLog("showToast (fallback): " + message);
                    return;
                }

                // Create overlay window
                WindowManager windowManager = (WindowManager) reactContext.getSystemService(Context.WINDOW_SERVICE);
                if (windowManager == null) {
                    Toast.makeText(reactContext, message, Toast.LENGTH_LONG).show();
                    emitLog("showToast: WindowManager unavailable, using Toast");
                    return;
                }

                // Create TextView for the overlay
                TextView overlayView = new TextView(reactContext);
                overlayView.setText(message);
                overlayView.setTextSize(18);
                overlayView.setTextColor(Color.WHITE);
                overlayView.setBackgroundColor(Color.parseColor("#CC000000"));
                overlayView.setPadding(40, 30, 40, 30);
                overlayView.setGravity(Gravity.CENTER);

                // Set up layout params for overlay
                int windowType;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    windowType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
                } else {
                    windowType = WindowManager.LayoutParams.TYPE_PHONE;
                }

                WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    windowType,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
                    PixelFormat.TRANSLUCENT
                );
                params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
                params.y = 100; // 100px from top

                // Add view to window
                windowManager.addView(overlayView, params);
                emitLog("showToast (overlay): " + message);

                // Remove after 5 seconds
                new Handler(Looper.getMainLooper()).postDelayed(() -> {
                    try {
                        windowManager.removeView(overlayView);
                    } catch (Exception e) {
                        emitLog("showToast: error removing overlay - " + e.getMessage());
                    }
                }, 5000);

            } catch (Exception e) {
                emitLog("showToast error: " + e.getMessage());
                // Fallback to Toast on any error
                try {
                    Toast.makeText(reactContext, message, Toast.LENGTH_LONG).show();
                } catch (Exception e2) {
                    emitLog("showToast fallback error: " + e2.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void canDrawOverlays(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                promise.resolve(Settings.canDrawOverlays(reactContext));
            } else {
                promise.resolve(true); // Pre-Marshmallow doesn't need this permission
            }
        } catch (Exception e) {
            promise.reject("CHECK_OVERLAY_FAILED", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void requestOverlayPermission() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + reactContext.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                emitLog("requestOverlayPermission: opened settings");
            }
        } catch (Exception e) {
            emitLog("requestOverlayPermission error: " + e.getMessage());
        }
    }

    // Required for NativeEventEmitter
    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built-in Event Emitter
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built-in Event Emitter
    }
}
