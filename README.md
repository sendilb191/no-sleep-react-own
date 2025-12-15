# NoSleepApp - React Native Android App

A React Native Android application with automated CI/CD deployment using GitHub Actions. This project demonstrates a complete mobile development workflow without requiring local Android SDK installation.

## 📱 What This App Does

The app displays a simple welcome screen with:
- A greeting message
- Your name (customizable)
- A welcome message

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- Git
- GitHub account (for CI/CD)

**Note:** You don't need Android Studio or Android SDK installed locally! GitHub Actions handles all Android builds automatically.

## 🏗️ Project Architecture

### Technology Stack
- **Frontend Framework:** React Native 0.73.2
- **JavaScript Runtime:** Hermes Engine
- **Build System:** Gradle 8.9 with Android Gradle Plugin 8.7.3
- **CI/CD:** GitHub Actions
- **Java/Kotlin:** JDK 17 with Kotlin 2.0.21

### Key Components

```
no-sleep-react-own/
├── android/                    # Android native project
│   ├── app/
│   │   ├── build.gradle       # App-level build configuration
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/nosleepapp/
│   │       │   ├── MainActivity.java
│   │       │   └── MainApplication.java
│   │       └── res/           # Android resources
│   │           ├── mipmap-*/  # App launcher icons
│   │           └── values/    # Strings & styles
│   ├── build.gradle           # Root-level build config
│   └── gradle/wrapper/        # Gradle wrapper files
├── .github/workflows/
│   └── android.yml            # CI/CD pipeline configuration
├── App.js                     # Main React component
├── index.js                   # React Native entry point
├── package.json               # Node.js dependencies
├── babel.config.js            # Babel transpiler config
└── metro.config.js            # Metro bundler config
```

## 📦 Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/no-sleep-react-own.git
cd no-sleep-react-own
npm install
```

### 2. Customize the App

Edit `App.js` to personalize the content:

```javascript
<Text style={styles.name}>Your Name Here</Text>
```

Replace `"Your Name Here"` with your desired text.

### 3. Push to GitHub

```bash
git add .
git commit -m "Customize app content"
git push origin main
```

## 🚀 CI/CD Pipeline & Deployment

### How GitHub Actions Builds Your APK

The automated build process consists of these stages:

#### 1. **Environment Setup**
```yaml
- Node.js 18 installation
- Java JDK 17 (Temurin distribution)
- Android SDK setup
- Gradle wrapper configuration
```

#### 2. **Dependency Installation**
```bash
npm install  # Installs React Native and dependencies
```

#### 3. **JavaScript Bundling**
```bash
# Creates optimized JavaScript bundle
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle
```

This step:
- Transpiles JavaScript/JSX to compatible code
- Bundles all JS modules into a single file
- Optimizes for production (minification, dead code elimination)
- Places the bundle where Android can load it

#### 4. **Android Build**
```bash
cd android
gradle assembleRelease --no-daemon
```

The Gradle build process:
- Compiles Java/Kotlin code
- Packages JavaScript bundle as an asset
- Includes native libraries (React Native, Hermes)
- Signs APK with debug keystore
- Generates release APK

#### 5. **Artifact Upload**
- APK uploaded as GitHub Actions artifact
- Accessible from workflow run page for 90 days

#### 6. **GitHub Release Creation**
- Automatically creates a new release (e.g., v1.0.23)
- Attaches APK file to the release
- Release version increments with each build

### Build Configuration Details

#### Gradle Configuration
**Root build.gradle:**
- Android Gradle Plugin: 8.7.3
- Kotlin: 2.0.21
- Build Tools: 34.0.0
- Compile SDK: 34 (Android 14)
- Min SDK: 23 (Android 6.0)
- Target SDK: 34

**App build.gradle:**
- Generates BuildConfig for debug/release detection
- Configures signing with debug keystore
- Packages native libraries (React Native, Hermes, SoLoader)
- Handles duplicate library conflicts

#### JavaScript Bundling
- **Entry Point:** `index.js`
- **Output:** `android/app/src/main/assets/index.android.bundle`
- **Mode:** Production (dev=false)
- **Optimization:** Hermes bytecode compilation

## 🔄 How the App Works

### Application Flow

1. **App Launch:**
   - Android starts `MainActivity`
   - `MainApplication.onCreate()` initializes SoLoader
   - React Native loads JavaScript bundle from assets

2. **JavaScript Execution:**
   - Hermes VM executes the bundle
   - React Native bridge connects JS to native
   - `index.js` registers the App component

3. **UI Rendering:**
   - `App.js` renders the UI tree
   - React Native converts components to native Android views
   - Screen displays the customized content

### Key Files Explained

**App.js** - The main React component:
```javascript
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

// Defines your app's UI and styling
function App() {
  return (
    <SafeAreaView>
      <Text>Your Content Here</Text>
    </SafeAreaView>
  );
}

export default App;
```

**index.js** - Registers the app:
```javascript
import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('NoSleepApp', () => App);
```

**MainApplication.java** - Native entry point:
- Initializes React Native
- Configures JavaScript engine (Hermes)
- Loads native modules
- Sets up React packages

## 📥 Installing the APK

### From GitHub Releases (Recommended)

1. Go to your repository's "Releases" page
2. Find the latest release (e.g., v1.0.23)
3. Download the attached `app-release.apk`
4. Transfer to your Android device
5. Enable "Install from Unknown Sources" in Settings
6. Open the APK and install

### From Actions Artifacts

1. Go to "Actions" tab in your repository
2. Click the latest successful workflow run
3. Scroll to "Artifacts" section
4. Download `app-release` artifact
5. Extract the APK and install on device

## 🎨 Customization Guide

### Change App Name

1. **Display Name (Launcher):**
   ```xml
   <!-- android/app/src/main/res/values/strings.xml -->
   <string name="app_name">YourAppName</string>
   ```

2. **Package Name:**
   - Update namespace in `android/app/build.gradle`
   - Rename Java package in `android/app/src/main/java/`
   - Update imports in Java files

### Modify UI Colors & Styles

```javascript
// App.js
const styles = StyleSheet.create({
  name: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF",  // iOS blue - change to your brand color
  },
  container: {
    backgroundColor: "#ffffff",  // White background
  },
});
```

### Add App Icon

Replace default icons in:
- `android/app/src/main/res/mipmap-mdpi/`
- `android/app/src/main/res/mipmap-hdpi/`
- `android/app/src/main/res/mipmap-xhdpi/`
- `android/app/src/main/res/mipmap-xxhdpi/`
- `android/app/src/main/res/mipmap-xxxhdpi/`

Icon sizes: 48dp, 72dp, 96dp, 144dp, 192dp respectively.

## 🔧 Troubleshooting

### Build Failures

**Gradle Version Issues:**
- The project uses Gradle 8.9 (configured in `gradle-wrapper.properties`)
- Compatible with Android Gradle Plugin 8.7.3
- Supports Gradle 9.x but workflow uses 8.9 for stability

**JavaScript Bundle Not Found:**
- Verify the "Bundle JavaScript" workflow step completed
- Check that `index.android.bundle` exists in artifacts
- Ensure `npm install` ran successfully

**Native Library Conflicts:**
- Handled by `packagingOptions` in `build.gradle`
- `pickFirst` directive chooses first occurrence of duplicate libs

### APK Installation Issues

**"App Not Installed" Error:**
```bash
# Possible causes:
1. Another app with same package name exists - uninstall it first
2. APK signature mismatch - uninstall previous version
3. Insufficient storage - free up space
4. Corrupted APK - re-download and verify file size
```

**App Crashes on Launch:**
```bash
# Check via adb logcat:
adb logcat | grep ReactNative

# Common issues:
- JavaScript bundle missing (workflow bundling step failed)
- Native module incompatibility (version mismatch)
- Permissions not granted (add to AndroidManifest.xml)
```

### GitHub Actions Issues

**"Permission denied" for gradlew:**
- Fixed automatically by Actions checkout
- If building locally: `chmod +x android/gradlew`

**Release Creation Fails (403 Error):**
- Requires `permissions: contents: write` in workflow
- Already configured in `.github/workflows/android.yml`

## 🧪 Local Development

### Testing Without Android Studio

```bash
# Start Metro bundler
npm start

# In another terminal (requires USB debugging enabled):
npx react-native run-android
```

### Building Locally (if Android SDK installed)

```bash
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

## 📊 Build Metrics

- **Average Build Time:** 2-3 minutes
- **APK Size:** ~15-25 MB (depends on architecture)
- **Min Android Version:** 6.0 (API 23)
- **Target Android Version:** 14 (API 34)

## 🔐 Security Notes

- App is signed with debug keystore (for development)
- For production release, generate a release keystore:
  ```bash
  keytool -genkey -v -keystore release.keystore \
    -alias release -keyalg RSA -keysize 2048 -validity 10000
  ```
- Add keystore to GitHub Secrets for secure signing
- Update `signingConfigs.release` in `build.gradle`

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Android Developer Guides](https://developer.android.com/)
- [Gradle User Manual](https://docs.gradle.org/)
- [GitHub Actions Documentation](https://docs.github.com/actions)

## 🎯 Next Steps

1. **Add Navigation:** Integrate React Navigation for multi-screen apps
2. **State Management:** Add Redux or Context API
3. **API Integration:** Connect to backend services
4. **Push Notifications:** Implement Firebase Cloud Messaging
5. **App Signing:** Set up release keystore for production
6. **Google Play:** Publish to Play Store

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to submit issues and pull requests!

---

**Built with ❤️ using React Native and GitHub Actions**
