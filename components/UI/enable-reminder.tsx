import { Colors } from "@/constants/theme";
import { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

const EnableReminder = function ({
  onEnable,
  textContent,
  color,
}: {
  onEnable: (enabledValue: boolean) => void;
  textContent: string;
  color: string;
}) {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <ThemedText
        textType="default"
        style={{ fontSize: 16, fontWeight: "600" }}
      >
        {textContent}
      </ThemedText>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          onEnable(!isEnabled);
          setIsEnabled(!isEnabled);
        }}
        style={[
          styles.track,
          { backgroundColor: isEnabled ? c.accent : c.card },
        ]}
      >
        <View
          style={[
            styles.thumb,
            {
              alignSelf: isEnabled ? "flex-end" : "flex-start",
              backgroundColor: color,
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

export default EnableReminder;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    track: {
      width: 50,
      height: 28,
      borderRadius: 15,
      padding: 2,
    },
    thumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      // shadow for depth
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
    },
  });
};
