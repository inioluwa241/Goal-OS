import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  cancelReminderNotifications,
  requestNotificationPermissions,
  scheduleReminder,
} from "@/constants/notifications";
import { Colors } from "@/constants/theme";
import {
  addReminder,
  deleteReminder,
  getReminders,
  getSetting,
  updateReminderStatus,
} from "@/db/crudOperations";
import { syncLocalDataToSupabase } from "@/services/sync";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
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
  id: string;
  title: string;
  time: string;
  hour: number;
  minute: number;
  status: "upcoming" | "completed" | "missed";
  goal: string;
  notifIds: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeToISO(date: Date): string {
  const d = new Date();
  d.setHours(date.getHours(), date.getMinutes(), 0, 0);
  return d.toISOString();
}

// ── Main component ─────────────────────────────────────────────────────────────
const Reminders = function () {
  const tabHeight = useBottomTabBarHeight();
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme, tabHeight);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);

  const notifListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    requestNotificationPermissions().then((granted) => {
      if (!granted) {
        Alert.alert(
          "Notifications disabled",
          "Enable notifications in Settings so Goal OS can remind you.",
        );
      }
    });

    notifListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      },
    );

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
      });

    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // ── Load from DB on focus ────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      try {
        const loaded = getReminders();
        setReminders(loaded);
      } catch (e) {
        console.error("Failed to load reminders:", e);
      }
    }, []),
  );

  const upcomingReminders = reminders.filter((r) => r.status === "upcoming");
  const completedReminders = reminders.filter((r) => r.status === "completed");
  const missedReminders = reminders.filter((r) => r.status === "missed");

  // ── Add reminder ─────────────────────────────────────────────────────────────
  const handleAddReminder = async () => {
    if (!newTitle.trim()) return;

    const hour = newTime.getHours();
    const minute = newTime.getMinutes();
    const displayTime = formatTime(newTime);
    const isoTime = timeToISO(newTime);

    const notifIds = await scheduleReminder(
      newTitle.trim(),
      newTime,
      hour,
      minute,
    );

    const id = addReminder({
      title: newTitle.trim(),
      time: isoTime, // ISO string stored in DB for Supabase sync
      hour,
      minute,
      notifIds,
    });

    const userId = getSetting("user_id");
    if (userId && userId !== "null") {
      syncLocalDataToSupabase(userId).catch(console.error);
    }

    setReminders((prev) => [
      {
        id,
        title: newTitle.trim(),
        time: displayTime, // display string used in UI
        hour,
        minute,
        status: "upcoming",
        goal: "Linked goal",
        notifIds,
      },
      ...prev,
    ]);

    setNewTitle("");
    setNewTime(new Date());
    setShowCreateForm(false);
  };

  // ── Complete reminder ────────────────────────────────────────────────────────
  const handleComplete = async (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder?.notifIds.length) {
      await cancelReminderNotifications(reminder.notifIds);
    }
    updateReminderStatus(id, "completed");
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "completed" } : r)),
    );
  };

  // ── Delete reminder ──────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder?.notifIds.length) {
      await cancelReminderNotifications(reminder.notifIds);
    }
    deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Reminder Card ────────────────────────────────────────────────────────────
  const ReminderCard = ({ item }: { item: Reminder }) => {
    const isCompleted = item.status === "completed";
    const isMissed = item.status === "missed";

    // Display time: if ISO string, format it; otherwise show as-is
    const displayTime = (() => {
      if (item.time?.includes("T")) {
        return formatTime(new Date(item.time));
      }
      return item.time;
    })();

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
            <Text style={styles.cardTime}>{displayTime}</Text>
            {!isCompleted && (
              <Text style={styles.cardGoal}>Goal: {item.goal}</Text>
            )}
          </View>
        </View>

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

  const renderItem = ({ item }: { item: Reminder }) => (
    <ReminderCard item={item} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView ref={scrollRef}>
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

                {/* Title field */}
                <View style={styles.fieldGroup}>
                  <ThemedText textType="default" style={styles.label}>
                    Title
                  </ThemedText>
                  <TextInput
                    style={[styles.input, titleFocused && styles.inputFocused]}
                    placeholder="E.g. Exercise session"
                    placeholderTextColor={c.muted}
                    value={newTitle}
                    ref={titleInputRef}
                    onChangeText={setNewTitle}
                    onFocus={() => setTitleFocused(true)}
                    onBlur={() => setTitleFocused(false)}
                  />
                </View>

                {/* Time field — native picker */}
                <View style={styles.fieldGroup}>
                  <ThemedText textType="default" style={styles.label}>
                    Time
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={c.mutedForeground}
                    />
                    <Text style={styles.timeButtonText}>
                      {formatTime(newTime)}
                    </Text>
                  </TouchableOpacity>

                  {showTimePicker && (
                    <DateTimePicker
                      value={newTime}
                      mode="time"
                      is24Hour={false}
                      onChange={(event, selected) => {
                        setShowTimePicker(false);
                        if (selected) setNewTime(selected);
                      }}
                    />
                  )}
                </View>

                {/* Buttons */}
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
                  keyExtractor={(item) => item.id}
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
                  keyExtractor={(item) => item.id}
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
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.sectionList}
                />
              </>
            )}

            {/* Empty state */}
            {reminders.length === 0 && !showCreateForm && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="time-outline"
                  size={56}
                  color={c.mutedForeground}
                />
                <ThemedText textType="headForeground" style={styles.emptyTitle}>
                  No reminders yet
                </ThemedText>
                <ThemedText
                  textType="mutedDefault"
                  style={styles.emptySubtitle}
                >
                  Tap the + button to create your first reminder.
                </ThemedText>
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: c.accent }]}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Text style={styles.emptyButtonText}>Create a reminder</Text>
                </TouchableOpacity>
              </View>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setShowCreateForm(true);
          scrollRef.current?.scrollTo({ y: 0, animated: true });
          setTimeout(() => titleInputRef.current?.focus(), 300);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={40} color={c.background} />
      </TouchableOpacity>
    </View>
  );
};

export default Reminders;

// ── Styles ─────────────────────────────────────────────────────────────────────
const useStyles = function (scheme: "light" | "dark", tabHeight: number) {
  const c = Colors[scheme];

  return StyleSheet.create({
    header: {
      marginTop: 20,
      marginHorizontal: 20,
      marginBottom: 20,
    },
    headerTitle: {},
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
    cardText: { flex: 1, gap: 3 },
    cardTitle: { fontSize: 14, fontWeight: "600", color: c.foreground },
    cardTime: { fontSize: 12, color: c.mutedForeground },
    cardGoal: { fontSize: 12, color: c.mutedForeground },
    markDoneButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: c.accent,
      borderRadius: 8,
    },
    markDoneText: { fontSize: 12, fontWeight: "600", color: "#fff" },
    deleteButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: "rgba(239,68,68,0.1)",
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.3)",
      borderRadius: 8,
    },
    deleteText: { fontSize: 12, fontWeight: "600", color: "#f87171" },
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
    formTitle: { fontWeight: "700", fontSize: 16 },
    fieldGroup: { gap: 8 },
    label: { fontSize: 13, fontWeight: "600" },
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
    inputFocused: { borderWidth: 2, borderColor: c.accent },
    timeButton: {
      height: 44,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.background,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    timeButtonText: {
      fontSize: 14,
      color: c.foreground,
    },
    formButtons: { flexDirection: "row", gap: 10 },
    createButton: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: c.accent,
      borderRadius: 10,
      alignItems: "center",
    },
    createButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    cancelButton: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      alignItems: "center",
    },
    cancelButtonText: { color: c.foreground, fontWeight: "600", fontSize: 14 },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 80,
      gap: 12,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
    },
    emptySubtitle: {
      textAlign: "center",
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
    addButton: {
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      right: 20,
      bottom: 20,
      backgroundColor: c.accent,
      height: 60,
      width: 60,
      borderRadius: 30,
      elevation: 5,
      shadowOpacity: 0.3,
      zIndex: 999,
    },
  });
};
