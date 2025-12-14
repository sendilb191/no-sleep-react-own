# NoSleepApp - React Native Android App

A simple React Native Android application that displays your name. This project is configured to build via GitHub Actions without requiring local Android SDK installation.

## 📱 What This App Does

The app displays a simple screen with:

- A greeting message
- Your name (customize in `App.js`)
- A welcome message

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- Git

**Note:** You don't need Android Studio or Android SDK installed locally! GitHub Actions handles the Android build.

## 📦 Setup Instructions

### 1. Customize the App

Edit `App.js` and change the name displayed:

```javascript
<Text style={styles.name}>Your Name Here</Text>
```

Replace `"Your Name Here"` with your actual name.

### 2. Install Dependencies

```bash
npm install
```

### 3. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

## 🚀 Building the APK

### Using GitHub Actions (Recommended)

1. Push your code to GitHub
2. GitHub Actions will automatically build the APK
3. Once the workflow completes, go to the "Actions" tab in your GitHub repository
4. Click on the latest workflow run
5. Download the APK from the "Artifacts" section
6. Transfer the APK to your Android device and install it

The workflow also creates a GitHub Release with the APK attached if you push to the `main` branch.

### Local Testing (Optional)

If you want to test locally with the Metro bundler:

```bash
npm start
```

This starts the Metro bundler. You'll still need an Android device or emulator to run the app, but you can use Expo Go or similar tools.

## 📁 Project Structure

```
no-sleep-react-own/
├── android/              # Android native code
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/
│   ├── gradle/
│   ├── build.gradle
│   └── settings.gradle
├── .github/
│   └── workflows/
│       └── android.yml   # GitHub Actions workflow
├── App.js               # Main React component (customize your name here!)
├── index.js             # Entry point
├── package.json         # Dependencies
└── README.md
```

## 🎨 Customization

### Change App Name

1. Edit `app.json` - change `"displayName"`
2. Edit `android/app/src/main/res/values/strings.xml` - change `<string name="app_name">`

### Change Colors

Edit the `styles` object in `App.js`:

```javascript
const styles = StyleSheet.create({
  // Customize colors here
  name: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF", // Change this color
  },
});
```

## 🔧 Troubleshooting

### GitHub Actions Build Fails

1. Check that all files are committed and pushed
2. Ensure `android/gradlew` has execute permissions (GitHub Actions sets this automatically)
3. Review the Actions log for specific errors

### APK Not Installing

1. Enable "Install from Unknown Sources" on your Android device
2. Make sure you downloaded the correct APK file
3. Try uninstalling any previous version first

## 📄 License

This project is open source and available for personal use.

## 🎯 Next Steps

- Customize the UI in `App.js`
- Add more React Native components
- Explore React Native documentation: https://reactnative.dev/
- Add app icon (place in `android/app/src/main/res/mipmap-*` folders)

Happy coding! 🚀
