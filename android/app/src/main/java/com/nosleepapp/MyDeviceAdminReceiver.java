package com.nosleepapp;

import android.app.admin.DeviceAdminReceiver;

/**
 * Device Administrator Broadcast Receiver for NoSleep App.
 * 
 * This receiver is required by Android's Device Policy Manager to perform
 * privileged device operations such as locking the screen.
 * 
 * Registration:
 * - Declared in AndroidManifest.xml with BIND_DEVICE_ADMIN permission
 * - Configuration defined in res/xml/device_admin_receiver.xml
 * - User must manually enable this app as a Device Administrator in Settings
 * 
 * Used by: DeviceAdminManager.lockNow() to lock the device screen
 * 
 * @see android.app.admin.DeviceAdminReceiver
 * @see android.app.admin.DevicePolicyManager#lockNow()
 */
public class MyDeviceAdminReceiver extends DeviceAdminReceiver {
    // Empty implementation - we only need the receiver registered for lockNow() capability
}
