# NoSleep App - Complete Build & Architecture Guide

## Table of Contents

1. [App Overview](#app-overview)
2. [Complete Application Flow](#complete-application-flow)
3. [Project Structure](#project-structure)
4. [JavaScript Layer](#javascript-layer)
5. [Native Android Layer](#native-android-layer)
6. [Bridge Communication](#bridge-communication)
7. [Build Process](#build-process)
8. [Build Commands](#build-commands)
9. [Troubleshooting](#troubleshooting)

---

## App Overview

**NoSleep App** is a React Native Android application that allows users to schedule their device to lock after a set time. It uses native Android APIs through a custom native module bridge.

### Key Features

- Schedule device lock with timer (hours/minutes picker)
- Immediate device lock
- Background timer with 1-minute warning overlay
- Device Administrator permission management
- System overlay permission for warnings

---

## Complete Application Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION STARTUP                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. Android System launches MainActivity                                     │
│     └── MainActivity.java (extends ReactActivity)                           │
│         └── Returns component name "NoSleepApp"                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  2. MainApplication initializes React Native                                 │
│     └── MainApplication.java                                                │
│         ├── SoLoader.init() - loads native libraries                        │
│         ├── Creates ReactNativeHost                                         │
│         └── getPackages() returns:                                          │
│             ├── Auto-linked packages (PackageList)                          │
│             └── DeviceLockPackage (custom native module)                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  3. DeviceLockPackage registers native module                               │
│     └── DeviceLockPackage.java                                              │
│         └── createNativeModules() returns DeviceLockModule instance         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  4. DeviceLockModule initializes managers                                    │
│     └── DeviceLockModule.java                                               │
│         ├── Creates LogEmitter (utils/)                                     │
│         ├── Creates DeviceAdminManager (managers/)                          │
│         └── Creates OverlayManager (managers/)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  5. React Native loads JavaScript bundle                                     │
│     └── index.js                                                            │
│         └── AppRegistry.registerComponent("NoSleepApp", () => App)          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  6. App.js renders the application                                           │
│     └── App.js                                                              │
│         └── <ErrorBoundary>                                                 │
│               └── <MainScreen />                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  7. MainScreen uses custom hook for device lock functionality               │
│     └── MainScreen.js                                                       │
│         └── useDeviceLock() hook                                            │
│               ├── Imports NativeModules.DeviceLock                          │
│               ├── Checks admin permission on mount                          │
│               ├── Checks overlay permission on mount                        │
│               └── Provides lock/schedule functions                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER ACTION: LOCK DEVICE                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  JavaScript: useDeviceLock.js                                               │
│  └── lockDevice() calls DeviceLock.lockNow()                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                          ┌───────────┴───────────┐
                          │   REACT NATIVE BRIDGE  │
                          │   (Native Modules)     │
                          └───────────┬───────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Native: DeviceLockModule.java                                               │
│  └── @ReactMethod lockNow(Promise promise)                                  │
│        └── deviceAdminManager.lockNow(callback)                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Native: DeviceAdminManager.java                                             │
│  └── lockNow(Callback callback)                                             │
│        ├── Gets DevicePolicyManager system service                          │
│        ├── Checks if admin is active via MyDeviceAdminReceiver              │
│        └── Calls dpm.lockNow() to lock the screen                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Android System: DevicePolicyManager                                         │
│  └── lockNow() - Immediately locks the device screen                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
mobile-sleeper-andriod-react-native/
│
├── index.js                    # Entry point - registers App component
├── App.js                      # Root component with ErrorBoundary
├── app.json                    # App name configuration ("NoSleepApp")
├── package.json                # Dependencies & scripts
├── metro.config.js             # Metro bundler configuration
├── babel.config.js             # Babel transpiler configuration
│
├── src/                        # JavaScript source code
│   ├── screens/
│   │   └── MainScreen.js       # Main UI screen
│   ├── components/
│   │   ├── TimerSection.js     # Timer picker component
│   │   └── ErrorBoundary.js    # Error handling wrapper
│   ├── hooks/
│   │   └── useDeviceLock.js    # Custom hook - bridge to native
│   └── styles/
│       ├── MainScreen.styles.js
│       ├── TimerSection.styles.js
│       └── ErrorBoundary.styles.js
│
└── android/                    # Native Android code
    ├── build.gradle            # Root Gradle configuration
    ├── settings.gradle         # Gradle settings
    ├── gradlew.bat             # Gradle wrapper (Windows)
    │
    └── app/
        ├── build.gradle        # App-level Gradle configuration
        └── src/main/
            ├── AndroidManifest.xml    # App manifest & permissions
            ├── res/                   # Android resources
            │   └── xml/
            │       └── device_admin_receiver.xml
            │
            └── java/com/nosleepapp/
                │
                ├── MainActivity.java          # Android entry Activity
                ├── MainApplication.java       # App initialization
                ├── DeviceLockModule.java      # React Native native module
                ├── DeviceLockPackage.java     # Module registration
                ├── MyDeviceAdminReceiver.java # Device admin receiver
                │
                ├── managers/                  # Business logic
                │   ├── DeviceAdminManager.java
                │   └── OverlayManager.java
                │
                └── utils/                     # Utilities
                    └── LogEmitter.java
```

---

## JavaScript Layer

### Entry Point: index.js

```javascript
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json"; // "NoSleepApp"

AppRegistry.registerComponent(appName, () => App);
```

- Registers the root `App` component with React Native
- `appName` must match `MainActivity.getMainComponentName()`

### Root Component: App.js

```javascript
import React from "react";
import MainScreen from "./src/screens/MainScreen";
import ErrorBoundary from "./src/components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <MainScreen />
    </ErrorBoundary>
  );
};
```

- Wraps app in ErrorBoundary for crash handling
- Renders MainScreen as the primary UI

### Native Module Access: useDeviceLock.js

```javascript
import { NativeModules } from "react-native";
const { DeviceLock } = NativeModules;

// Call native methods
await DeviceLock.lockNow();
await DeviceLock.isAdminActive();
await DeviceLock.requestAdminPermission();
DeviceLock.showToast("Message");
await DeviceLock.canDrawOverlays();
DeviceLock.requestOverlayPermission();
```

---

## Native Android Layer

### File Responsibilities

| File                         | Purpose                                               |
| ---------------------------- | ----------------------------------------------------- |
| `MainActivity.java`          | Entry Activity, returns component name "NoSleepApp"   |
| `MainApplication.java`       | Initializes RN, registers DeviceLockPackage           |
| `DeviceLockPackage.java`     | Creates DeviceLockModule instance for RN              |
| `DeviceLockModule.java`      | Exposes native methods to JavaScript via @ReactMethod |
| `DeviceAdminManager.java`    | Device lock & admin permission logic                  |
| `OverlayManager.java`        | Toast/overlay display logic                           |
| `LogEmitter.java`            | Logging to Logcat + RN events                         |
| `MyDeviceAdminReceiver.java` | Required for DevicePolicyManager.lockNow()            |

### Native Module Methods

| Method                       | Description               | Returns          |
| ---------------------------- | ------------------------- | ---------------- |
| `lockNow()`                  | Locks device immediately  | Promise<void>    |
| `isAdminActive()`            | Checks admin permission   | Promise<boolean> |
| `requestAdminPermission()`   | Opens admin settings      | Promise<boolean> |
| `showToast(message)`         | Shows overlay/toast       | void             |
| `canDrawOverlays()`          | Checks overlay permission | Promise<boolean> |
| `requestOverlayPermission()` | Opens overlay settings    | void             |

---

## Bridge Communication

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   JAVASCRIPT     │         │   RN BRIDGE      │         │   NATIVE JAVA    │
│                  │         │                  │         │                  │
│  DeviceLock.     │────────▶│  Serializes      │────────▶│  @ReactMethod    │
│  lockNow()       │         │  method call     │         │  lockNow()       │
│                  │         │                  │         │                  │
│  await Promise   │◀────────│  Deserializes    │◀────────│  promise.resolve │
│                  │         │  response        │         │  or .reject()    │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

### How it works:

1. **JS calls** `NativeModules.DeviceLock.lockNow()`
2. **Bridge serializes** method name + arguments
3. **Native receives** call in `DeviceLockModule.lockNow(Promise)`
4. **Native executes** via `DeviceAdminManager`
5. **Native responds** with `promise.resolve()` or `promise.reject()`
6. **Bridge deserializes** response back to JavaScript
7. **JS receives** resolved Promise or catches error

---

## Build Process

### What Happens During Build

```
┌─────────────────────────────────────────────────────────────────┐
│                    GRADLE BUILD PROCESS                         │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ JAVA COMPILE  │   │ RESOURCE MERGE  │   │ JS BUNDLE       │
│               │   │                 │   │                 │
│ *.java files  │   │ AndroidManifest │   │ metro bundler   │
│      ▼        │   │ res/xml, values │   │ index.js + deps │
│ *.class files │   │ drawables       │   │      ▼          │
│      ▼        │   │      ▼          │   │ index.android.  │
│ *.dex files   │   │ merged manifest │   │ bundle          │
└───────────────┘   └─────────────────┘   └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │   PACKAGE APK   │
                    │                 │
                    │ • classes.dex   │
                    │ • resources     │
                    │ • assets/bundle │
                    │ • native libs   │
                    │ • manifest      │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   SIGN APK      │
                    │                 │
                    │ debug: auto     │
                    │ release: manual │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   OUTPUT        │
                    │                 │
                    │ app-debug.apk   │
                    │ or              │
                    │ app-release.apk │
                    └─────────────────┘
```

### Build Configuration Files

| File                        | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `android/build.gradle`      | Gradle version, repositories, buildscript |
| `android/settings.gradle`   | Project modules to include                |
| `android/gradle.properties` | JVM args, RN settings                     |
| `android/app/build.gradle`  | SDK versions, dependencies, signing       |
| `metro.config.js`           | JavaScript bundler configuration          |
| `babel.config.js`           | JavaScript transpilation settings         |

---

## Build Commands

### Development

```powershell
# Start Metro bundler (JS development server)
npm start

# Build and run on connected device/emulator
npm run android
# or
npx react-native run-android
```

### Build APK Only

```powershell
cd android

# Debug build
.\gradlew.bat assembleDebug

# Release build (requires signing configuration)
.\gradlew.bat assembleRelease

# Clean build
.\gradlew.bat clean assembleDebug
```

### Output Locations

| Build Type   | Location                                                   |
| ------------ | ---------------------------------------------------------- |
| Debug APK    | `android/app/build/outputs/apk/debug/app-debug.apk`        |
| Release APK  | `android/app/build/outputs/apk/release/app-release.apk`    |
| Bundle (AAB) | `android/app/build/outputs/bundle/release/app-release.aab` |

### Useful Commands

```powershell
# Check connected devices
adb devices

# Install APK manually
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat -s DeviceLockModule:D ReactNative:D

# Clear app data
adb shell pm clear com.nosleepapp

# Uninstall app
adb uninstall com.nosleepapp
```

---

## Troubleshooting

### Common Issues

| Issue                 | Solution                                                               |
| --------------------- | ---------------------------------------------------------------------- |
| "DeviceLock is null"  | Rebuild native code: `cd android && .\gradlew.bat clean assembleDebug` |
| "Admin not active"    | User must enable Device Admin in Settings > Security                   |
| "Overlay not showing" | User must enable "Display over other apps" permission                  |
| Metro bundler errors  | Clear cache: `npm start -- --reset-cache`                              |
| Gradle build fails    | Check Java version (need JDK 17), run `.\gradlew.bat --stacktrace`     |

### Required Permissions

The app requires these permissions in `AndroidManifest.xml`:

- `BIND_DEVICE_ADMIN` - For device lock functionality
- `SYSTEM_ALERT_WINDOW` - For overlay warnings

### Enabling Device Admin

1. Install the app
2. App will prompt for Device Admin permission
3. Or manually: Settings → Security → Device Administrators → Enable NoSleepApp

---

## Summary

```
USER INTERACTION
       │
       ▼
┌─────────────────┐
│  TimerSection   │ ◀── React Native Component (UI)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useDeviceLock  │ ◀── React Hook (State & Logic)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NativeModules.  │ ◀── React Native Bridge
│ DeviceLock      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ DeviceLockModule│ ◀── Native Module (Java)
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Device │ │Overlay│ ◀── Manager Classes
│Admin  │ │Manager│
│Manager│ │       │
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Device │ │Window │ ◀── Android System Services
│Policy │ │Manager│
│Manager│ │       │
└───────┘ └───────┘
```

**The complete flow**: User taps button → React component → Hook → Native Bridge → Java Module → Manager → Android API → Device locks! 🔒
