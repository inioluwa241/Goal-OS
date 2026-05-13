import ActiveStreak from "@/components/ActiveStreak";
import GoalHealthScore from "@/components/GoalHealthScore";
import MorningBrief from "@/components/MorningBrief";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import TodaysGoal from "@/components/TodaysGoal";
import { formatDate } from "@/constants/format_date";
import { Colors } from "@/constants/theme";
import {
  computeHealthScore,
  getAllForDailyTitle,
  getAllForStreak,
  hasAnyGoals,
  recalculateStreaks,
  updateAllGoalsOnStatus,
} from "@/db/crudOperations";
import db from "@/db/localDataBase";
import { getProfile } from "@/services/profile";
import { supabase } from "@/services/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Goals {
  id: string;
  title: string;
  type: number;
}

export default function Index() {
  const scheme = useColorScheme() ?? "light";

  const [goals, setGoals] = useState<Goals[]>([]);
  const [asoals, setasoals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streakGoals, setStreakGoals] = useState<
    { id: string; title: string; streak: number }[]
  >([]);
  const [healthScore, setHealthScore] = useState(0);
  const [firstName, setFirstName] = useState("");

  // Load user's first name from their profile
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const profile = await getProfile(user.id);
      if (profile?.full_name) {
        // Extract just the first name
        setFirstName(profile.full_name.split(" ")[0]);
      } else if (user.email) {
        // Fallback: use the part before @ in the email
        setFirstName(user.email.split("@")[0]);
      }
    };

    loadUser();

    // Also listen for auth changes so name updates if user logs in/out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else {
        setFirstName("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load goals
  useEffect(() => {
    async function loadGoals() {
      const all = await db.getAllAsync("SELECT id, title, type FROM goals");
      console.log("All goals in SQLite:", all);
      const goalsExist = await hasAnyGoals();
      if (goalsExist) {
        setasoals(true);
      }
      try {
        await recalculateStreaks();
        const [daily, streaks] = await Promise.all([
          getAllForDailyTitle(),
          getAllForStreak(),
        ]);
        const score = computeHealthScore();
        setGoals(daily);
        // console.log("omooooooooooo", streaks);

        setStreakGoals(streaks);
        setHealthScore(score);
      } catch (e) {
        console.error("Failed to load goals", e);
      } finally {
        setLoading(false);
      }
    }

    loadGoals();
    updateAllGoalsOnStatus();
  }, []);

  const isEmpty = !loading && !asoals;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = firstName || "there";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[scheme].background }}
    >
      <ScrollView contentContainerStyle={isEmpty ? { flex: 1 } : undefined}>
        <ThemedView
          style={{ flex: 1, width: "80%", alignSelf: "center", paddingTop: 30 }}
        >
          <ThemedText textType="headForeground">
            {greeting()}, {displayName}
          </ThemedText>
          <ThemedText textType="mutedDefault">
            {formatDate(new Date().toISOString())}
          </ThemedText>

          {isEmpty ? (
            <View style={styles.emptyContainer}>
              <ThemedText textType="default" style={styles.emptyEmoji}>
                🎯
              </ThemedText>
              <ThemedText textType="headForeground" style={styles.emptyTitle}>
                No goals yet
              </ThemedText>
              <ThemedText textType="mutedDefault" style={styles.emptySubtitle}>
                Set your first goal and start building momentum.
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  { backgroundColor: Colors[scheme].accent },
                ]}
                onPress={() => router.push("/add-goals")}
              >
                <ThemedText textType="default" style={styles.ctaText}>
                  Create your first goal
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {goals.length && (
                <MorningBrief pageRendering="home" selectedGoals={goals} />
              )}
              <TodaysGoal />
              <ActiveStreak />
              <GoalHealthScore score={healthScore} />
            </>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  ctaButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
