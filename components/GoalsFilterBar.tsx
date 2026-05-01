import { Colors } from "@/constants/theme";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

interface Props {
  onSelect: (value: number) => void;
}

const filters = [
  { id: 0, label: "All" },
  { id: 1, label: "Daily" },
  { id: 2, label: "Weekly" },
  { id: 3, label: "Monthly" },
  { id: 4, label: "Yearly" },
];
const GoalsFilterBar = function ({ onSelect }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);
  const [activeFilter, setActiveFilter] = useState(filters[0].id);

  return (
    <ScrollView
      horizontal={true}
      style={{ flexGrow: 0, flexShrink: 0 }} // 👈 add flexShrink: 0
      contentContainerStyle={styles.goalsFilterBar}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          onPress={() => {
            setActiveFilter(filter.id);
            onSelect(filter?.id);
          }}
          style={[
            styles.filterStyle,
            activeFilter === filter.id && styles.activeFilter,
          ]}
        >
          <Text
            style={{
              fontSize: 13,
              color:
                activeFilter === filter.id ? c.background : c.mutedForeground,
            }}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default GoalsFilterBar;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    goalsFilterBar: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      alignItems: "flex-start", // 👈 add this
    },
    filterStyle: {
      backgroundColor: c.card,
      paddingVertical: 6, // bring this back
      paddingHorizontal: 15,
      borderRadius: 12,
    },
    activeFilter: {
      backgroundColor: c.accent,
    },
  });
};
