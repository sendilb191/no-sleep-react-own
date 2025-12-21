# NoSleepApp 😴

A React Native Android app that schedules automatic device locking after a user-defined time. Perfect for falling asleep while watching content - the device locks itself!

## ✨ Features

- ⏰ **Timer-Based Lock** - Set hours (0-23) and minutes (0-59) before auto-lock
- 🔒 **Test Lock Button** - Instantly lock device to verify permissions work
- ⚠️ **1-Minute Warning** - Toast notification appears when 1 minute remaining
- 🔄 **Background Timer** - Countdown continues even when app is minimized
- 🛡️ **Error Boundary** - Graceful crash handling with copy-to-clipboard
- 🚀 **CI/CD Pipeline** - Automated APK builds via GitHub Actions

---

## 🏗️ Project Architecture

```
mobile-sleeper-android-react-native/
├── App.js                          # Root component with ErrorBoundary
├── index.js                        # React Native entry point
├── package.json                    # Dependencies & scripts
│
├── src/
│   ├── screens/
│   │   └── MainScreen.js           # Main UI with timer controls
│   ├── components/
│   │   ├── TimerSection.js         # Hour/Minute dropdowns + buttons
│   │   └── ErrorBoundary.js        # Crash error display with copy
│   ├── hooks/
│   │   └── useDeviceLock.js        # Timer logic + native bridge
│   └── styles/
│       ├── MainScreen.styles.js
│       ├── TimerSection.styles.js
│       └── ErrorBoundary.styles.js
│
├── android/
│   ├── app/
│   │   ├── build.gradle            # App-level build config
│   │   └── src/main/
│   │       ├── AndroidManifest.xml # Permissions & admin receiver
│   │       └── java/com/nosleepapp/
│   │           ├── MainActivity.java
│   │           ├── MainApplication.java
│   │           ├── DeviceLockModule.java    # Native lock + toast
│   │           ├── DeviceLockPackage.java   # RN bridge registration
│   │           └── MyDeviceAdminReceiver.java
│   ├── build.gradle                # Root build config
│   └── settings.gradle             # Module includes
│
├── scripts/
│   └── fix-namespaces.js           # Postinstall: patches libraries for AGP 8+
│
└── .github/workflows/
    └── android.yml                 # CI/CD build pipeline
```

---

## 🔧 How It Works

### 1. User Flow

```
┌─────────────────────────────────────────────────────────┐
│                     NoSleepApp UI                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐                     │
│  │   Hours     │    │   Minutes   │   ← Dropdown pickers│
│  │    [02]     │    │    [30]     │                     │
│  └─────────────┘    └─────────────┘                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Start Timer                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         🔒 Test Lock (Lock Now)                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2. Timer Countdown Flow

```
User selects 2h 30m → Start Timer
        │
        ▼
┌──────────────────────────────┐
│  BackgroundTimer starts      │
│  (runs even when minimized)  │
└──────────────────────────────┘
        │
        ▼ (every 1 second)
┌──────────────────────────────┐
│  Update remaining time       │
│  Display: 02:29:59           │
└──────────────────────────────┘
        │
        ▼ (when 1 min remaining)
┌──────────────────────────────┐
│  Show Toast Warning          │
│  "⚠️ Device will lock in    │
│   1 minute!"                 │
└──────────────────────────────┘
        │
        ▼ (when 0:00:00)
┌──────────────────────────────┐
│  Call DeviceLock.lockNow()   │
│  → Screen turns off          │
└──────────────────────────────┘
```

### 3. Native Bridge (React Native ↔ Android)

```
┌─────────────────────────┐     ┌─────────────────────────┐
│     JavaScript          │     │        Android          │
├─────────────────────────┤     ├─────────────────────────┤
│                         │     │                         │
│  useDeviceLock.js       │────▶│  DeviceLockModule.java  │
│                         │     │                         │
│  • lockDevice()         │     │  • lockNow()            │
│  • checkAdminStatus()   │     │  • isAdminActive()      │
│  • promptForAdmin()     │     │  • requestAdminPermission()
│  • showOneMinuteWarning │     │  • showToast()          │
│                         │     │                         │
└─────────────────────────┘     └─────────────────────────┘
                                          │
                                          ▼
                                ┌─────────────────────────┐
                                │  DevicePolicyManager    │
                                │  (Android System API)   │
                                │                         │
                                │  • lockNow()            │
                                │  • isAdminActive()      │
                                └─────────────────────────┘
```

---

## 🚀 Build Process

### GitHub Actions CI/CD (Automatic)

Every push to `dev` or `main` triggers an automatic build:

```
Push to dev/main
      │
      ▼
┌─────────────────────────────────────────────┐
│  GitHub Actions Workflow (android.yml)      │
├─────────────────────────────────────────────┤
│  1. Checkout code                           │
│  2. Setup Java 17 (Temurin)                 │
│  3. Setup Node.js 20                        │
│  4. npm install                             │
│  5. Run postinstall (fix-namespaces.js)     │
│  6. ./gradlew assembleRelease               │
│  7. Upload APK artifact                     │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│  APK available in Actions → Artifacts       │
│  File: app-release.apk (~15-25 MB)          │
└─────────────────────────────────────────────┘
```

### Postinstall Script (fix-namespaces.js)

Automatically patches third-party libraries for Android Gradle Plugin 8+ compatibility:

```javascript
// Adds namespace to react-native-background-timer
// Required because AGP 8+ removed package attribute from AndroidManifest
android {
    namespace "com.ocetnik.timer"  // ← Added by script
}
```

---

## 📱 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/sendilb191/mobile-sleeper-andriod-react-native.git
cd mobile-sleeper-andriod-react-native
npm install
```

### 2. Validate Code

```bash
npm run validate   # Runs lint + bundle check
```

### 3. Build APK

Push to GitHub and let CI/CD build:

```bash
git add .
git commit -m "Your changes"
git push origin dev
```

### 4. Download APK

1. Go to GitHub → **Actions** tab
2. Click the latest workflow run
3. Download `app-release` artifact
4. Install APK on Android device

---

## 📦 NPM Scripts

| Script                 | Description                         |
| ---------------------- | ----------------------------------- |
| `npm start`            | Start Metro bundler (for local dev) |
| `npm run lint`         | Check code with ESLint              |
| `npm run lint:fix`     | Auto-fix ESLint issues              |
| `npm run format`       | Format with Prettier                |
| `npm run bundle:check` | Verify JS bundle compiles           |
| `npm run validate`     | Run lint + bundle check             |
| `npm run precommit`    | Full validation before commit       |

---

## 🔐 Device Administrator Permission

The app requires **Device Administrator** permission to lock the screen.

### First Launch

1. App prompts for permission automatically
2. Tap **"Activate"** in the system dialog
3. Permission granted ✅

### Manual Enable

Settings → Security → Device Admin Apps → NoSleepApp → Enable

### Why Required?

Android requires Device Admin permission for any app to call `DevicePolicyManager.lockNow()`. This is a security feature - only trusted apps can lock the device.

---

## 🛠️ Tech Stack

| Technology   | Version | Purpose                       |
| ------------ | ------- | ----------------------------- |
| React Native | 0.73.2  | Cross-platform framework      |
| Hermes       | Bundled | JavaScript engine (optimized) |
| Kotlin       | 2.0.21  | Android native code           |
| Gradle       | 8.7.3   | Android build system          |
| AGP          | 8.7.3   | Android Gradle Plugin         |
| Node.js      | 20.x    | JavaScript runtime            |
| Java         | 17      | Build toolchain               |

---

## 📁 Key Files Explained

### JavaScript

| File               | Purpose                                                 |
| ------------------ | ------------------------------------------------------- |
| `useDeviceLock.js` | Main hook - timer logic, native calls, state management |
| `TimerSection.js`  | UI - dropdown selectors, buttons, countdown display     |
| `ErrorBoundary.js` | Catches crashes, shows error with copy button           |

### Android Native

| File                         | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| `DeviceLockModule.java`      | Native methods: lockNow, isAdminActive, showToast |
| `DeviceLockPackage.java`     | Registers module with React Native                |
| `MyDeviceAdminReceiver.java` | Handles Device Admin events                       |
| `AndroidManifest.xml`        | Declares admin receiver & permissions             |

### Build Config

| File                        | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `android/build.gradle`      | Root config, Kotlin/AGP versions, dependency resolution |
| `android/app/build.gradle`  | App config, SDK versions, signing                       |
| `android/settings.gradle`   | Module includes, native module auto-linking             |
| `scripts/fix-namespaces.js` | Patches libraries for AGP 8+ namespace requirement      |

---

## 📊 Build Info

| Property       | Value                               |
| -------------- | ----------------------------------- |
| Build Time     | ~2-3 minutes                        |
| APK Size       | ~15-25 MB                           |
| Min Android    | 6.0 (API 23)                        |
| Target Android | 14 (API 34)                         |
| Architecture   | arm64-v8a, armeabi-v7a, x86, x86_64 |

---

## 🐛 Troubleshooting

### Build Fails - "namespace not specified"

The postinstall script should fix this automatically. If not:

```bash
rm -rf node_modules
npm install
```

### Device Admin Not Working

1. Uninstall app completely
2. Reinstall and grant permission when prompted
3. Check Settings → Security → Device Admin Apps

### Timer Doesn't Work in Background

The app uses `react-native-background-timer` which runs in a background service. Ensure:

- Battery optimization is disabled for the app
- App is not force-stopped

---

## 📄 License

Open source - free for personal and commercial use.
