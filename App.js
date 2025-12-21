import React from "react";
import MainScreen from "./src/screens/MainScreen";
import { LogProvider } from "./src/context/LogContext";
import ErrorBoundary from "./src/components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <LogProvider>
        <MainScreen />
      </LogProvider>
    </ErrorBoundary>
  );
};

export default App;
