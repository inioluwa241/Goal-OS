import { Colors } from "@/constants/theme";
import { StyleSheet, useColorScheme, View } from "react-native";
import { ThemedText } from "./themed-text";
import ProgressRing from "./UI/ProgressRing";

interface Props {
  score: number;
}

const GoalHealthScore = function ({ score }: Props) {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const getMessage = (score: number) => {
    if (score >= 80) return "Great progress! Keep up the momentum.";
    if (score >= 50) return "You're making progress. Stay consistent.";
    if (score > 0) return "Some goals need attention. Keep pushing.";
    return "No active goals tracked yet.";
  };

  return (
    <View style={styles.gHS}>
      <ThemedText textType="defaultSubHead">goal health score</ThemedText>
      <View style={styles.gHSCard}>
        <ProgressRing
          size={220}
          thickness={5}
          color={c.accent}
          progress={score / 100}
        >
          <View>
            <ThemedText textType="coloredHeadingForeground">
              {score}%
            </ThemedText>
            <ThemedText textType="mutedDefault"> on track</ThemedText>
          </View>
        </ProgressRing>

        <ThemedText
          textType="mutedDefault"
          style={{ textAlign: "center", width: "80%" }}
        >
          {getMessage(score)}
        </ThemedText>
      </View>
    </View>
  );
};

export default GoalHealthScore;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    gHS: {
      marginVertical: 20,
    },
    streakLIst: {
      flexDirection: "row",
      gap: 10,
      marginVertical: 10,
    },
    gHSCard: {
      marginTop: 20,
      padding: 30,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.card,
      justifyContent: "space-between",
      alignItems: "center",
      gap: 40,
    },
  });
};
