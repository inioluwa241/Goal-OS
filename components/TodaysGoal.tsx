import { getRelativeDate } from "@/constants/format_date";
import { Colors } from "@/constants/theme";
import { getAllForTodayGoal } from "@/db/crudOperations";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";
import ProgressRing from "./UI/ProgressRing";

interface Goal {
  id: string;
  title: string;
  progress_value: number;
  due_date: string;
}

const TodaysGoal = function () {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    // 1. Create an async wrapper
    async function loadGoals() {
      try {
        const stuff = await getAllForTodayGoal();
        setGoals(stuff);
        console.log(stuff);
      } catch (e) {
        console.error("Failed to load goals", e);
      }
    }

    loadGoals(); // 3. Run it
  }, []);

  return (
    <View style={styles.tG}>
      <ThemedText textType="defaultSubHead"> today&apos;s goals</ThemedText>
      <View style={styles.progressCardContiners}>
        {goals.slice(-4).map((each, key) => {
          const title =
            each.title.length > 20
              ? `${each.title.slice(0, 17)}...`
              : each.title;
          return (
            <TouchableOpacity
              key={each.id}
              style={styles.progressCard}
              onPress={() =>
                router.push({
                  pathname: "/goals/[id]",
                  params: { id: each.id },
                })
              }
            >
              <View>
                <ProgressRing
                  color={c.accent}
                  progress={Number(each.progress_value / 100)}
                />
              </View>
              <View style={styles.midContainer}>
                <ThemedText textType="default">{title}</ThemedText>
                <View style={styles.subMidContainer}>
                  <ThemedText textType="mutedDefault">
                    {each.progress_value}%
                  </ThemedText>
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 4,
                    }}
                  >
                    <ThemedText
                      textType="mutedDefault"
                      style={{ lineHeight: undefined, fontSize: 6 }}
                    >
                      {"\u2022"}
                    </ThemedText>
                  </View>
                  <ThemedText textType="mutedDefault">
                    Due in {getRelativeDate(each.due_date)}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.progressTextContainer}>
                <ThemedText
                  textType="coloredDefault"
                  style={{ textAlign: "right" }}
                >
                  {each.progress_value}%
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default TodaysGoal;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    tG: { marginVertical: 20 },
    progressCardContiners: {
      gap: 10,
    },
    progressCard: {
      padding: 10,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.card,
      //   gap: 10,

      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    ProgressRingView: {
      flex: 1,
      justifyContent: "flex-start",
    },
    midContainer: {
      //   flex: 1,
      width: "50%",
    },
    subMidContainer: {
      flexDirection: "row",
      //   justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
    },
    progressTextContainer: {
      width: 45, // fixed width — enough for "100%"
      alignItems: "flex-end",
    },
  });
};
