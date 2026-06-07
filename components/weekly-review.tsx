import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import {
  addWeeklyReview,
  getSetting,
  getWeeklyReviews,
  WeeklyReview,
} from "@/db/crudOperations";
import { syncLocalDataToSupabase } from "@/services/sync";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const MoodEmojis = ["😞", "😕", "😐", "🙂", "😄"];

const WeeklyReviewComponent = function () {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [mood, setMood] = useState<number | null>(null);
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [reflection, setReflection] = useState("");
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);

  const loadReviews = () => {
    try {
      const rows = getWeeklyReviews();
      setReviews(rows);
    } catch (e) {
      console.error("Failed to load weekly reviews:", e);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, []),
  );

  const handleSave = async () => {
    if (!mood) return;

    try {
      const id = addWeeklyReview({
        mood,
        wins,
        challenges,
        reflection,
      });

      // clear form
      setMood(null);
      setWins("");
      setChallenges("");
      setReflection("");

      // refresh
      loadReviews();

      const userId = getSetting("user_id");
      if (userId && userId !== "null") {
        await syncLocalDataToSupabase(userId).catch(console.error);
      }

      return id;
    } catch (e) {
      console.error("Failed to save weekly review:", e);
      return null;
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
          NEW WEEKLY REVIEW
        </ThemedText>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Mood</Text>
          <View style={styles.moodRow}>
            {MoodEmojis.map((e, idx) => {
              const value = idx + 1;
              const active = mood === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.moodBtn,
                    active && { backgroundColor: c.accent },
                  ]}
                  onPress={() => setMood(value)}
                >
                  <Text style={styles.moodText}>{e}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Wins this week</Text>
          <TextInput
            value={wins}
            onChangeText={setWins}
            multiline
            numberOfLines={3}
            style={styles.textInput}
            placeholder="What went well?"
            placeholderTextColor={c.mutedForeground}
          />

          <Text style={styles.fieldLabel}>Challenges</Text>
          <TextInput
            value={challenges}
            onChangeText={setChallenges}
            multiline
            numberOfLines={3}
            style={styles.textInput}
            placeholder="What was hard?"
            placeholderTextColor={c.mutedForeground}
          />

          <Text style={styles.fieldLabel}>Reflection / notes</Text>
          <TextInput
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={4}
            style={styles.textInput}
            placeholder="Any other thoughts..."
            placeholderTextColor={c.mutedForeground}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <ThemedText textType="default" style={styles.saveText}>
              Save Review
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
          PAST REVIEWS
        </ThemedText>

        {reviews.length === 0 ? (
          <Text style={styles.emptyText}>No reviews yet.</Text>
        ) : (
          reviews.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.reviewHeader}>
                <Text style={styles.weekStart}>{r.week_start}</Text>
                <Text style={styles.moodText}>
                  {MoodEmojis[(r.mood || 1) - 1]}
                </Text>
              </View>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={styles.reviewWins}
              >
                {r.wins}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
};

export default WeeklyReviewComponent;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    container: {
      width: "85%",
      alignSelf: "center",
      paddingTop: 30,
      paddingBottom: 100,
      gap: 18,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.5,
      color: c.mutedForeground,
    },
    card: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 12,
      gap: 10,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: c.foreground,
    },
    moodRow: {
      flexDirection: "row",
      gap: 8,
    },
    moodBtn: {
      padding: 8,
      borderRadius: 10,
      backgroundColor: "transparent",
    },
    moodText: {
      fontSize: 20,
    },
    textInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 10,
      backgroundColor: c.background,
      color: c.foreground,
      textAlignVertical: "top",
    },
    saveButton: {
      backgroundColor: c.accent,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 6,
    },
    saveText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    emptyText: {
      color: c.mutedForeground,
      textAlign: "center",
      paddingVertical: 12,
    },
    reviewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    weekStart: {
      fontSize: 13,
      color: c.foreground,
      fontWeight: "600",
    },
    reviewWins: {
      color: c.foreground,
    },
  });
};
