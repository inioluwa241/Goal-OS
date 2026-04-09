import { Colors } from "@/constants/theme";
import { Dimensions, useColorScheme, View } from "react-native";
import { ThemedText } from "./themed-text";

const VisionGridDisplay = function () {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const tileSize = Dimensions.get("window").width / 2.5; // 2 per row

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingTop: "30%",
        justifyContent: "space-between",
        rowGap: 50,
        columnGap: 17,
      }}
    >
      {[
        { label: "Active Goals", value: "8" },
        { label: "Completion Rate", value: "68%" },
        { label: "Current Streak", value: "12 days" },
        { label: "This Week", value: "6/8" },
      ].map((each, index) => (
        <View
          key={index}
          style={{
            width: tileSize,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            backgroundColor: c.card,
            paddingHorizontal: 10,
            paddingVertical: 15,
            justifyContent: "center",
            alignItems: "center",
            gap: 15,
          }}
        >
          <ThemedText textType="mutedDefault" style={{ textAlign: "center" }}>
            {each.label.toUpperCase()}
          </ThemedText>
          <ThemedText
            textType="coloredHeadingForeground"
            style={{ textAlign: "center" }}
          >
            {each.value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
};

export default VisionGridDisplay;
