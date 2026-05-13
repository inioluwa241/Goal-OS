import { scheduleReminder } from "@/constants/notifications";
import { Colors } from "@/constants/theme";
import { addGoal, getSetting, titleExists } from "@/db/crudOperations";
import { syncLocalDataToSupabase } from "@/services/sync";
import { addDays, format } from "date-fns";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
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
import CalendarComponent from "./CalenderComponent";
import DurationFilter from "./DurationFilter";
import ParentGoalDropDown from "./parengoalDropDown";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import Divider from "./UI/divider";
import EnableReminder from "./UI/enable-reminder";

const AddGoal = function () {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [error, setError] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalReason, setGoalReason] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [parentID, setParentID] = useState<string | null>(null);
  const [defaultAddition, setDefaultAddition] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | undefined>("");
  const [Rfocused, setIsRFocused] = useState(false);
  const [Dfocused, setIsDFocused] = useState(false);
  const [reminder, setReminder] = useState(true);
  const [selectedLabel, setSelectedLabel] = useState<number>(1);
  const [canSubmit, setCanSubmit] = useState(false);
  useEffect(() => {
    if (goalTitle && selectedLabel && selectedDate && goalReason && reminder) {
      setCanSubmit(true);
    }
  }, [goalTitle, selectedLabel, selectedDate, goalReason, parentID, reminder]);
  useEffect(() => {
    const newDefault = addDays(new Date(), defaultAddition);
    const formatted = format(newDefault, "yyyy-MM-dd");
    setSelectedDate(formatted);
  }, [defaultAddition]);

  useEffect(() => {
    setParentID(null);
  }, [selectedLabel]);

  // 1. Get today's date
  const today = new Date();

  // 2. Add your "multiplier" (e.g., 7 days)
  const defaultTime = addDays(today, defaultAddition);

  // 3. Format it to "YYYY-MM-DD" for the calendar
  const initialDateString = format(defaultTime, "yyyy-MM-dd");

  const newGoalData = {
    title: goalTitle,
    description: goalDescription,
    type: selectedLabel,
    parentID,
    reason: goalReason,
    dueDate: selectedDate || initialDateString,
    enableReminder: reminder === false ? 0 : 1,
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "New Goal",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold",
            color: c.foreground, // title color
            fontFamily: "Inter", // custom font if you have one
          },
          headerTintColor: "#fff",
          headerStyle: {
            backgroundColor: c.background, // ✅ just set it here
          },

          headerRight: () => (
            <TouchableOpacity
              style={[{ opacity: !canSubmit ? 0.5 : 1 }, styles.saveButton]}
              disabled={!canSubmit}
              activeOpacity={!canSubmit ? 1 : 0.1}
              onPress={async () => {
                if (titleExists(newGoalData.title)) {
                  setError("This goal already exists. Try a unique name!");
                  return;
                }

                addGoal(newGoalData);

                // Schedule goal-linked wallpaper reminder if enabled
                if (reminder && Platform.OS === "android") {
                  const dateString = selectedDate || initialDateString;
                  const date = new Date(dateString);

                  await scheduleReminder(
                    goalTitle,
                    date,
                    date.getHours(), // default 9am — or wire up a time picker later
                    date.getMinutes(),
                    {
                      title: goalTitle,
                      progress: 0,
                      deadline: selectedDate || "No deadline",
                      quote:
                        goalReason ||
                        "You have the power to make today extraordinary.",
                    },
                  );
                }

                const userId = getSetting("user_id");
                if (userId && userId !== "null") {
                  syncLocalDataToSupabase(userId).catch(console.error);
                }

                router.push("/(tabs)/goals");
              }}
            >
              <Text>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View
        style={{
          borderTopWidth: 2,
          borderTopColor: c.border,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.body}>
            {/* GOAL TITLE */}
            <View style={styles.gPageView}>
              <ThemedText textType="default" style={styles.gPageText}>
                Goal Title
              </ThemedText>

              {error && (
                <Text
                  style={{
                    color: "red",
                    fontSize: 14,
                    marginLeft: 4,
                    fontWeight: "500",
                  }}
                >
                  {error}
                </Text>
              )}

              <TextInput
                value={goalTitle}
                onChangeText={(textInput) => {
                  setGoalTitle(textInput);
                  if (error) setError(null);
                }}
                style={[
                  { borderColor: error ? "red" : c.border },
                  styles.gPageInput,

                  goalTitle === ""
                    ? styles.gPageInputPlaceHolderTitle
                    : styles.filled,
                ]}
                placeholder="E.g. Read 50 pages"
                placeholderTextColor={c.placeHolder}
              />
            </View>

            {/* GOAL TYPE */}
            <View style={styles.gPageView}>
              <ThemedText textType="default" style={styles.gPageText}>
                Goal Type
              </ThemedText>
              <DurationFilter
                onSelect={(selectedLabel) => {
                  setSelectedLabel(selectedLabel);
                  const addValue =
                    selectedLabel === 1
                      ? 30
                      : selectedLabel === 2
                        ? 7
                        : selectedLabel === 3
                          ? 90
                          : 365;
                  setDefaultAddition(addValue);
                }}
              />
            </View>

            {/* DUE DATE */}
            <View style={styles.gPageView}>
              <ThemedText textType="default" style={styles.gPageText}>
                {selectedLabel === 1
                  ? "When do you want to conclude this habit?"
                  : selectedLabel === 3
                    ? "Final month of completion"
                    : " Finish By?"}
              </ThemedText>
              <CalendarComponent
                onSelect={(pickedDate) => {
                  setSelectedDate(pickedDate);
                }}
                initialDateString={initialDateString}
              />
            </View>

            {/* DESCRIPTION */}
            <View style={styles.gPageView}>
              <ThemedText textType="default" style={styles.gPageText}>
                Goal Description
              </ThemedText>
              <TextInput
                value={goalDescription}
                onChangeText={(text) => setGoalDescription(text)}
                style={[
                  styles.gPageInput,
                  styles.gpageLargeInput,
                  Dfocused ? styles.focused : "",
                ]}
                multiline={true}
                autoCorrect={false}
                onFocus={() => setIsDFocused(true)} // Set focus state to true
                onBlur={() => setIsDFocused(false)}
                placeholder="Describe your goal..."
                placeholderTextColor={c.mutedForeground}
              />
            </View>

            {/* REASONS */}
            <View style={styles.gPageView}>
              <ThemedText textType="default" style={styles.gPageText}>
                Why Does This Matter To You?
              </ThemedText>
              <TextInput
                value={goalReason}
                onChangeText={(text) => setGoalReason(text)}
                style={[
                  styles.gPageInput,
                  styles.gpageLargeInput,
                  Rfocused ? styles.focused : "",
                ]}
                multiline={true}
                autoCorrect={false}
                onFocus={() => setIsRFocused(true)} // Set focus state to true
                onBlur={() => setIsRFocused(false)}
                placeholder="Share your emotional reason for this goal..."
                placeholderTextColor={c.mutedForeground}
              />
            </View>

            {/* PARENT GOALS VIEW */}
            <View style={styles.gPageView}>
              <ThemedText textType="default" style={styles.gPageText}>
                Parent Goal
              </ThemedText>
              <ParentGoalDropDown
                onSelect={(selected) => {
                  setParentID(selected);
                }}
                type={selectedLabel}
              />
            </View>

            <Divider />
            <EnableReminder
              textContent="Enable Reminder"
              color={c.foreground}
              onEnable={(enabledValue) => {
                setReminder(enabledValue);
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ThemedView>
  );
};

export default AddGoal;

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    body: {
      width: "85%",
      alignSelf: "center",
      gap: 35,
      paddingTop: 40,
      paddingBottom: 100,
    },
    gPageView: {
      gap: 18,
    },
    gPageText: {
      fontSize: 16,
      fontWeight: "600",
    },
    gPageInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 7,
      backgroundColor: c.card,
      paddingVertical: 10,
      paddingHorizontal: 10,
    },
    gpageLargeInput: {
      height: 140,
      color: c.foreground,
      justifyContent: "flex-start",
      textAlignVertical: "top",
    },
    gPageInputPlaceHolderTitle: {
      color: c.muted,
      fontSize: 18,
      fontWeight: "600",
    },
    filled: {
      color: c.foreground,
      fontSize: 18,
      fontWeight: "600",
    },
    saveButton: {
      paddingVertical: 7,
      paddingHorizontal: 15,
      backgroundColor: c.accent,
      borderRadius: 12,
    },
    focused: {
      borderWidth: 2,
      borderColor: c.accent,
    },
  });
};
