import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Reminder {
  id: number;
  title: string;
  time: string;
  status: "upcoming" | "completed" | "missed";
  goal: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const mockReminders: Reminder[] = [
  {
    id: 1,
    title: "Complete project proposal",
    time: "09:00 AM",
    status: "upcoming",
    goal: "Complete project proposal",
  },
  {
    id: 2,
    title: "Morning meditation",
    time: "07:30 AM",
    status: "completed",
    goal: "Health & wellness",
  },
  {
    id: 3,
    title: "Review weekly goals",
    time: "06:00 PM",
    status: "upcoming",
    goal: "Goal review",
  },
  {
    id: 4,
    title: "Write 3 blog posts",
    time: "10:00 AM",
    status: "missed",
    goal: "Write 3 blog posts",
  },
  {
    id: 5,
    title: "Exercise routine",
    time: "05:30 PM",
    status: "upcoming",
    goal: "Exercise 5 times",
  },
];

// ── Main component ─────────────────────────────────────────────────────────────
const Reminders = function () {
  const tabHeight = useBottomTabBarHeight();
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme, tabHeight);

  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("09:00 AM");
  const [titleFocused, setTitleFocused] = useState(false);
  const [timeFocused, setTimeFocused] = useState(false);

  const upcomingReminders = reminders.filter((r) => r.status === "upcoming");
  const completedReminders = reminders.filter((r) => r.status === "completed");
  const missedReminders = reminders.filter((r) => r.status === "missed");

  const handleAddReminder = () => {
    if (!newTitle.trim()) return;
    const newReminder: Reminder = {
      id: reminders.length + 1,
      title: newTitle,
      time: newTime,
      status: "upcoming",
      goal: "Linked goal",
    };
    setReminders([newReminder, ...reminders]);
    setNewTitle("");
    setNewTime("09:00 AM");
    setShowCreateForm(false);
  };

  const handleComplete = (id: number) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "completed" } : r)),
    );
  };

  const handleDelete = (id: number) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Reminder Card ────────────────────────────────────────────────────────────
  const ReminderCard = ({ item }: { item: Reminder }) => {
    const isCompleted = item.status === "completed";
    const isMissed = item.status === "missed";

    return (
      <View
        style={[
          styles.card,
          isCompleted && {
            borderColor: `${c.accent}50`,
            backgroundColor: `${c.accent}10`,
          },
          isMissed && {
            borderColor: "rgba(248,113,113,0.3)",
            backgroundColor: "rgba(239,68,68,0.1)",
          },
          isCompleted && { opacity: 0.7 },
        ]}
      >
        <View style={styles.cardLeft}>
          <Ionicons
            name={
              isCompleted
                ? "checkmark-circle"
                : isMissed
                  ? "alert-circle"
                  : "time-outline"
            }
            size={16}
            color={
              isCompleted ? c.accent : isMissed ? "#f87171" : c.mutedForeground
            }
          />
          <View style={styles.cardText}>
            <Text
              style={[
                styles.cardTitle,
                isCompleted && {
                  textDecorationLine: "line-through",
                  color: c.mutedForeground,
                },
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.cardTime}>{item.time}</Text>
            {!isCompleted && (
              <Text style={styles.cardGoal}>Goal: {item.goal}</Text>
            )}
          </View>
        </View>

        {/* Action button */}
        {item.status === "upcoming" && (
          <TouchableOpacity
            style={styles.markDoneButton}
            onPress={() => handleComplete(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.markDoneText}>Mark Done</Text>
          </TouchableOpacity>
        )}
        {(item.status === "completed" || item.status === "missed") && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteText}>
              {item.status === "missed" ? "Dismiss" : "Delete"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ── Section renderer for FlatList ────────────────────────────────────────────
  const sections = [
    { key: "form" },
    { key: "upcoming", data: upcomingReminders },
    { key: "completed", data: completedReminders },
    { key: "missed", data: missedReminders },
  ];

  const renderItem = ({ item }: { item: Reminder }) => (
    <ReminderCard item={item} />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView>
        <ThemedView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText textType="defaultSubHead" style={styles.headerTitle}>
              Reminders
            </ThemedText>
          </View>

          {/* Create form */}
          {showCreateForm && (
            <View style={styles.createForm}>
              <ThemedText textType="default" style={styles.formTitle}>
                New Reminder
              </ThemedText>
              <View style={styles.fieldGroup}>
                <ThemedText textType="default" style={styles.label}>
                  Title
                </ThemedText>
                <TextInput
                  style={[styles.input, titleFocused && styles.inputFocused]}
                  placeholder="E.g. Exercise session"
                  placeholderTextColor={c.muted}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                />
              </View>
              <View style={styles.fieldGroup}>
                <ThemedText textType="default" style={styles.label}>
                  Time
                </ThemedText>
                <TextInput
                  style={[styles.input, timeFocused && styles.inputFocused]}
                  placeholder="09:00 AM"
                  placeholderTextColor={c.muted}
                  value={newTime}
                  onChangeText={setNewTime}
                  onFocus={() => setTimeFocused(true)}
                  onBlur={() => setTimeFocused(false)}
                />
              </View>
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleAddReminder}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCreateForm(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Upcoming */}
          {upcomingReminders.length > 0 && (
            <>
              <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
                UPCOMING
              </ThemedText>
              <FlatList
                data={upcomingReminders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.sectionList}
              />
            </>
          )}

          {/* Completed */}
          {completedReminders.length > 0 && (
            <>
              <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
                COMPLETED
              </ThemedText>
              <FlatList
                data={completedReminders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.sectionList}
              />
            </>
          )}

          {/* Missed */}
          {missedReminders.length > 0 && (
            <>
              <ThemedText textType="mutedDefault" style={styles.sectionLabel}>
                MISSED
              </ThemedText>
              <FlatList
                data={missedReminders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.sectionList}
              />
            </>
          )}

          {/* Empty state */}
          {reminders.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color={c.muted} />
              <Text style={styles.emptyText}>No reminders yet</Text>
              <Text style={styles.emptySubText}>Create one to get started</Text>
            </View>
          )}

          {/* FAB */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateForm(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={40} color={c.background} />
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Reminders;

// ── Styles ─────────────────────────────────────────────────────────────────────
const useStyles = function (scheme: "light" | "dark", tabHeight: number) {
  const c = Colors[scheme];

  return StyleSheet.create({
    // Header
    header: {
      marginTop: 20,
      marginHorizontal: 20,
      marginBottom: 20,
    },
    headerTitle: {
      // styled via textType
    },

    // Section labels
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginHorizontal: 20,
      marginBottom: 10,
      marginTop: 10,
    },
    sectionList: {
      gap: 10,
      width: "89%",
      alignSelf: "center",
      paddingBottom: 10,
    },

    // Reminder card
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      backgroundColor: c.card,
      gap: 10,
    },
    cardLeft: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      flex: 1,
    },
    cardText: {
      flex: 1,
      gap: 3,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: c.foreground,
    },
    cardTime: {
      fontSize: 12,
      color: c.mutedForeground,
    },
    cardGoal: {
      fontSize: 12,
      color: c.mutedForeground,
    },

    // Action buttons on cards
    markDoneButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: c.accent,
      borderRadius: 8,
    },
    markDoneText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#fff",
    },
    deleteButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: "rgba(239,68,68,0.1)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.3)",
      borderRadius: 8,
    },
    deleteText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#f87171",
    },

    // Create form
    createForm: {
      width: "89%",
      alignSelf: "center",
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 16,
      gap: 14,
      marginBottom: 20,
    },
    formTitle: {
      fontWeight: "700",
      fontSize: 16,
    },
    fieldGroup: {
      gap: 8,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
    },
    input: {
      height: 44,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.background,
      paddingHorizontal: 14,
      fontSize: 14,
      color: c.foreground,
    },
    inputFocused: {
      borderWidth: 2,
      borderColor: c.accent,
    },
    formButtons: {
      flexDirection: "row",
      gap: 10,
    },
    createButton: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: c.accent,
      borderRadius: 10,
      alignItems: "center",
    },
    createButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      alignItems: "center",
    },
    cancelButtonText: {
      color: c.foreground,
      fontWeight: "600",
      fontSize: 14,
    },

    // Empty state
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    emptyText: {
      fontSize: 14,
      color: c.mutedForeground,
    },
    emptySubText: {
      fontSize: 12,
      color: c.mutedForeground,
    },

    // FAB
    addButton: {
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      right: 20,
      bottom: tabHeight + 20,
      backgroundColor: c.accent,
      height: 60,
      width: 60,
      borderRadius: 30,
      elevation: 5,
      shadowOpacity: 0.3,
    },
  });
};
