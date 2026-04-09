import { Colors } from "@/constants/theme";
import { useColorScheme, View } from "react-native";
import { ThemedText } from "./themed-text";

const VisionTextDisplay = function () {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <View style={{ gap: 20, justifyContent: "center" }}>
      <ThemedText
        textType="headForeground"
        style={{ textAlign: "center", marginBottom: 15 }}
      >
        Your Goals
      </ThemedText>
      <ThemedText
        textType="mutedDefault"
        style={{ textAlign: "center", marginBottom: 20 }}
      >
        Create bold goal text
      </ThemedText>
      {[
        "Build a Thriving Business",
        "Master New Skills",
        "Achieve Financial Freedom",
      ].map((each, index) => (
        <View
          key={index}
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            backgroundColor: c.card,
            paddingHorizontal: 10,
            paddingVertical: 30,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 0,
          }}
        >
          <ThemedText
            textType="defaultSubHead"
            style={{
              maxWidth: "85%",
              fontSize: 22,
              textAlign: "center",
              marginBottom: 0,
              lineHeight: 35,
            }}
          >
            {each}
          </ThemedText>
        </View>
      ))}
    </View>
  );
};

export default VisionTextDisplay;
