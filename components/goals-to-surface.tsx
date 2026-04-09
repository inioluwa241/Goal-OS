import { Colors } from "@/constants/theme";
import { getAllForDailyTitle } from "@/db/crudOperations";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

interface Goals {
  id: string;
  title: string;
  type: number;
}

const GoalsToSurface = function ({
  onSelect,
  minSelected = 3, // ✅ default minimum is 3
}: {
  onSelect: (selectedGoals: Goals[]) => void;
  minSelected?: number;
}) {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [selectedGoals, setSelectedGoals] = useState<Goals[]>([]);
  const [goals, setGoals] = useState<Goals[]>([]);

  const labels = ["", "Daily", "Weekly", "Monthly", "Yearly"];

  useEffect(() => {
    async function loadGoals() {
      try {
        const stuff = await getAllForDailyTitle();
        setGoals(stuff);

        // ✅ auto-select first 3 if there are more than 3
        if (stuff.length > 3) {
          const defaultSelected = stuff.slice(0, 3);
          setSelectedGoals(defaultSelected);
          onSelect(defaultSelected);
        } else {
          setSelectedGoals(stuff);
          onSelect(stuff);
        }
      } catch (e) {
        console.error("Failed to load streaks", e);
      }
    }

    loadGoals();
  }, []);

  const handleToggle = (item: Goals) => {
    const isSelected = selectedGoals.some((goal) => goal.id === item.id); // ✅ fixed: was .includes() which doesn't work for objects

    // ✅ block deselect if already at minimum
    if (isSelected && selectedGoals.length <= minSelected) return;

    const updated = isSelected
      ? selectedGoals.filter((goal) => goal.id !== item.id)
      : [...selectedGoals, item];

    setSelectedGoals(updated);
    onSelect(updated); // ✅ fixed: was calling onSelect(selectedGoals) which is stale state
  };

  return (
    <View style={styles.card}>
      {/* ✅ hint when at minimum */}
      {selectedGoals.length <= minSelected && (
        <ThemedText textType="mutedDefault" style={{ fontSize: 12 }}>
          At least {goals.length > 3 ? minSelected : goals.length} goals must be
          selected
        </ThemedText>
      )}

      {goals.map((item) => {
        const selected = selectedGoals.some((goal) => goal.id === item.id);
        const isAtMinimum = selected && selectedGoals.length <= minSelected; // ✅

        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.each, isAtMinimum && { opacity: 0.5 }]}
            onPress={() => handleToggle(item)}
            activeOpacity={isAtMinimum ? 1 : 0.7}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: selected ? c.accent : c.border,
                backgroundColor: selected ? c.foreground : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected && (
                <Text style={{ color: c.background, fontSize: 14 }}>✓</Text>
              )}
            </View>
            <View style={styles.textView}>
              <ThemedText textType="default">{item.title}</ThemedText>
              <ThemedText textType="mutedDefault">
                ({labels[item.type]})
              </ThemedText>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default GoalsToSurface;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    card: {
      marginVertical: 10,
      paddingVertical: 20,
      paddingHorizontal: 15,
      borderWidth: 2,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.card,
      gap: 20,
    },
    each: {
      flexDirection: "row",
      gap: 10,
    },
    textView: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
    },
  });
};
