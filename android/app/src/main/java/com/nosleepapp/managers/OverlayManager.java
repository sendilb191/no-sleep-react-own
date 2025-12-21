package com.nosleepapp.managers;

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

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.nosleepapp.utils.LogEmitter;

/**
 * Manages system overlay and toast notifications for the NoSleep App.
 * 
 * This manager provides functionality to display messages to the user:
 * - showToast(): Displays an overlay message (or fallback Toast if no permission)
 * - canDrawOverlays(): Checks if SYSTEM_ALERT_WINDOW permission is granted
 * - requestOverlayPermission(): Opens system settings to grant overlay permission
 * 
 * Overlay Behavior:
 * - Displays a semi-transparent banner at the top of the screen
 * - Auto-dismisses after 5 seconds (OVERLAY_DISPLAY_DURATION_MS)
 * - Falls back to standard Android Toast if overlay permission not granted
 * 
 * Permission Requirements:
 * - Android 6.0+ (API 23+): Requires SYSTEM_ALERT_WINDOW permission
 * - User must manually enable "Display over other apps" in Settings
 * 
 * @see android.provider.Settings#canDrawOverlays(Context)
 * @see android.view.WindowManager
 */
public class OverlayManager {

    private static final int OVERLAY_DISPLAY_DURATION_MS = 5000;
    private static final int OVERLAY_TOP_MARGIN = 100;
    private static final int OVERLAY_PADDING_HORIZONTAL = 40;
    private static final int OVERLAY_PADDING_VERTICAL = 30;
    private static final int OVERLAY_TEXT_SIZE = 18;
    private static final String OVERLAY_BACKGROUND_COLOR = "#CC000000";

    private final ReactApplicationContext reactContext;
    private final LogEmitter logEmitter;

    public OverlayManager(ReactApplicationContext reactContext, LogEmitter logEmitter) {
        this.reactContext = reactContext;
        this.logEmitter = logEmitter;
    }

    /**
     * Shows a toast/overlay message. Uses system overlay if permission granted,
     * otherwise falls back to standard Toast.
     */
    public void showToast(String message) {
        UiThreadUtil.runOnUiThread(() -> {
            try {
                if (!hasOverlayPermission()) {
                    showFallbackToast(message);
                    return;
                }
                showOverlayMessage(message);
            } catch (Exception e) {
                logEmitter.emit("showToast error: " + e.getMessage());
                showFallbackToastSafe(message);
            }
        });
    }

    private boolean hasOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return Settings.canDrawOverlays(reactContext);
        }
        return true; // Pre-Marshmallow doesn't need this permission
    }

    private void showFallbackToast(String message) {
        Toast.makeText(reactContext, message, Toast.LENGTH_LONG).show();
        logEmitter.emit("showToast (fallback): " + message);
    }

    private void showFallbackToastSafe(String message) {
        try {
            Toast.makeText(reactContext, message, Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            logEmitter.emit("showToast fallback error: " + e.getMessage());
        }
    }

    private void showOverlayMessage(String message) {
        WindowManager windowManager = getWindowManager();
        if (windowManager == null) {
            showFallbackToast(message);
            logEmitter.emit("showToast: WindowManager unavailable, using Toast");
            return;
        }

        TextView overlayView = createOverlayTextView(message);
        WindowManager.LayoutParams params = createOverlayLayoutParams();

        windowManager.addView(overlayView, params);
        logEmitter.emit("showToast (overlay): " + message);

        scheduleOverlayRemoval(windowManager, overlayView);
    }

    private WindowManager getWindowManager() {
        return (WindowManager) reactContext.getSystemService(Context.WINDOW_SERVICE);
    }

    private TextView createOverlayTextView(String message) {
        TextView textView = new TextView(reactContext);
        textView.setText(message);
        textView.setTextSize(OVERLAY_TEXT_SIZE);
        textView.setTextColor(Color.WHITE);
        textView.setBackgroundColor(Color.parseColor(OVERLAY_BACKGROUND_COLOR));
        textView.setPadding(
            OVERLAY_PADDING_HORIZONTAL, 
            OVERLAY_PADDING_VERTICAL, 
            OVERLAY_PADDING_HORIZONTAL, 
            OVERLAY_PADDING_VERTICAL
        );
        textView.setGravity(Gravity.CENTER);
        return textView;
    }

    private WindowManager.LayoutParams createOverlayLayoutParams() {
        int windowType = getOverlayWindowType();

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            windowType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE,
            PixelFormat.TRANSLUCENT
        );
        params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
        params.y = OVERLAY_TOP_MARGIN;

        return params;
    }

    private int getOverlayWindowType() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            return WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        }
        return WindowManager.LayoutParams.TYPE_PHONE;
    }

    private void scheduleOverlayRemoval(WindowManager windowManager, TextView overlayView) {
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            try {
                windowManager.removeView(overlayView);
            } catch (Exception e) {
                logEmitter.emit("showToast: error removing overlay - " + e.getMessage());
            }
        }, OVERLAY_DISPLAY_DURATION_MS);
    }

    /**
     * Checks if the app has permission to draw overlays.
     */
    public boolean canDrawOverlays() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return Settings.canDrawOverlays(reactContext);
        }
        return true; // Pre-Marshmallow doesn't need this permission
    }

    /**
     * Opens system settings to request overlay permission.
     */
    public void requestOverlayPermission() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + reactContext.getPackageName())
                );
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                logEmitter.emit("requestOverlayPermission: opened settings");
            }
        } catch (Exception e) {
            logEmitter.emit("requestOverlayPermission error: " + e.getMessage());
        }
    }
}
