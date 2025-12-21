import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: "#F0F4FF",
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0A1F44",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#344054",
    marginBottom: 20,
    textAlign: "center",
  },
  pickersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A1F44",
    marginBottom: 8,
    textAlign: "center",
  },
  dropdownButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownDisabled: {
    backgroundColor: "#F3F4F6",
    opacity: 0.7,
  },
  dropdownButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0A1F44",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#6B7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "70%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A1F44",
    marginBottom: 16,
    textAlign: "center",
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionItemSelected: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 18,
    color: "#0A1F44",
    textAlign: "center",
  },
  optionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  countdownContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#FEF3F2",
    borderRadius: 12,
  },
  countdownLabel: {
    fontSize: 14,
    color: "#B42318",
    marginBottom: 4,
  },
  countdown: {
    fontSize: 32,
    color: "#DC2626",
    fontWeight: "700",
    fontFamily: "monospace",
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  activeButton: {
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "#DC2626",
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
  testButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 10,
  },
  testToastButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
});
