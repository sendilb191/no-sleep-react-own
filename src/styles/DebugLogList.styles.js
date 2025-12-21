import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
    maxHeight: 250,
    borderRadius: 12,
    backgroundColor: "#1C1C1E",
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  copyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  scroll: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 4,
  },
  logLine: {
    fontSize: 12,
    color: "#D1D1D6",
    marginBottom: 4,
    fontFamily: "monospace",
  },
});
