import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Button,
  NativeModules,
} from "react-native";

const { DeviceLock } = NativeModules;

function App() {
  const lockDevice = () => {
    if (DeviceLock && DeviceLock.lockNow) {
      DeviceLock.lockNow();
    } else {
      console.warn("Device lock functionality is not available.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        <Text style={styles.title}>Hello! 👋</Text>
        <Text style={styles.name}>Your Name Here</Text>
        <Text style={styles.subtitle}>Welcome to my React Native App</Text>
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
});

export default App;
