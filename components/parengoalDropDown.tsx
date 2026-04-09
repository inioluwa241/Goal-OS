import { Colors } from "@/constants/theme";
import { getAllGoalPreviews } from "@/db/crudOperations";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { TouchableOpacity, useColorScheme, View } from "react-native";
import { ThemedText } from "./themed-text";

// const OPTIONS = [
//   "Launch a business",
//   "Financial freedom",
//   "Career growth",
//   "Health",
//   "No parent goal",
// ];

// Your button
interface Props {
  onSelect: (value: string) => void; // or whatever type your data is
  type: number;
}

interface GoalPreview {
  id: string;
  title: string;
  type: number;
}

const ParentGoalDropDown = function ({ onSelect, type }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const [selected, setSelected] = useState<string | null>("No parent goal");
  const [open, setOpen] = useState(false);
  const [parentGoals, setparentGoals] = useState<GoalPreview[]>([]);
  const OPTIONS = parentGoals.filter((each) => each.type > type);

  useEffect(() => {
    // 1. Create an async wrapper
    async function loadGoals() {
      try {
        const parentGoal = await getAllGoalPreviews();
        setparentGoals(parentGoal); // 2. Save the real data to state
        console.log(parentGoal);
      } catch (e) {
        console.error("Failed to load goals", e);
      }
    }

    loadGoals(); // 3. Run it
  }, []);

  useEffect(() => {
    setOpen(false);
    setSelected("No parent goal");
  }, [type]);
  return (
    <View>
      <TouchableOpacity
        disabled={OPTIONS.length === 0}
        onPress={() => setOpen(!open)}
        style={{
          minWidth: "60%", // Start at 60%, but allow growth
          alignSelf: "flex-start", // Prevents the box from stretching to 100% width automatically
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 7,
          backgroundColor: c.card,
          paddingVertical: 10,
          paddingHorizontal: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <ThemedText textType="default" style={{ flexShrink: 1 }}>
          {selected}
        </ThemedText>
        <Ionicons name="chevron-down" size={24} color={c.foreground} />
      </TouchableOpacity>

      {open && (
        <View
          style={{
            gap: 10,
            width: "70%",
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 7,
            backgroundColor: c.card,
            paddingVertical: 10,
            paddingHorizontal: 5,
            marginTop: 5,
          }}
        >
          {OPTIONS?.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={{
                minWidth: "70%",
                borderRadius: 7,
                gap: 20,
                backgroundColor: selected === option.title ? c.accent : "",
                paddingVertical: 8,
                paddingHorizontal: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => {
                setSelected(option?.title);
                onSelect(option?.id);
                setOpen(false);
              }}
            >
              <ThemedText
                textType="default"
                style={{ flex: 1, marginRight: 10 }}
              >
                {option?.title}
              </ThemedText>
              {selected === option?.title ? (
                <Ionicons
                  name="checkmark"
                  size={24}
                  color={c.mutedForeground}
                />
              ) : (
                ""
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default ParentGoalDropDown;
