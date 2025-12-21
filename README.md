# NoSleepApp - React Native Android App

A React Native Android application that prevents your device from sleeping with scheduled lock functionality. Features automated CI/CD deployment via GitHub Actions - no Android SDK required locally!

## Features

- 🔒 **Device Lock Control** - Lock your device on demand or on a schedule
- ⏰ **Timed Lock Scheduler** - Schedule locks from 0-24 hours with 1-minute precision
- 📋 **Copy Error Logs** - Built-in debug log viewer with copy functionality
- 🛡️ **Error Boundary** - Graceful error handling with copy-to-clipboard support
- ⚡ **Hermes Engine** - Optimized JavaScript performance
- 🚀 **Automated Builds** - GitHub Actions CI/CD pipeline
- 📱 **No SDK Required** - Build APKs without Android Studio

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/sendilb191/mobile-sleeper-andriod-react-native.git
cd mobile-sleeper-andriod-react-native
npm install
```

### 2. Local Development

```bash
# Validate code (lint + bundle check)
npm run validate

# Start Metro bundler
npm start
```

### 3. Build & Deploy

Simply push to `dev` or `main` branch - GitHub Actions builds the APK automatically:

```bash
git add .
git commit -m "Your changes"
git push origin dev
```

### 4. Download APK

- Go to **Actions** tab → Select latest workflow run → Download `app-release` artifact
- Or check **Releases** tab for tagged releases

## NPM Scripts

| Script                 | Description                   |
| ---------------------- | ----------------------------- |
| `npm start`            | Start Metro bundler           |
| `npm run lint`         | Run ESLint                    |
| `npm run lint:fix`     | Fix ESLint issues             |
| `npm run format`       | Format code with Prettier     |
| `npm run bundle:check` | Verify JS bundle compiles     |
| `npm run validate`     | Run lint + bundle check       |
| `npm run precommit`    | Full validation before commit |

## Project Structure

```
├── App.js                    # App entry point with ErrorBoundary
├── src/
│   ├── screens/
│   │   └── MainScreen.js     # Main UI screen
│   ├── components/
│   │   ├── TimerSection.js   # Timer picker UI
│   │   ├── DebugLogList.js   # Log viewer with copy button
│   │   └── ErrorBoundary.js  # Error handler with copy support
│   ├── hooks/
│   │   └── useDeviceLock.js  # Device lock logic
│   └── context/
│       └── LogContext.js     # Logging state management
├── android/                  # Native Android code
│   └── app/src/main/java/com/nosleepapp/
│       ├── DeviceLockModule.java    # Native lock module
│       ├── DeviceLockPackage.java   # React Native bridge
│       └── MyDeviceAdminReceiver.java
└── .github/workflows/
    └── android.yml           # CI/CD pipeline
```

## Usage

### Device Administrator Permission

The app requires device administrator permission to lock the screen:

1. On first launch, you'll be prompted to grant permission
2. Grant access to enable the **Lock Device** button
3. You can re-enable from Settings → Security → Device Administrators

### Timed App Lock

1. Tap **Pick Delay** to select hours and minutes (0-24h, 1-minute precision)
2. Tap **Activate App Lock** to start countdown
3. Device will lock automatically when timer reaches zero
4. Tap **Cancel Scheduled Lock** to abort

### Debug Logs

Toggle **Show Debug Logs** to view app activity:

- 📋 **Copy** - Copy all logs to clipboard
- 🗑️ **Clear** - Clear log history

## Build Info

| Property       | Value        |
| -------------- | ------------ |
| Build Time     | ~2-3 minutes |
| APK Size       | ~15-25 MB    |
| Min Android    | 6.0 (API 23) |
| Target Android | 14 (API 34)  |
| React Native   | 0.73.2       |

## Tech Stack

- **React Native** 0.73.2
- **Hermes** JavaScript Engine
- **Kotlin** 2.0.21
- **Gradle** 8.7.3 (AGP)
- **GitHub Actions** CI/CD

## License

Open source - free for personal and commercial use.
