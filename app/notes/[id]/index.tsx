import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Divider from "@/components/UI/divider";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
// import { ThemedText } from "./themed-text";
// import { ThemedView } from "./themed-view";
// import Divider from "./UI/divider";

// ── Mock data ──────────────────────────────────────────────────────────────────
const mockNote = {
  id: "1",
  title: "Focus on the process, not the outcome",
  content:
    "Today I realized that success comes from consistent daily effort rather than obsessing over results. The process is what I can control. When I focus on showing up every day and doing the work, the outcomes take care of themselves. This mindset shift has been transformative.",
  tag: "Mindset",
  createdDate: "Today at 9:34 AM",
  isPinned: true,
};

const mockGoals = [
  { id: "1", title: "Complete project proposal" },
  { id: "2", title: "Run 5K morning" },
  { id: "3", title: "Learn Spanish for 30 min" },
  { id: "4", title: "Read 50 pages" },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [isPinned, setIsPinned] = useState(mockNote.isPinned);
  const [linkedGoal, setLinkedGoal] = useState<string | null>(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  const handlePinToggle = () => {
    setIsPinned((prev) => !prev);
    console.log("Pin toggled:", !isPinned);
  };

  const selectedGoalTitle =
    mockGoals.find((g) => g.id === linkedGoal)?.title ?? null;

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Note",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold",
            color: c.foreground,
          },
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.foreground,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerLeft}
            >
              <Ionicons name="arrow-back" size={22} color={c.foreground} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/notes/${id}/edit`)}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={{ borderTopWidth: 2, borderTopColor: c.border }}>
        <ScrollView contentContainerStyle={styles.body}>
          {/* Pinned Badge */}
          {isPinned && (
            <View style={styles.pinnedBadge}>
              <Ionicons name="pin" size={14} color={c.accent} />
              <Text style={styles.pinnedBadgeText}>Pinned to wallpaper</Text>
            </View>
          )}

          {/* Title Section */}
          <View style={styles.section}>
            <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
              YOUR NOTE
            </ThemedText>
            <ThemedText textType="headForeground" style={styles.noteTitle}>
              {mockNote.title}
            </ThemedText>
          </View>

          {/* Metadata */}
          <View style={styles.metadata}>
            <View style={styles.tagPill}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>{mockNote.tag}</Text>
            </View>
            <Text style={styles.dateText}>{mockNote.createdDate}</Text>
          </View>

          {/* Content */}
          <Text style={styles.noteContent}>{mockNote.content}</Text>

          <Divider />

          {/* Settings Section */}
          <View style={styles.section}>
            <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
              SETTINGS
            </ThemedText>

            {/* Pin Toggle */}

            <View style={styles.settingsCard}>
              <View style={styles.settingsCardText}>
                <Text style={styles.settingsCardTitle}>Pin this note</Text>
                <Text style={styles.settingsCardSubtitle}>
                  Appears on your lock screen and wallpaper
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  //   onEnable(!isEnabled);
                  setIsEnabled(!isEnabled);
                }}
                style={[
                  styles.track,
                  { backgroundColor: isEnabled ? c.accent : c.card },
                ]}
              >
                <View
                  style={[
                    styles.thumb,
                    {
                      alignSelf: isEnabled ? "flex-end" : "flex-start",
                      backgroundColor: c.background,
                    },
                  ]}
                />
              </TouchableOpacity>
              {/* <Switch
                value={isPinned}
                onValueChange={handlePinToggle}
                trackColor={{ false: c.border, true: c.accent }}
                thumbColor="#fff"
              /> */}
            </View>

            {/* Link to Goal */}
            <View style={styles.goalLinkGroup}>
              <Text style={styles.label}>Link to Goal (optional)</Text>

              {/* Goal options */}
              {showGoalPicker ? (
                <View style={styles.goalList}>
                  <TouchableOpacity
                    style={styles.goalOption}
                    onPress={() => {
                      setLinkedGoal(null);
                      setShowGoalPicker(false);
                    }}
                  >
                    <Text style={styles.goalOptionText}>No link</Text>
                    {linkedGoal === null && (
                      <Ionicons name="checkmark" size={16} color={c.accent} />
                    )}
                  </TouchableOpacity>
                  {mockGoals.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      style={styles.goalOption}
                      onPress={() => {
                        setLinkedGoal(goal.id);
                        setShowGoalPicker(false);
                      }}
                    >
                      <Text style={styles.goalOptionText}>{goal.title}</Text>
                      {linkedGoal === goal.id && (
                        <Ionicons name="checkmark" size={16} color={c.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.goalSelector}
                  onPress={() => setShowGoalPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.goalSelectorText,
                      !selectedGoalTitle && { color: c.mutedForeground },
                    ]}
                  >
                    {selectedGoalTitle ?? "Choose a goal to link..."}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={c.mutedForeground}
                  />
                </TouchableOpacity>
              )}

              {linkedGoal && (
                <Text style={styles.goalLinkedHint}>
                  This note will appear in the context of the linked goal
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];

  return StyleSheet.create({
    body: {
      width: "85%",
      alignSelf: "center",
      gap: 28,
      paddingTop: 40,
      paddingBottom: 100,
    },

    // Header
    headerLeft: {
      marginRight: 8,
    },
    editButton: {
      paddingVertical: 7,
      paddingHorizontal: 15,
      backgroundColor: c.accent,
      borderRadius: 12,
    },
    editButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },

    // Pinned badge
    pinnedBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: `${c.accent}18`,
      borderWidth: 1,
      borderColor: `${c.accent}50`,
      borderRadius: 999,
    },
    pinnedBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: c.accent,
    },

    // Section
    section: {
      gap: 12,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.5,
    },
    noteTitle: {
      fontSize: 28,
      fontWeight: "700",
      lineHeight: 36,
    },

    // Metadata
    metadata: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    tagPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
      paddingHorizontal: 10,
      backgroundColor: c.card,
      borderRadius: 999,
    },
    tagDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.accent,
    },
    tagText: {
      fontSize: 12,
      fontWeight: "500",
      color: c.foreground,
    },
    dateText: {
      fontSize: 12,
      color: c.muted,
    },

    // Content
    noteContent: {
      fontSize: 15,
      color: c.foreground,
      lineHeight: 24,
    },

    // Settings card (pin toggle)
    settingsCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
    },
    settingsCardText: {
      flex: 1,
      paddingRight: 16,
      gap: 4,
    },
    settingsCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: c.foreground,
    },
    settingsCardSubtitle: {
      fontSize: 12,
      color: c.mutedForeground,
    },

    // Goal link
    goalLinkGroup: {
      gap: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: c.foreground,
    },
    goalSelector: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
    },
    goalSelectorText: {
      fontSize: 14,
      color: c.foreground,
    },
    goalList: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      overflow: "hidden",
    },
    goalOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    goalOptionText: {
      fontSize: 14,
      color: c.foreground,
    },
    goalLinkedHint: {
      fontSize: 12,
      color: c.mutedForeground,
    },
    track: {
      width: 50,
      height: 28,
      borderRadius: 15,
      padding: 2,
    },
    thumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      // shadow for depth
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
    },
  });
};
