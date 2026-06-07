import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean; // For destructive actions like delete
}

export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor,
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmationModalProps) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);

  const dangerColor = c.destructive;
  const buttonColor = isDangerous ? dangerColor : c.accent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: c.card }]}>
          {/* Header with Icon */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isDangerous
                    ? `${dangerColor}20`
                    : `${c.accent}20`,
                },
              ]}
            >
              <Ionicons
                name={isDangerous ? "alert-circle" : "help-circle"}
                size={32}
                color={isDangerous ? dangerColor : c.accent}
              />
            </View>
          </View>

          {/* Title */}
          <ThemedText
            textType="default"
            style={[styles.title, { color: c.foreground }]}
          >
            {title}
          </ThemedText>

          {/* Message */}
          <ThemedText
            textType="default"
            style={[styles.message, { color: c.mutedForeground }]}
          >
            {message}
          </ThemedText>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.button, { borderColor: c.border }]}
              activeOpacity={0.7}
            >
              <ThemedText
                textType="default"
                style={[styles.cancelButtonText, { color: c.mutedForeground }]}
              >
                {cancelText}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: buttonColor },
              ]}
              activeOpacity={0.7}
            >
              <ThemedText textType="default" style={[styles.confirmButtonText]}>
                {confirmText}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function useStyles(scheme: "light" | "dark") {
  const c = Colors[scheme];

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      borderRadius: 16,
      padding: 24,
      width: "85%",
      maxWidth: 320,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    header: {
      marginBottom: 16,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 12,
      textAlign: "center",
    },
    message: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 20,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },
    confirmButton: {
      borderWidth: 0,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: "500",
    },
    confirmButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });
}
