import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import Divider from "@/components/UI/divider";
import ProgressRing from "@/components/UI/ProgressRing";
import { formatDate } from "@/constants/format_date";
import { Colors } from "@/constants/theme";
import {
  addReflection,
  getGoalTitleById,
  getReflectionsForGoal,
  getUserById,
  markDailyGoalDone,
  updateGoalProgress,
} from "@/db/crudOperations";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  type: number;
  parent_id: string | null;
  reason: string | null;
  due_date: string | null;
  enable_reminder: number;
  status: string;
  progress_value: number;
  streak: number;
  created_at: string;
};

type Reflection = {
  id: number;
  goal_id: string;
  created_at: string;
  content: string;
};

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [parentTitle, setParentTitle] = useState<string | null>("");
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const goal = getUserById(id) as Goal;

  if (goal.parent_id) {
    const parentGoalTitle = getGoalTitleById(goal.parent_id);
    setParentTitle(parentGoalTitle);
  }

  const labels = ["", "Daily", "Weekly", "Monthly", "Yearly"];
  const isDaily = goal.type === 1;

  // ── Progress ─────────────────────────────────────────────────────────────────
  const [progress, setProgress] = useState(goal.progress_value);
  const [isComplete, setIsComplete] = useState(goal.status === "complete");

  // in handleMarkDone
  const handleMarkDone = () => {
    setProgress(100);
    setIsComplete(true);
    isDaily ? markDailyGoalDone(id) : updateGoalProgress(id, 100);
  };

  // in handleProgressIncrease / handleProgressDecrease, call after setting state
  const handleProgressIncrease = () => {
    const newProgress = Math.min(progress + 10, 100);
    setProgress(newProgress);
    updateGoalProgress(id, newProgress);
  };

  const handleProgressDecrease = () => {
    const newProgress = Math.max(progress - 10, 0);
    setProgress(newProgress);
    updateGoalProgress(id, newProgress);
  };

  // ── Reflections ───────────────────────────────────────────────────────────────
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [showReflectionInput, setShowReflectionInput] = useState(false);
  const [newReflection, setNewReflection] = useState("");

  const handleAddReflection = () => {
    if (newReflection.trim()) {
      // 1. Create a complete temporary object that matches the 'Reflection' type
      const tempReflection: Reflection = {
        id: Date.now(), // Temporary ID for the list key
        goal_id: id, // Must be a number
        content: newReflection,
        created_at: new Date().toISOString(), // Use ISO string to match DB format
      };

      // 2. Update state with the full object
      setReflections((prev) => [tempReflection, ...prev]);

      // 3. Clean up UI
      setNewReflection("");
      setShowReflectionInput(false);

      // 4. Save to Database
      addReflection(id, newReflection);
    }
  };

  useEffect(() => {
    async function loadReflections() {
      try {
        // Add 'as Reflection[]' to tell TypeScript you've checked the data
        const stuff = (await getReflectionsForGoal(id)) as Reflection[];
        setReflections(stuff);
      } catch (e) {
        console.error("Failed to load reflections", e);
      }
    }

    loadReflections();
  }, [id]); // Added [id] here so it reloads if the goal changes

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Goal Details",
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
              onPress={() => router.push(`/goals/${id}/edit`)}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={{ borderTopWidth: 2, borderTopColor: c.border }}>
        <ScrollView contentContainerStyle={styles.body}>
          {/* ── Title ── */}
          <View style={styles.section}>
            <ThemedText textType="headForeground" style={styles.goalTitle}>
              {goal.title}
            </ThemedText>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{labels[goal.type]}</Text>
            </View>
          </View>

          {/* ── Progress ── */}
          {isDaily ? (
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.markDoneButton,
                  isComplete && { backgroundColor: `${c.accent}50` },
                ]}
                activeOpacity={0.8}
                onPress={handleMarkDone}
                disabled={isComplete}
              >
                <Ionicons
                  name={
                    isComplete ? "checkmark-circle" : "checkmark-circle-outline"
                  }
                  size={20}
                  color="#fff"
                />
                <Text style={styles.markDoneText}>
                  {isComplete ? "Completed Today!" : "Mark as Done"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.markDoneHint}>
                Completes today and increments your streak
              </Text>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.ringWrapper}>
                <ProgressRing
                  size={220}
                  thickness={5}
                  color={c.accent}
                  progress={Number(progress / 100)}
                >
                  <View>
                    <ThemedText
                      textType="coloredHeadingForeground"
                      style={{ textAlign: "center" }}
                    >
                      {progress}%
                    </ThemedText>
                    <ThemedText
                      textType="mutedDefault"
                      style={styles.progressLabel}
                    >
                      COMPLETED
                    </ThemedText>
                  </View>
                </ProgressRing>
              </View>

              <View style={styles.progressControls}>
                <TouchableOpacity
                  style={styles.progressBtn}
                  activeOpacity={0.8}
                  onPress={handleProgressDecrease}
                >
                  <Ionicons name="remove" size={22} color={c.foreground} />
                </TouchableOpacity>
                <Text style={styles.progressHint}>10% increment</Text>
                <TouchableOpacity
                  style={styles.progressBtn}
                  activeOpacity={0.8}
                  onPress={handleProgressIncrease}
                >
                  <Ionicons name="add" size={22} color={c.foreground} />
                </TouchableOpacity>
              </View>

              {progress === 100 && (
                <TouchableOpacity
                  style={styles.markDoneButton}
                  activeOpacity={0.8}
                  onPress={handleMarkDone}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.markDoneText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── Description ── */}
          <View style={styles.section}>
            <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
              DESCRIPTION
            </ThemedText>
            <Text style={styles.bodyText}>{goal.description}</Text>
          </View>

          <Divider />

          {/* ── Why it matters ── */}
          <View style={styles.section}>
            <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
              WHY IT MATTERS
            </ThemedText>
            <Text style={[styles.bodyText, styles.italicText]}>
              {goal.reason}
            </Text>
          </View>

          <Divider />

          {/* ── Details ── */}
          <View style={styles.section}>
            <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
              DETAILS
            </ThemedText>
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Goal Type</Text>
                <Text style={styles.metaValue}>{labels[goal.type]}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date Added</Text>
                <Text style={styles.metaValue}>{goal.created_at}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Due Date</Text>
                <Text style={[styles.metaValue, { color: c.accent }]}>
                  {goal.due_date}
                </Text>
              </View>
              {goal.parent_id && (
                <>
                  <View style={styles.metaDivider} />
                  <TouchableOpacity
                    style={styles.metaRow}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/goals/${goal.parent_id}`)}
                  >
                    <Text style={styles.metaLabel}>Parent Goal</Text>
                    <Text style={[styles.metaValue, { color: c.accent }]}>
                      ↑ {parentTitle}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <Divider />

          {/* ── Reflections ── */}
          <View style={styles.section}>
            <View style={styles.reflectionsHeader}>
              <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
                REFLECTIONS
              </ThemedText>
              {!showReflectionInput && (
                <TouchableOpacity onPress={() => setShowReflectionInput(true)}>
                  <Text style={[styles.sectionLabel, { color: c.accent }]}>
                    + ADD
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {showReflectionInput && (
              <View style={styles.reflectionInputCard}>
                <TextInput
                  placeholder="Write your reflection..."
                  placeholderTextColor={c.mutedForeground}
                  value={newReflection}
                  onChangeText={setNewReflection}
                  multiline
                  style={styles.reflectionInput}
                />
                <View style={styles.reflectionActions}>
                  <TouchableOpacity
                    style={[
                      styles.reflectionBtn,
                      { backgroundColor: c.accent },
                    ]}
                    activeOpacity={0.8}
                    onPress={handleAddReflection}
                  >
                    <Text style={styles.reflectionBtnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.reflectionBtn, { backgroundColor: c.card }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowReflectionInput(false);
                      setNewReflection("");
                    }}
                  >
                    <Text
                      style={[
                        styles.reflectionBtnText,
                        { color: c.foreground },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {reflections.length === 0 && !showReflectionInput ? (
              <Text style={styles.emptyReflections}>
                No reflections yet. Tap + ADD to write your first one.
              </Text>
            ) : (
              reflections.map((r, i) => (
                <View key={i} style={styles.reflectionCard}>
                  <Text style={styles.reflectionDate}>
                    {formatDate(r.created_at)}
                  </Text>
                  <Text style={styles.reflectionContent}>{r.content}</Text>
                </View>
              ))
            )}
          </View>

          <Divider />

          {/* ── Reminder Settings ── */}
          <View style={styles.section}>
            <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
              SETTINGS
            </ThemedText>
            <View style={styles.metaCard}>
              <View style={styles.metaRow}>
                <View style={styles.reminderLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={16}
                    color={c.mutedForeground}
                  />
                  <Text style={styles.settingsCardTitle}>Reminders</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setReminderEnabled((prev) => !prev)}
                  style={[
                    styles.track,
                    { backgroundColor: reminderEnabled ? c.accent : c.card },
                  ]}
                >
                  <View
                    style={[
                      styles.thumb,
                      {
                        alignSelf: reminderEnabled ? "flex-end" : "flex-start",
                        backgroundColor: c.background,
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>
              {reminderEnabled && (
                <>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Reminder Time</Text>
                    <Text style={styles.metaValue}>09:00 AM</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* ── Delete ── */}
          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.8}
            onPress={() => console.log("Delete goal:", id)}
          >
            <Ionicons name="trash-outline" size={16} color="#f87171" />
            <Text style={styles.deleteButtonText}>Delete Goal</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ThemedView>
  );
}

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
    section: {
      gap: 12,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.5,
    },
    goalTitle: {
      fontSize: 28,
      fontWeight: "700",
      lineHeight: 36,
    },
    typePill: {
      alignSelf: "flex-start",
      paddingVertical: 4,
      paddingHorizontal: 12,
      backgroundColor: `${c.accent}18`,
      borderWidth: 1,
      borderColor: `${c.accent}50`,
      borderRadius: 999,
    },
    typePillText: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: c.accent,
      textTransform: "uppercase",
    },
    ringWrapper: {
      alignItems: "center",
      justifyContent: "center",
    },
    progressLabel: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2,
      textAlign: "center",
    },
    progressControls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    progressBtn: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    progressHint: {
      fontSize: 13,
      color: c.mutedForeground,
      fontWeight: "500",
      paddingHorizontal: 8,
    },
    markDoneButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      backgroundColor: c.accent,
      borderRadius: 14,
    },
    markDoneText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    markDoneHint: {
      fontSize: 12,
      color: c.mutedForeground,
      textAlign: "center",
    },
    bodyText: {
      fontSize: 15,
      color: c.foreground,
      lineHeight: 24,
    },
    italicText: {
      fontStyle: "italic",
    },
    metaCard: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 4,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
    },
    metaLabel: {
      fontSize: 12,
      color: c.mutedForeground,
    },
    metaValue: {
      fontSize: 14,
      fontWeight: "500",
      color: c.foreground,
    },
    metaDivider: {
      height: 1,
      backgroundColor: c.border,
    },
    reflectionsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    reflectionInputCard: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 12,
      gap: 10,
    },
    reflectionInput: {
      color: c.foreground,
      fontSize: 14,
      lineHeight: 20,
      minHeight: 72,
      textAlignVertical: "top",
    },
    reflectionActions: {
      flexDirection: "row",
      gap: 8,
    },
    reflectionBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
    },
    reflectionBtnText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#fff",
    },
    reflectionCard: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 14,
      gap: 4,
    },
    reflectionDate: {
      fontSize: 11,
      color: c.mutedForeground,
      fontWeight: "500",
    },
    reflectionContent: {
      fontSize: 14,
      color: c.foreground,
      lineHeight: 20,
    },
    emptyReflections: {
      fontSize: 13,
      color: c.mutedForeground,
      textAlign: "center",
      paddingVertical: 16,
    },
    reminderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    settingsCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: c.foreground,
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
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      backgroundColor: "rgba(239,68,68,0.1)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.3)",
      borderRadius: 12,
    },
    deleteButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#f87171",
    },
  });
};

// import { ThemedText } from "@/components/themed-text";
// import { ThemedView } from "@/components/themed-view";
// import Divider from "@/components/UI/divider";
// import ProgressRing from "@/components/UI/ProgressRing";
// import { Colors } from "@/constants/theme";
// import { getGoalTitleById, getUserById } from "@/db/crudOperations";
// import { Ionicons } from "@expo/vector-icons";
// import { router, Stack, useLocalSearchParams } from "expo-router";
// import { useState } from "react";
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from "react-native";

// // ── Mock data ──────────────────────────────────────────────────────────────────

// const mockGoal = {
//   id: "1",
//   title: "Complete project proposal",
//   description:
//     "Finish and submit the comprehensive project proposal for the Q2 initiative. This includes market research, timeline planning, budget allocation, and team structure.",
//   reason:
//     "This goal is crucial for launching our new product line and establishing market presence. Completing this will unlock funding and team resources for the next phase.",
//   type: "Daily",
//   progress: 75,
//   streak: 12,
//   dateAdded: "Mar 15, 2026",
//   dueDate: "Today",
//   parentGoal: "Launch a business",
// };

// type Goal = {
//   id: number;
//   title: string;
//   description: string | null;
//   type: number;
//   parent_id: number | null; // Match the DB name!
//   reason: string | null;
//   due_date: string | null; // Match the DB name!
//   enable_reminder: number; // Remember, this is 0 or 1
//   status: string;
//   progress_value: number;
//   streak: number;
//   created_at: string;
//   // ... add others if you need them
// };

// // ── Main component ─────────────────────────────────────────────────────────────
// export default function GoalDetailScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const scheme = useColorScheme() ?? "light";
//   const styles = useStyles(scheme);
//   const c = Colors[scheme];
//   const [parentTitle, setParentTitle] = useState<string | null>("");

//   const [reminderEnabled, setReminderEnabled] = useState(true);
//   const goal = getUserById(Number(id)) as Goal;
//   if (goal.parent_id) {
//     const parentGoalTitle = getGoalTitleById(goal.parent_id);
//     setParentTitle(parentGoalTitle);
//   }
//   console.log(goal);

//   const labels = ["", "Daily", "Weekly", "Monthly", "Yearly"];

//   return (
//     <ThemedView style={{ flex: 1 }}>
//       <Stack.Screen
//         options={{
//           title: "Goal Details",
//           headerTitleStyle: {
//             fontSize: 20,
//             fontWeight: "bold",
//             color: c.foreground,
//           },
//           headerStyle: { backgroundColor: c.background },
//           headerTintColor: c.foreground,
//           headerLeft: () => (
//             <TouchableOpacity
//               onPress={() => router.back()}
//               style={styles.headerLeft}
//             >
//               <Ionicons name="arrow-back" size={22} color={c.foreground} />
//             </TouchableOpacity>
//           ),
//           headerRight: () => (
//             <TouchableOpacity
//               style={styles.editButton}
//               onPress={() => router.push(`/goals/${id}/edit`)}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.editButtonText}>Edit</Text>
//             </TouchableOpacity>
//           ),
//         }}
//       />

//       <View style={{ borderTopWidth: 2, borderTopColor: c.border }}>
//         <ScrollView contentContainerStyle={styles.body}>
//           {/* Title Section */}
//           <View style={styles.section}>
//             <ThemedText textType="headForeground" style={styles.goalTitle}>
//               {goal.title}
//             </ThemedText>
//             <View style={styles.typePill}>
//               <Text style={styles.typePillText}>{labels[goal.type]}</Text>
//             </View>
//           </View>

//           {/* Progress Section */}
//           <View style={styles.ringWrapper}>
//             <ProgressRing
//               size={220}
//               thickness={5}
//               color={c.accent}
//               progress={Number(goal.progress_value / 100)}
//             >
//               <View>
//                 <ThemedText
//                   textType="coloredHeadingForeground"
//                   style={{ textAlign: "center" }}
//                 >
//                   {goal.progress_value}%
//                 </ThemedText>
//                 <ThemedText
//                   textType="mutedDefault"
//                   style={styles.progressLabel}
//                 >
//                   COMPLETED
//                 </ThemedText>
//               </View>
//             </ProgressRing>
//           </View>

//           {/* Description */}
//           <View style={styles.section}>
//             <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
//               DESCRIPTION
//             </ThemedText>
//             <Text style={styles.bodyText}>{goal.description}</Text>
//           </View>

//           <Divider />

//           {/* Why it matters */}
//           <View style={styles.section}>
//             <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
//               WHY IT MATTERS
//             </ThemedText>
//             <Text style={[styles.bodyText, styles.italicText]}>
//               {goal.reason}
//             </Text>
//           </View>

//           <Divider />

//           {/* Metadata Card */}
//           <View style={styles.section}>
//             <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
//               DETAILS
//             </ThemedText>
//             <View style={styles.metaCard}>
//               <View style={styles.metaRow}>
//                 <Text style={styles.metaLabel}>Goal Type</Text>
//                 <Text style={styles.metaValue}>{labels[goal.type]}</Text>
//               </View>
//               <View style={styles.metaDivider} />
//               <View style={styles.metaRow}>
//                 <Text style={styles.metaLabel}>Date Added</Text>
//                 <Text style={styles.metaValue}>{goal.created_at}</Text>
//               </View>
//               <View style={styles.metaDivider} />
//               <View style={styles.metaRow}>
//                 <Text style={styles.metaLabel}>Due Date</Text>
//                 <Text style={[styles.metaValue, { color: c.accent }]}>
//                   {goal.due_date}
//                 </Text>
//               </View>
//               {goal.parent_id && (
//                 <>
//                   <View style={styles.metaDivider} />
//                   <View style={styles.metaRow}>
//                     <Text style={styles.metaLabel}>Parent Goal</Text>
//                     <Text style={styles.metaValue}>↑ {parentTitle}</Text>
//                   </View>
//                 </>
//               )}
//             </View>
//           </View>

//           {/* Reminder Settings */}
//           <View style={styles.section}>
//             <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
//               SETTINGS
//             </ThemedText>
//             <View style={styles.metaCard}>
//               <View style={styles.metaRow}>
//                 <View style={styles.reminderLeft}>
//                   <Ionicons
//                     name="notifications-outline"
//                     size={16}
//                     color={c.mutedForeground}
//                   />
//                   <Text style={styles.settingsCardTitle}>Reminders</Text>
//                 </View>
//                 <TouchableOpacity
//                   activeOpacity={0.8}
//                   onPress={() => setReminderEnabled((prev) => !prev)}
//                   style={[
//                     styles.track,
//                     { backgroundColor: reminderEnabled ? c.accent : c.card },
//                   ]}
//                 >
//                   <View
//                     style={[
//                       styles.thumb,
//                       {
//                         alignSelf: reminderEnabled ? "flex-end" : "flex-start",
//                         backgroundColor: c.background,
//                       },
//                     ]}
//                   />
//                 </TouchableOpacity>
//               </View>

//               {reminderEnabled && (
//                 <>
//                   <View style={styles.metaDivider} />
//                   <View style={styles.metaRow}>
//                     <Text style={styles.metaLabel}>Reminder Time</Text>
//                     <Text style={styles.metaValue}>09:00 AM</Text>
//                   </View>
//                 </>
//               )}
//             </View>
//           </View>

//           {/* Delete Button */}
//           <TouchableOpacity
//             style={styles.deleteButton}
//             activeOpacity={0.8}
//             onPress={() => console.log("Delete goal:", id)}
//           >
//             <Ionicons name="trash-outline" size={16} color="#f87171" />
//             <Text style={styles.deleteButtonText}>Delete Goal</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     </ThemedView>
//   );
// }

// // ── Styles ─────────────────────────────────────────────────────────────────────
// const useStyles = (scheme: "light" | "dark") => {
//   const c = Colors[scheme];

//   return StyleSheet.create({
//     body: {
//       width: "85%",
//       alignSelf: "center",
//       gap: 28,
//       paddingTop: 40,
//       paddingBottom: 100,
//     },

//     // Header
//     headerLeft: {
//       marginRight: 8,
//     },
//     editButton: {
//       paddingVertical: 7,
//       paddingHorizontal: 15,
//       backgroundColor: c.accent,
//       borderRadius: 12,
//     },
//     editButtonText: {
//       color: "#fff",
//       fontSize: 14,
//       fontWeight: "600",
//     },

//     // Title
//     section: {
//       gap: 12,
//     },
//     sectionLabel: {
//       fontSize: 11,
//       fontWeight: "700",
//       letterSpacing: 1.5,
//     },
//     goalTitle: {
//       fontSize: 28,
//       fontWeight: "700",
//       lineHeight: 36,
//     },
//     typePill: {
//       alignSelf: "flex-start",
//       paddingVertical: 4,
//       paddingHorizontal: 12,
//       backgroundColor: `${c.accent}18`,
//       borderWidth: 1,
//       borderColor: `${c.accent}50`,
//       borderRadius: 999,
//     },
//     typePillText: {
//       fontSize: 11,
//       fontWeight: "700",
//       letterSpacing: 1.2,
//       color: c.accent,
//       textTransform: "uppercase",
//     },

//     // Progress ring
//     progressSection: {
//       alignItems: "center",
//       gap: 16,
//     },
//     ringWrapper: {
//       alignItems: "center",
//       justifyContent: "center",
//       position: "relative",
//     },
//     ringTrack: {
//       position: "absolute",
//       width: 160,
//       height: 160,
//       borderRadius: 80,
//       borderWidth: 10,
//     },
//     ringFill: {
//       position: "absolute",
//       width: 160,
//       height: 160,
//       borderRadius: 80,
//       borderWidth: 10,
//       transform: [{ rotate: "-45deg" }],
//     },
//     ringInner: {
//       alignItems: "center",
//       gap: 2,
//       zIndex: 1,
//     },
//     progressPercent: {
//       fontSize: 36,
//       fontWeight: "700",
//     },
//     progressLabel: {
//       fontSize: 10,
//       fontWeight: "700",
//       letterSpacing: 2,
//     },
//     streakBadge: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 6,
//       paddingVertical: 8,
//       paddingHorizontal: 16,
//       borderWidth: 1,
//       borderRadius: 999,
//     },
//     streakEmoji: {
//       fontSize: 18,
//     },
//     streakText: {
//       fontSize: 14,
//       fontWeight: "600",
//     },

//     // Body text
//     bodyText: {
//       fontSize: 15,
//       color: c.foreground,
//       lineHeight: 24,
//     },
//     italicText: {
//       fontStyle: "italic",
//     },

//     // Meta card
//     metaCard: {
//       backgroundColor: c.card,
//       borderWidth: 1,
//       borderColor: c.border,
//       borderRadius: 12,
//       paddingHorizontal: 16,
//       paddingVertical: 4,
//     },
//     metaRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       paddingVertical: 14,
//     },
//     metaLabel: {
//       fontSize: 12,
//       color: c.mutedForeground,
//     },
//     metaValue: {
//       fontSize: 14,
//       fontWeight: "500",
//       color: c.foreground,
//     },
//     metaDivider: {
//       height: 1,
//       backgroundColor: c.border,
//     },

//     // Reminder
//     reminderLeft: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: 8,
//     },
//     settingsCardTitle: {
//       fontSize: 14,
//       fontWeight: "600",
//       color: c.foreground,
//     },

//     // Toggle
//     track: {
//       width: 50,
//       height: 28,
//       borderRadius: 15,
//       padding: 2,
//     },
//     thumb: {
//       width: 24,
//       height: 24,
//       borderRadius: 12,
//       elevation: 2,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.2,
//     },

//     // Delete
//     deleteButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: 8,
//       paddingVertical: 14,
//       backgroundColor: "rgba(239,68,68,0.1)",
//       borderWidth: 1,
//       borderColor: "rgba(239,68,68,0.3)",
//       borderRadius: 12,
//     },
//     deleteButtonText: {
//       fontSize: 14,
//       fontWeight: "600",
//       color: "#f87171",
//     },
//   });
// };
