import GoalsFilterBar from "@/components/GoalsFilterBar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ProgressRing from "@/components/UI/ProgressRing";
import { getRelativeDate } from "@/constants/format_date";
import { Colors } from "@/constants/theme";
import type { Goal as DBGoal } from "@/db/crudOperations";
import {
  addGoal,
  deleteGoal,
  getGoals,
  getGoalTitleById,
  getSetting,
} from "@/db/crudOperations";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ConfirmationModal from "@/components/UI/confirmation-modal";

// Use DBGoal from crudOperations to match SQLite types (ids are strings)

const Goals = function () {
  const tabHeight = useBottomTabBarHeight();
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);

  const [selectedLabel, setSelectedLabel] = useState<number>(0);
  const [goals, setGoals] = useState<DBGoal[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState("");
  const [loadingQuickAdd, setLoadingQuickAdd] = useState(false);
  const labels = ["", "Daily", "Weekly", "Monthly", "Yearly"];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<DBGoal | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // FIX 2: trigger re-fetch after delete

  // FIX 1: moved outside useEffect so it's accessible in JSX
  const handleConfirmDelete = () => {
    if (goalToDelete) {
      // ensure id is a string (DB uses UUID strings)
      deleteGoal(String(goalToDelete.id));
      setShowDeleteModal(false);
      setGoalToDelete(null);
      setRefreshKey((prev) => prev + 1); // trigger goals refresh
    }
  };

  useEffect(() => {
    try {
      const allGoals = getGoals() as DBGoal[];
      // FIX 3: removed unused getAllForDailyTitle() call
      const reversed = [...allGoals].reverse();

      if (selectedLabel !== 0) {
        setGoals(
          allGoals.filter((each) => Number(each.type) === selectedLabel),
        );
      } else {
        setGoals(reversed);
      }
    } catch (e) {
      console.error("Failed to load goals:", e);
    }
  }, [selectedLabel, refreshKey]); // FIX 2: refreshKey in dependency array

  const renderItem = ({ item }: { item: DBGoal }) => {
    const parentGoal = item.parent_id ? getGoalTitleById(item.parent_id) : null;
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/goals/[id]",
            params: { id: item.id },
          })
        }
      >
        <View key={item.id} style={styles.goalCard}>
          <View style={styles.dualHorizontal}>
            <View>
              <ProgressRing
                size={85}
                thickness={4}
                color={c.accent}
                progress={Number(item.progress_value / 100)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.firstHori}>
                <ThemedText
                  textType="default"
                  style={{
                    fontWeight: "600",
                    flexWrap: "wrap",
                    marginRight: 8,
                    flexShrink: 1,
                  }}
                >
                  {item.title}
                </ThemedText>
                <View style={styles.typeRow}>
                  <View style={styles.type}>
                    <ThemedText textType="mutedSmallText">
                      {labels[Number(item.type)]}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setGoalToDelete(item);
                      setShowDeleteModal(true);
                    }}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={c.destructive}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <ThemedText textType="mutedSmallText" numberOfLines={2}>
                {item.description}
              </ThemedText>
              <ThemedText
                textType="mutedSmallText"
                numberOfLines={2}
                style={{ marginTop: 5, lineHeight: 14 }}
              >
                {item.reason}
              </ThemedText>
              <ThemedText textType="mutedSmallText" style={styles.smallText}>
                Due:{" "}
                {item.due_date ? getRelativeDate(item.due_date) : "No due date"}
              </ThemedText>
              {parentGoal && (
                <View style={styles.parentGoalRow}>
                  <Ionicons name="arrow-up" size={12} color="gray" />
                  <ThemedText
                    textType="mutedSmallText"
                    style={styles.parentGoalText}
                    numberOfLines={1}
                  >
                    {parentGoal}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
          <View>
            <ThemedText textType="coloredDefault">
              {item.progress_value}% Complete
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="flag-outline" size={56} color={c.mutedForeground} />
      <ThemedText textType="headForeground" style={styles.emptyTitle}>
        No goals yet
      </ThemedText>
      <ThemedText textType="mutedDefault" style={styles.emptySubtitle}>
        {selectedLabel === 0
          ? "Tap the + button to create your first goal."
          : `You have no ${labels[selectedLabel].toLowerCase()} goals yet.`}
      </ThemedText>
      {selectedLabel === 0 && (
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: c.accent }]}
          onPress={() => router.push("/add-goals")}
        >
          <ThemedText textType="default" style={styles.emptyButtonText}>
            Create your first goal
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[scheme].background,
      }}
    >
      <ThemedView style={{ flex: 1 }}>
        <View style={styles.header}>
          <ThemedText
            textType="defaultSubHead"
            style={{
              marginBottom: 0,
            }}
          >
            Your Goals
          </ThemedText>

          <TouchableOpacity
            style={styles.visionBoard}
            onPress={() => {
              router.push("/morning-brief-setting-screen");
            }}
          >
            <Ionicons
              name="sunny-outline"
              size={25}
              color={c.mutedForeground}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.visionBoard}
            onPress={() => {
              router.push("/vision-screen");
            }}
          >
            <Ionicons
              name="color-palette"
              size={25}
              color={c.mutedForeground}
            />
            <ThemedText textType="default" style={{ color: c.mutedForeground }}>
              Vision Board
            </ThemedText>
          </TouchableOpacity>
        </View>

        <GoalsFilterBar
          onSelect={(selectedLabel) => {
            setSelectedLabel(selectedLabel);
          }}
        />

        <FlatList
          data={goals}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            ...styles.goalsList,
            marginBottom: tabHeight,
          }}
          ListEmptyComponent={<EmptyState />}
        />
      </ThemedView>

      <TouchableOpacity
        style={styles.addGoalButton}
        onPress={() => {
          router.push("/add-goals");
        }}
      >
        <Ionicons name="add" size={40} color={c.background} />
      </TouchableOpacity>

      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Goal?"
        message={`Are you sure you want to delete "${goalToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete} // FIX 1: now correctly references the function
        onCancel={() => {
          setShowDeleteModal(false);
          setGoalToDelete(null);
        }}
      />

      {/* Quick Add button */}
      <TouchableOpacity
        style={styles.quickAddButton}
        onPress={() => setShowQuickAdd(true)}
      >
        <ThemedText textType="default">✨ Quick Add</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={showQuickAdd}
        animationType="slide"
        transparent
        onRequestClose={() => setShowQuickAdd(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: Colors[scheme].card,
              padding: 20,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <ThemedText textType="defaultSubHead">Quick Add</ThemedText>
            <ThemedText textType="mutedDefault" style={{ marginTop: 8 }}>
              Describe what you want and I&apos;ll create goals for you.
            </ThemedText>
            <TextInput
              multiline
              numberOfLines={4}
              value={quickAddText}
              onChangeText={setQuickAddText}
              placeholder="e.g. Build a healthier routine: daily stretch, weekly gym, monthly 10k steps..."
              style={{
                marginTop: 12,
                minHeight: 80,
                borderWidth: 1,
                borderColor: Colors[scheme].border,
                borderRadius: 8,
                padding: 10,
                color: Colors[scheme].foreground,
                backgroundColor: Colors[scheme].background,
              }}
            />

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: Colors[scheme].card,
                  borderWidth: 1,
                  borderColor: Colors[scheme].border,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={() => setShowQuickAdd(false)}
              >
                <ThemedText textType="default">Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={loadingQuickAdd} // FIX 4: prevent multiple submissions
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: loadingQuickAdd
                    ? c.mutedForeground
                    : c.accent, // FIX 4: visual feedback when disabled
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={async () => {
                  if (!quickAddText.trim()) return;
                  setLoadingQuickAdd(true);
                  try {
                    const prompt = `User input: ${quickAddText.trim()}\n\nReturn ONLY a valid JSON array of goal objects. Each object must have: title (string), type (4|3|2|1), reason (string|null), description (string|null), parent_index (integer or null) where parent_index refers to the index in this array. Do not include any extra text.`;

                    const res = await fetch(
                      "https://api.groq.com/openai/v1/chat/completions",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_KEY}`,
                        },
                        body: JSON.stringify({
                          model: "llama-3.3-70b-versatile",
                          messages: [{ role: "user", content: prompt }],
                          max_tokens: 600,
                        }),
                      },
                    );

                    const raw = await res.json();
                    const data = raw.choices?.[0]?.message?.content ?? "";

                    // Extract JSON array from response text
                    let jsonText = data;
                    const firstBracket = data.indexOf("[");
                    const lastBracket = data.lastIndexOf("]");
                    if (
                      firstBracket !== -1 &&
                      lastBracket !== -1 &&
                      lastBracket > firstBracket
                    ) {
                      jsonText = data.substring(firstBracket, lastBracket + 1);
                    }

                    let parsed: any[] = [];
                    try {
                      parsed = JSON.parse(jsonText);
                      if (!Array.isArray(parsed))
                        throw new Error("Not an array");
                    } catch (e) {
                      console.error(
                        "Failed to parse Quick Add JSON:",
                        e,
                        jsonText,
                      );
                      Alert.alert(
                        "Quick Add failed",
                        "Could not parse assistant response. Try rephrasing or use the regular create flow.",
                      );
                      setLoadingQuickAdd(false);
                      return;
                    }

                    // Map of created ids by index
                    const createdIds: (string | null)[] = [];
                    for (let i = 0; i < parsed.length; i++) {
                      const item = parsed[i];
                      const parentIndex = item.parent_index;
                      const parentID =
                        parentIndex === null || parentIndex === undefined
                          ? null
                          : createdIds[parentIndex];

                      const newId = addGoal({
                        title: String(item.title ?? "Untitled"),
                        description: item.description ?? null,
                        type: Number(item.type) ?? 1,
                        parentID: parentID ?? null,
                        reason: item.reason ?? null,
                        dueDate: null,
                        enableReminder: 0,
                      });

                      createdIds.push(newId);
                    }

                    // Optionally sync if user exists
                    const userId = getSetting("user_id");
                    if (userId && userId !== "null") {
                      try {
                        const { syncLocalDataToSupabase } =
                          await import("@/services/sync");
                        syncLocalDataToSupabase(userId).catch(console.error);
                      } catch (e) {
                        console.error("Failed to sync after Quick Add:", e);
                      }
                    }

                    setShowQuickAdd(false);
                    setQuickAddText("");
                    setRefreshKey((prev) => prev + 1); // FIX 2: refresh list after quick add too
                    router.push("/(tabs)/goals");
                  } catch (err) {
                    console.error("Quick Add error:", err);
                    Alert.alert(
                      "Quick Add failed",
                      "An error occurred while creating goals.",
                    );
                  } finally {
                    setLoadingQuickAdd(false);
                  }
                }}
              >
                {loadingQuickAdd ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText textType="default" style={{ color: "#fff" }}>
                    Create
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Goals;

const useStyles = function (scheme: "light" | "dark") {
  const c = Colors[scheme];

  return StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "89%",
      alignSelf: "center",
      marginTop: 20,
    },
    visionBoard: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 5,
      backgroundColor: c.card,
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    goalsList: {
      gap: 15,
      width: "89%",
      alignSelf: "center",
      paddingBottom: 20,
    },
    goalCard: {
      padding: 10,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.card,
      gap: 10,
    },
    dualHorizontal: {
      flexDirection: "row",
      gap: 20,
    },
    firstHori: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    typeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    type: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: c.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    smallText: {
      marginTop: 10,
    },
    parentGoalRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    },
    parentGoalText: {
      flexShrink: 1,
    },
    addGoalButton: {
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      right: 15,
      bottom: 30,
      backgroundColor: c.accent,
      height: 60,
      width: 60,
      borderRadius: 30,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
    },
    emptySubtitle: {
      textAlign: "center",
      paddingHorizontal: 24,
    },
    emptyButton: {
      marginTop: 8,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 12,
    },
    emptyButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },
    quickAddButton: {
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      right: 95,
      bottom: 34,
      backgroundColor: Colors[scheme].card,
      height: 40,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
    },
    deleteButton: {
      padding: 6,
      justifyContent: "center",
      alignItems: "center",
      height: 36,
      width: 36,
      borderRadius: 8,
    },
  });
};
