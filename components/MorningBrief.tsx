import { formatDate } from "@/constants/format_date";
import { Colors } from "@/constants/theme";
import { getGoalTitleById, getSetting } from "@/db/crudOperations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";
import Divider from "./UI/divider";

interface Goals {
  id: string;
  title: string;
  type: number;
}

const MorningBrief = function ({
  pageRendering,
  selectedGoals,
}: {
  pageRendering: string;
  selectedGoals: Goals[];
}) {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);

  const mTimeSetting = getSetting("morning_brief_time");
  const savedGoalString = getSetting("morning_brief_goals");

  const mGoalSetting = savedGoalString ? JSON.parse(savedGoalString) : [];

  console.log(mTimeSetting, mGoalSetting);

  const goals = mGoalSetting.map((each: string) => ({
    id: each,
    title: getGoalTitleById(each),
  })) as { id: number; title: string }[];
  console.log(goals);

  const goalsToMap = selectedGoals ? selectedGoals : goals;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        pageRendering === "home" &&
          router.push("/morning-brief-setting-screen");
      }}
    >
      {pageRendering === "home" ? (
        <ThemedText textType="coloredSubHead">Morning Brief</ThemedText>
      ) : (
        <View>
          <ThemedText textType="mutedDefault">Good Morning!</ThemedText>
          <ThemedText
            textType="defaultSubHead"
            style={{ textTransform: "none", marginTop: 5, fontSize: 19 }}
          >
            Today is {formatDate(new Date().toISOString())}
          </ThemedText>
        </View>
      )}

      <Divider />

      <View style={styles.briefs}>
        <ThemedText
          textType="coloredSubHead"
          style={{ fontSize: 15, marginBottom: 0 }}
        >
          YOUR FOCUS
        </ThemedText>
        {goalsToMap?.map((each, index) => (
          <View key={each.id} style={styles.brief}>
            <View style={styles.indexContainer}>
              <Text style={styles.index}>{index + 1}</Text>
            </View>
            <ThemedText textType="default">{each.title}</ThemedText>
          </View>
        ))}
      </View>

      <Divider />
      <ThemedText
        textType="mutedItalics"
        style={{ textAlign: "center", marginTop: 15 }}
      >
        &apos;You have the power to make today extraordinary.&apos;
      </ThemedText>

      <View style={styles.streak}>
        <MaterialCommunityIcons name="fire" size={25} color={"red"} />
        <ThemedText textType="coloredDefault"> 7-days streak</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default MorningBrief;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    card: {
      marginVertical: 10,
      paddingVertical: 40,
      paddingHorizontal: 30,
      borderWidth: 2,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.card,
      gap: 10,
    },
    briefs: {
      gap: 12,
      marginBottom: 20,
      marginTop: 8,
    },
    brief: {
      flexDirection: "row",
      gap: 10,
    },
    indexContainer: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: c.accentBackground,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 2,
    },
    index: {
      color: c.accent,
    },
    streak: {
      borderRadius: 25,
      borderWidth: 1,
      borderColor: c.accent,
      paddingVertical: 10,
      paddingHorizontal: 8,
      alignItems: "center",
      gap: 5,
      flexDirection: "row",
      alignSelf: "center",
      marginTop: 15,
      flex: 0,
      backgroundColor: c.accentBackground,
    },
  });
};
