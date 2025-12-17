# Android Architecture Overview

This guide explains how the native Android side of the project works so React developers can reason about the Java/Kotlin pieces without prior Android experience.

---

## Build Flow at a Glance

1. **React UI** calls methods on `NativeModules.DeviceLock` from the hook in `src/hooks/useDeviceLock.js`.
2. **Bridge layer** lives in `android/app/src/main/java/com/nosleepapp/DeviceLockModule.java` and forwards calls to Android's `DevicePolicyManager`.
3. **Device administrator receiver** (`MyDeviceAdminReceiver.java`) handles enable/disable callbacks from the OS.
4. **Main application** (`MainApplication.java`) registers every native package React Native needs at startup.
5. **Gradle build** in `android/app/build.gradle` compiles the Java sources, bundles React Native, and packages everything into an APK.

---

## Key Native Files and Their Roles

| File                                                                  | Purpose                                                                                                        |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `android/app/src/main/AndroidManifest.xml`                            | Declares the application package, registers the device admin receiver, and requests required permissions.      |
| `android/app/src/main/java/com/nosleepapp/MyDeviceAdminReceiver.java` | Extends `DeviceAdminReceiver` so the OS can notify the app when admin rights are granted or revoked.           |
| `android/app/src/main/java/com/nosleepapp/DeviceLockModule.java`      | Implements the `DeviceLock` native module exposed to JavaScript. Provides `isAdminActive` and `lockNow`.       |
| `android/app/src/main/java/com/nosleepapp/DeviceLockPackage.java`     | Registers `DeviceLockModule` with React Native's package list.                                                 |
| `android/app/src/main/java/com/nosleepapp/MainApplication.java`       | Bootstraps the React Native host and manually registers `MainReactPackage` and `DeviceLockPackage`.            |
| `android/app/build.gradle`                                            | App-level Gradle configuration. Defines min/target SDK, build types, packaging rules, and native dependencies. |
| `android/build.gradle`                                                | Top-level Gradle wrapper config shared across modules.                                                         |
| `android/gradle.properties`                                           | JVM and Gradle tuning, including enabling AndroidX and Kotlin.                                                 |
| `android/gradlew(.bat)`                                               | Wrapper scripts that download the exact Gradle version needed to build the project.                            |

---

## Data & Control Flow Details

1. **Admin status detection**

   - JavaScript calls `DeviceLockModule.isAdminActive()`.
   - The module reads `DevicePolicyManager.isAdminActive(componentName)` and returns the boolean to JS.

2. **Requesting admin permission**

   - JavaScript calls `DeviceLockModule.requestAdminPermission()` (implemented in `DeviceLockModule.java`).
   - The module launches the Android settings intent that displays the admin permission prompt.

3. **Locking the device**

   - JavaScript calls `DeviceLockModule.lockNow()`.
   - If admin rights are present, `DevicePolicyManager.lockNow()` fires. Otherwise, an error is sent back to JS so the UI can prompt the user again.

4. **Native logging**

   - `DeviceLockModule` emits events through `DeviceLockLog`. `useDeviceLock.js` subscribes using `NativeEventEmitter` and appends messages to the debug log UI.

---

## Build & Debug Workflow

```bash
# From the repository root
cd android

# Clean old outputs and build a debug APK
./gradlew.bat clean assembleDebug  # Windows
./gradlew clean assembleDebug      # macOS/Linux

# Install on a connected device or emulator
debug\app\build\outputs\apk\debug\app-debug.apk
```

- React Native JavaScript lives outside the `android/` folder; rebuild native code whenever you modify Java files or Gradle configs.
- Use `adb logcat` to view native logs if you need deeper insight into device admin interactions.

---

## Troubleshooting Native Builds

| Symptom                                             | Likely Cause                              | Suggested Fix                                                                                                           |
| --------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `PackageList` cannot be resolved                    | Autolinking is disabled in this template  | Keep using manual registration in `MainApplication.java`.                                                               |
| Build complains about missing device admin receiver | Manifest entry missing or renamed         | Verify `android:permission="android.permission.BIND_DEVICE_ADMIN"` and the `<receiver>` block in `AndroidManifest.xml`. |
| `DEVICE_ADMIN_NOT_ACTIVE` while locking             | Permission not granted yet                | Prompt the user via `requestAdminPermission()` and verify status with `isAdminActive()`.                                |
| Gradle SSL errors on Windows                        | Local JDK trust store missing Gradle cert | Install Gradle certificates or use JDK 17 with updated trust store.                                                     |

---

## Recommended Reading

- [React Native Native Modules Android](https://reactnative.dev/docs/native-modules-android)
- [DevicePolicyManager API](https://developer.android.com/reference/android/app/admin/DevicePolicyManager)
- [Android Package Structure Overview](https://developer.android.com/studio/projects)

Armed with this reference, you can treat the `android/` directory as the “native bridge” while iterating on the React UI with confidence.
