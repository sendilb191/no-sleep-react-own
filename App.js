import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Button,
  NativeModules,
  Alert,
} from "react-native";

const { DeviceLock } = NativeModules;

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAndRequestAdminPermission();
  }, []);

  const checkAndRequestAdminPermission = async () => {
    if (DeviceLock && DeviceLock.isAdminActive) {
      try {
        const active = await DeviceLock.isAdminActive();
        setIsAdmin(active);

        if (!active) {
          // Request admin permission on first launch
          await DeviceLock.requestAdminPermission();
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    }
  };
  const lockDevice = async () => {
    if (DeviceLock && DeviceLock.lockNow) {
      try {
        await DeviceLock.lockNow();
        setIsAdmin(true);
      } catch (error) {
        if (error?.code === "DEVICE_ADMIN_NOT_ACTIVE") {
          Alert.alert(
            "Device Administrator Required",
            "This app needs device administrator permission to lock your device.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Grant Permission",
                onPress: async () => {
                  try {
                    await DeviceLock.requestAdminPermission();
                  } catch (e) {
                    Alert.alert(
                      "Error",
                      "Failed to open device admin settings."
                    );
                  }
                },
              },
            ]
          );
        } else {
          Alert.alert(
            "Unable to lock device",
            error?.message ?? "Failed to lock the device."
          );
        }
      }
    } else {
      Alert.alert("Warning", "Device lock functionality is not available.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        <Text style={styles.title}>Hello! 👋</Text>
        <Text style={styles.name}>Sendil Bala</Text>
        <Text style={styles.subtitle}>Welcome to my React Native App</Text>
        {!isAdmin && (
          <Text style={styles.warning}>
            ⚠️ Device admin permission required
          </Text>
        )}
        <Button title="Lock Device" onPress={lockDevice} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  name: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  warning: {
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
});

export default App;
