import ParentGoalDropDown from "@/components/parengoalDropDown";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { getUserById, updateGoal } from "@/db/crudOperations";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// ── Constants ──────────────────────────────────────────────────────────────────
const GOAL_TYPES = [
  { id: 1, label: "Daily" },
  { id: 2, label: "Weekly" },
  { id: 3, label: "Monthly" },
  { id: 4, label: "Yearly" },
];

type Goal = {
  id: string;
  title: string;
  description: string | null;
  type: number;
  parent_id: string | null; // Match the DB name!
  reason: string | null;
  due_date: string | null; // Match the DB name!
  enable_reminder: number; // Remember, this is 0 or 1
  status: string;
  progress_value: number;
  streak: number;
  created_at: string;
  // ... add others if you need them
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function GoalEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const goal = getUserById(id) as Goal;
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(
    goal.description ?? "No description available",
  );
  const [reason, setReason] = useState(goal.reason ?? "No reason available");
  const [goalType, setGoalType] = useState(goal.type);
  const [dueDate, setDueDate] = useState(goal.due_date ?? "");
  const [parentID, setParentID] = useState(goal.parent_id);

  const [open, setOpen] = useState(false);

  const [titleFocused, setTitleFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [reasonFocused, setReasonFocused] = useState(false);
  const [dueDateFocused, setDueDateFocused] = useState(false);

  const labels = ["", "Daily", "Weekly", "Monthly", "Yearly"];

  const canSave =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    reason.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const updatedGoalData = {
      title,
      description,
      type: goalType,
      parentID,
      reason,
      dueDate,
      enableReminder: goal.enable_reminder,
    };
    console.log("Saving goal:", {
      id,
      title,
      description,
      reason,
      goalType,
      dueDate,
      parentID,
    });
    updateGoal(id, updatedGoalData);
    router.push("/(tabs)/goals");
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Edit Goal",
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
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={{ borderTopWidth: 2, borderTopColor: c.border }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Goal Title */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Goal Title
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  titleFocused && styles.inputFocused,
                  title.length > 0 && styles.inputFilled,
                ]}
                placeholder="E.g. Read 50 pages"
                placeholderTextColor={c.muted}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                returnKeyType="next"
              />
            </View>

            {/* Goal Type */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Goal Type
              </ThemedText>

              <TouchableOpacity
                onPress={() => setOpen(!open)}
                style={{
                  minWidth: "60%", // Start at 60%, but allow growth
                  alignSelf: "flex-start", // Prevents the box from stretching to 100% width automatically
                  borderWidth: 1,
                  borderColor: c.border,
                  borderRadius: 7,
                  backgroundColor: c.card,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <ThemedText textType="default" style={{ flexShrink: 1 }}>
                  {labels[goalType]}
                </ThemedText>
                <Ionicons name="chevron-down" size={24} color={c.foreground} />
              </TouchableOpacity>

              {open && (
                <View
                  style={{
                    gap: 10,
                    width: "70%",
                    borderWidth: 1,
                    borderColor: c.border,
                    borderRadius: 7,
                    backgroundColor: c.card,
                    paddingVertical: 10,
                    paddingHorizontal: 5,
                    marginTop: 5,
                  }}
                >
                  {GOAL_TYPES?.map((each) => (
                    <TouchableOpacity
                      key={each.id}
                      style={{
                        minWidth: "70%",
                        borderRadius: 7,
                        gap: 20,
                        backgroundColor: goalType === each.id ? c.accent : "",
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        setGoalType(each.id);
                        setOpen(false);
                      }}
                    >
                      <ThemedText
                        textType="default"
                        style={{ flex: 1, marginRight: 10 }}
                      >
                        {each?.label}
                      </ThemedText>
                      {goalType === each?.id ? (
                        <Ionicons
                          name="checkmark"
                          size={24}
                          color={c.mutedForeground}
                        />
                      ) : (
                        ""
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Due Date */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Due Date
              </ThemedText>
              <TextInput
                style={[styles.input, dueDateFocused && styles.inputFocused]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={c.muted}
                value={dueDate ?? ""}
                onChangeText={setDueDate}
                onFocus={() => setDueDateFocused(true)}
                onBlur={() => setDueDateFocused(false)}
                returnKeyType="next"
              />
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Description
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  descriptionFocused && styles.inputFocused,
                ]}
                placeholder="What is this goal about?"
                placeholderTextColor={c.muted}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setDescriptionFocused(true)}
                onBlur={() => setDescriptionFocused(false)}
                multiline
                autoCorrect={false}
                textAlignVertical="top"
              />
            </View>

            {/* Reason */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Why does this matter to you?
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  reasonFocused && styles.inputFocused,
                ]}
                placeholder="Share your emotional reason for this goal..."
                placeholderTextColor={c.muted}
                value={reason}
                onChangeText={setReason}
                onFocus={() => setReasonFocused(true)}
                onBlur={() => setReasonFocused(false)}
                multiline
                autoCorrect={false}
                textAlignVertical="top"
              />
            </View>

            {/* Parent Goal */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Parent Goal
              </ThemedText>
              <ParentGoalDropDown
                onSelect={(selected) => {
                  setParentID(selected);
                }}
                type={goalType}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Sticky Save Button */}
      <View
        style={[
          styles.footer,
          { borderTopColor: c.border, backgroundColor: c.background },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveFullButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveFullButtonText}>Save Changes</Text>
        </TouchableOpacity>
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
      paddingBottom: 40,
    },

    // Header
    headerLeft: {
      marginRight: 8,
    },
    saveButton: {
      paddingVertical: 7,
      paddingHorizontal: 15,
      backgroundColor: c.accent,
      borderRadius: 12,
    },
    saveButtonDisabled: {
      opacity: 0.45,
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },

    // Fields
    fieldGroup: {
      gap: 10,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      backgroundColor: c.card,
      paddingHorizontal: 14,
      fontSize: 15,
      color: c.foreground,
    },
    inputFocused: {
      borderWidth: 2,
      borderColor: c.accent,
    },
    inputFilled: {
      fontSize: 15,
      fontWeight: "600",
      color: c.foreground,
    },
    textArea: {
      height: 96,
      paddingTop: 12,
      paddingBottom: 12,
    },

    // Selector (dropdown trigger)
    selector: {
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
    selectorText: {
      fontSize: 14,
      color: c.foreground,
    },

    // Picker list (dropdown open)
    pickerList: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      overflow: "hidden",
    },
    pickerOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    pickerOptionText: {
      fontSize: 14,
      color: c.foreground,
    },

    // Sticky footer
    footer: {
      paddingHorizontal: "7.5%",
      paddingVertical: 16,
      borderTopWidth: 1,
    },
    saveFullButton: {
      backgroundColor: c.accent,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    saveFullButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
  });
};
