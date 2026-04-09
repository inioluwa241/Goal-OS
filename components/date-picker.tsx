import { Colors } from "@/constants/theme";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

export default function MorningTimeInput({
  onTimeChange,
}: {
  onTimeChange?: (time: string) => void; // ✅ added prop
}) {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];
  const [isFocused, setIsFocused] = useState(false);
  const [hours, setHours] = useState("07");
  const [minutes, setMinutes] = useState("00");
  const hourRef = useRef<TextInput>(null);
  const minuteRef = useRef<TextInput>(null);

  const handleHourChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    if (Number(cleaned) > 12) return;
    setHours(cleaned);
    onTimeChange?.(`${cleaned.padStart(2, "0")}:${minutes.padStart(2, "0")}`); // ✅ notify parent
    if (cleaned.length === 2 || Number(cleaned) > 1) {
      minuteRef.current?.focus();
    }
  };

  const handleMinuteChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    if (Number(cleaned) > 59) return;
    setMinutes(cleaned);
    onTimeChange?.(`${hours.padStart(2, "0")}:${cleaned.padStart(2, "0")}`); // ✅ notify parent
  };

  const formatDisplay = () => {
    const h = hours.padStart(2, "0");
    const m = minutes.padStart(2, "0");
    return `${h}:${m} AM`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[
            styles.inputRow,
            isFocused ? styles.isfocused : styles.inputRow,
          ]}
          activeOpacity={1}
          onPress={() => hourRef.current?.focus()}
        >
          <TextInput
            ref={hourRef}
            style={[styles.input]}
            value={hours}
            onChangeText={handleHourChange}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            onFocus={() => setIsFocused(true)}
          />
          <Text style={styles.colon}>:</Text>
          <TextInput
            ref={minuteRef}
            style={styles.input}
            value={minutes}
            onChangeText={handleMinuteChange}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
          />
          <Text style={styles.amLabel}>AM</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    container: {},
    inputRow: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 13,
    },
    input: {
      color: c.foreground,
      fontWeight: "600",
      fontSize: 17,
    },
    colon: { color: c.foreground },
    amLabel: { color: c.foreground },
    body: {
      width: "85%",
      alignSelf: "center",
      gap: 35,
      paddingTop: 40,
      paddingBottom: 100,
    },
    isfocused: {
      borderWidth: 2,
      borderColor: c.accent,
    },
    dualView: {
      gap: 10,
    },
  });
};
