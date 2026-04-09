import { Colors } from "@/constants/theme";
import { useColorScheme, View } from "react-native";
import { ThemedText } from "../themed-text";

const NoteCard = function ({
  title,
  note,
  category,
  date,
}: {
  title: string;
  note: string;
  category: string;
  date: string;
}) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return (
    <View
      style={{
        padding: 15,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 12,
        backgroundColor: c.card,
        gap: 10,
      }}
    >
      <ThemedText
        textType="default"
        style={{
          fontSize: 15,
          fontWeight: "600",
        }}
      >
        {title}
      </ThemedText>
      <ThemedText textType="mutedSmallText" numberOfLines={2}>
        {note}
      </ThemedText>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <ThemedText
          textType="default"
          style={{
            fontSize: 12,
            backgroundColor: "#2d2d2d",
            padding: 5,
            paddingHorizontal: 7,
            borderRadius: 15,
          }}
        >
          {category}
        </ThemedText>
        <ThemedText textType="mutedSmallText">{date}</ThemedText>
      </View>
    </View>
  );
};

export default NoteCard;
