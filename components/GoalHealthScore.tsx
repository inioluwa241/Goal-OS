import { Colors } from "@/constants/theme";
import { StyleSheet, useColorScheme, View } from "react-native";
import { ThemedText } from "./themed-text";
import ProgressRing from "./UI/ProgressRing";

const GoalHealthScore = function () {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  return (
    <View style={styles.gHS}>
      <ThemedText textType="defaultSubHead">goal health score</ThemedText>
      <View style={styles.gHSCard}>
        <ProgressRing
          size={220}
          thickness={5}
          color={c.accent}
          progress={Number(75 / 100)}
        >
          <View>
            <ThemedText textType="coloredHeadingForeground">72%</ThemedText>
            <ThemedText textType="mutedDefault"> on track</ThemedText>
          </View>
        </ProgressRing>

        <ThemedText
          textType="mutedDefault"
          style={{ textAlign: "center", width: "80%" }}
        >
          Great progress! Keep up the momentum with your active goals.
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
      gap: "10",
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
