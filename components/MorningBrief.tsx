import { formatDate } from "@/constants/format_date";
import { Colors } from "@/constants/theme";
import {
  getBestStreak,
  getGoalTitleById,
  getIncompleteDailyGoals,
  getSetting,
  saveSetting,
} from "@/db/crudOperations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
  // ── ALL hooks at the top, no exceptions ───────────────────────────────────
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const [goalsToMap, setGoalsToMap] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [briefText, setBriefText] = useState<string | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [bestStreak, setBestStreak] = useState<number>(0);

  useEffect(() => {
    try {
      const savedGoalString = getSetting("morning_brief_goals");
      const mGoalSetting = savedGoalString ? JSON.parse(savedGoalString) : [];

      const resolved = mGoalSetting.map((id: string) => ({
        id,
        title: getGoalTitleById(id) ?? "",
      }));

      // Use saved goals if available, otherwise fall back to selectedGoals prop
      setGoalsToMap(resolved.length > 0 ? resolved : selectedGoals);
    } catch (e) {
      console.error("MorningBrief load error:", e);
      setGoalsToMap(selectedGoals);
    }
  }, [selectedGoals]);

  // Generate or load cached morning brief on mount (when viewing the full screen)
  useEffect(() => {
    const run = async () => {
      if (pageRendering === "home") return; // only generate on the full screen

      try {
        const todayKey = new Date().toISOString().split("T")[0];
        const cacheKey = `morning_brief_${todayKey}`;
        const cached = getSetting(cacheKey);
        if (cached) {
          setBriefText(cached);
        } else {
          setLoadingBrief(true);

          const goals = getIncompleteDailyGoals();
          const goalNames = goals.map((g) => g.title).filter(Boolean);
          const streak = getBestStreak();
          setBestStreak(streak);

          const prompt = `You are a friendly assistant. Today is ${todayKey}. The user's incomplete daily goals are: ${
            goalNames.length ? goalNames.join(", ") : "(none)"
          }. The user's best streak is ${streak} days. Write a concise, three-sentence personal morning brief that references the user's actual goal names where appropriate and ends with a single clear action the user can do right now.`;

          try {
            const res = await fetch(
              "https://api.grok.com/openai/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_KEY}`,
                },
                body: JSON.stringify({
                  model: "grok-1",
                  max_tokens: 150,
                  messages: [{ role: "user", content: prompt }],
                }),
              },
            );

            const data = await res.json();

            // Try a few common response shapes
            let text = "";
            if (typeof data === "string") text = data;
            else if (data.completion) text = data.completion;
            else if (data.choices && data.choices[0]) {
              const c = data.choices[0];
              text = c.message?.content || c.text || JSON.stringify(c);
            } else if (
              data.output &&
              data.output[0] &&
              data.output[0].content
            ) {
              // anthropic-ish
              const content = data.output[0].content[0];
              text = content?.text || JSON.stringify(content);
            } else {
              text = JSON.stringify(data);
            }

            const final = String(text).trim();
            setBriefText(final);
            try {
              saveSetting(cacheKey, final);
            } catch (e) {
              console.error("Failed to save morning brief cache:", e);
            }
          } catch (err) {
            console.error("Failed to fetch morning brief:", err);
            setBriefText("Could not generate your morning brief right now.");
          } finally {
            setLoadingBrief(false);
          }
        }
      } catch (e) {
        console.error("Morning brief error:", e);
      }
    };

    run();
  }, [pageRendering]);

  // ── Render ────────────────────────────────────────────────────────────────
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
        {goalsToMap.map((each, index) => (
          <View key={each.id} style={styles.brief}>
            <View style={styles.indexContainer}>
              <Text style={styles.index}>{index + 1}</Text>
            </View>
            <ThemedText textType="default">{each.title}</ThemedText>
          </View>
        ))}
      </View>

      <Divider />
      {loadingBrief ? (
        <ThemedText textType="mutedItalics" style={{ textAlign: "center" }}>
          Generating your morning brief...
        </ThemedText>
      ) : (
        <ThemedText
          textType="default"
          style={{ textAlign: "left", marginTop: 8 }}
        >
          {briefText ?? "'You have the power to make today extraordinary.'"}
        </ThemedText>
      )}

      <View style={styles.streak}>
        <MaterialCommunityIcons name="fire" size={25} color={"red"} />
        <ThemedText textType="coloredDefault">
          {" "}
          {bestStreak}-days streak
        </ThemedText>
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
