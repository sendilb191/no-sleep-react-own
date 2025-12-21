import React from "react";
import MainScreen from "./src/screens/MainScreen";
import ErrorBoundary from "./src/components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <MainScreen />
    </ErrorBoundary>
  );
};

export default App;
