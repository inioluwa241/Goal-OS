import { Colors } from "@/constants/theme";
import { getAllForStreak, recalculateStreaks } from "@/db/crudOperations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

interface Streaks {
  id: string;
  title: string;
  streak: number;
}

const ActiveStreak = function () {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];
  const [streaks, setStreaks] = useState<Streaks[]>([]);

  useEffect(() => {
    async function loadStreak() {
      try {
        recalculateStreaks();
        const stuff = await getAllForStreak();
        // only show goals that actually have an active streak
        setStreaks(stuff.filter((g) => g.streak > 0));
      } catch (e) {
        console.error("Failed to load streaks", e);
      }
    }

    loadStreak();
  }, []);

  if (streaks.length === 0) return null;

  return (
    <View style={styles.activeStreak}>
      <ThemedText textType="defaultSubHead">Active Streaks</ThemedText>
      <ScrollView horizontal={true} contentContainerStyle={styles.streakLIst}>
        {streaks.map((each) => (
          <TouchableOpacity
            key={each.id}
            style={styles.streakCard}
            onPress={() =>
              router.push({
                pathname: "/goals/[id]",
                params: { id: each.id },
              })
            }
          >
            <View>
              <MaterialCommunityIcons name="fire" size={25} color={"red"} />
            </View>
            <View>
              <ThemedText textType="coloredDefault">
                {each.streak} days
              </ThemedText>
              <ThemedText textType="mutedDefault">{each.title}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ActiveStreak;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    activeStreak: {
      marginVertical: 20,
    },
    streakLIst: {
      flexDirection: "row",
      gap: 10,
      marginVertical: 10,
    },
    streakCard: {
      padding: 10,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.card,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
  });
};
