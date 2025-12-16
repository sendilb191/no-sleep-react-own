# NoSleepApp - React Native Android App

A React Native Android application with automated CI/CD deployment. Build APKs automatically without installing Android SDK!

## Features

- Customizable welcome screen
- Device lock integration with automatic device administrator prompt
- Built-in stopwatch with start, pause, and reset controls
- Timed app lock scheduler (1-5 hours plus minute increments)
- Hermes JavaScript engine for performance
- Automated APK builds via GitHub Actions
- No Android Studio required

## Quick Start

1. **Clone & Install**

   ```bash
   git clone https://github.com/yourusername/no-sleep-react-own.git
   cd no-sleep-react-own
   npm install
   ```

2. **Customize**

   Edit `App.js` to personalize your app:

   ```javascript
   <Text style={styles.name}>Your Name Here</Text>
   ```

3. **Deploy**

   ```bash
   git add .
   git commit -m "Customize app"
   git push origin main
   ```

4. **Download APK**

   - Go to **Releases** tab in your repository
   - Download `app-release.apk`
   - Install on Android device

## Usage Tips

### Device Administrator Permission

- The first time you open the app it automatically launches the Android device administrator prompt.
- Grant the permission so the **Lock Device** button can immediately lock the screen on demand.
- You can revisit the prompt at any time from the in-app dialog if you previously skipped it.

### Stopwatch Controls

- Tap **Start** to begin counting, **Pause** to hold the current elapsed time, and **Reset** to clear the counter.
- The stopwatch runs entirely on-device and keeps time while the screen remains on.

### Timed App Lock

- Select between **1 and 5 hours** and add minutes (in 5-minute steps) to schedule an automatic device lock.
- Press **Activate App Lock** to start the countdown; the debug panel shows the remaining time and any device-admin warnings.
- Use **Cancel Scheduled Lock** to stop the countdown before it triggers.

## Documentation

- **Setup Guide**: Detailed installation and configuration
- **CI/CD Pipeline**: How the build process works
- **Architecture**: App runtime and structure
- **Troubleshooting**: Common issues and solutions
- **Customization**: Styling, icons, and branding

## Local Development

```bash
# Start Metro bundler
npm start

# Run on Android device
npx react-native run-android
```

## Build Info

- **Build Time:** 2-3 minutes
- **APK Size:** 15-25 MB
- **Min Android:** 6.0 (API 23)
- **Target Android:** 14 (API 34)

## License

Open source - free for personal and commercial use.
