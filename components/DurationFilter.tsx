import { Colors } from "@/constants/theme";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

const filters = [
  { id: 1, label: "Daily" },
  { id: 2, label: "Weekly" },
  { id: 3, label: "Monthly" },
  { id: 4, label: "Yearly" },
];

const DurationFilter = function ({
  onSelect,
}: {
  onSelect: (selectedLabel: number) => void;
}) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);
  const [activeFilter, setActiveFilter] = useState(filters[0].id);

  useEffect(() => {
    // This runs automatically once the component mounts
    onSelect(activeFilter);
  }, []);

  return (
    <View style={[styles.gPageInput, styles.filterContainer]}>
      {filters.map((each) => (
        <TouchableOpacity
          key={each.id}
          onPress={() => {
            setActiveFilter(each.id);
            onSelect(each.id);
          }}
          style={activeFilter === each.id ? styles.activeFilter : styles.filter}
        >
          <ThemedText
            textType="mutedDefault"
            style={{
              color:
                activeFilter === each.id ? c.foreground : c.mutedForeground,
            }}
          >
            {each.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default DurationFilter;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    gPageInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 7,
      backgroundColor: c.card,
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 5,
      paddingVertical: 5,
      alignItems: "center",
    },
    filter: {
      flex: 1,
      padding: 10,
      borderRadius: 10,
      alignItems: "center",
    },
    activeFilter: {
      backgroundColor: c.accent,
      flex: 1,
      padding: 10,
      borderRadius: 10,
      alignItems: "center",
    },
  });
};
