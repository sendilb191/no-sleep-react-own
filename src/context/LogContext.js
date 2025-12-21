import React, { createContext, useContext, useState, useCallback } from "react";

const LogContext = createContext();

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prevLogs) =>
      [`[${timestamp}] ${message}`, ...prevLogs].slice(0, 100)
    );
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  );
};

export const useLog = () => useContext(LogContext);
