import React from "react";
import MainScreen from "./src/screens/MainScreen";
import { LogProvider } from "./src/context/LogContext";

const App = () => {
  return (
    <LogProvider>
      <MainScreen />
    </LogProvider>
  );
};

export default App;
