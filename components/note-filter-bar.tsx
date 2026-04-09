import { Colors } from "@/constants/theme";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { ThemedText } from "./themed-text";

const filters = ["All", "Mindset", "Gratitude", "Lessons", "Ideas"];
const NotesFilterBar = function ({
  onSelect,
}: {
  onSelect: (category: string) => void;
}) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  return (
    <ScrollView horizontal={true} contentContainerStyle={styles.noteFilterBar}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          onPress={() => {
            setActiveFilter(filter);
            onSelect(filter);
          }}
          style={[
            styles.filterStyle,
            activeFilter === filter && styles.activeFilter,
          ]}
        >
          <ThemedText
            textType="mutedDefault"
            style={{
              fontSize: 15,
              color: activeFilter === filter ? c.background : c.mutedForeground,
            }}
          >
            {filter}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default NotesFilterBar;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    noteFilterBar: {
      flexDirection: "row",
      gap: 10,
      //   position: "fixed",
      paddingTop: 10,
      padding: 20,
      //   minHeight: "12%",
      borderTopWidth: 1,
      borderColor: c.border,
    },
    filterStyle: {
      backgroundColor: c.card,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 12,
    },
    activeFilter: {
      backgroundColor: c.accent,
    },
  });
};
