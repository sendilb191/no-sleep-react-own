# Development Guidelines

## Debugging Without a Development Setup

If you do not have a development setup and rely on testing directly on a mobile device, follow these guidelines:

### Use Alerts for Debugging

Replace `console.warn` or `console.log` with `Alert.alert` to display messages directly on the device:

```javascript
import { Alert } from "react-native";

Alert.alert("Title", "Your debug message here");
```

### Write Logs to a File

Use a library like `react-native-fs` to write logs to a file that you can retrieve later from the device.

### Visual Debugging

Display debug messages directly in the app UI using `Text` components:

```javascript
<Text>{debugMessage}</Text>
```

### Use Toast Messages

Use a library like `react-native-toast-message` to show temporary messages on the screen.

## Testing Device Lock Functionality

The `lockDevice` function uses the `DeviceLock` native module to lock the device. If the functionality is unavailable, an alert will display a warning message.

### Example:

```javascript
const lockDevice = () => {
  if (DeviceLock && DeviceLock.lockNow) {
    DeviceLock.lockNow();
  } else {
    Alert.alert("Warning", "Device lock functionality is not available.");
  }
};
```

Ensure the `DeviceLock` module is implemented in the native Android code for this to work.

## Additional Notes

- Always test on a real device for hardware-specific features.
- Use `adb logcat` for detailed logs if connected to a computer:
  ```bash
  adb logcat | grep ReactNative
  ```
