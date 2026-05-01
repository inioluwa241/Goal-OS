import { scheduleMorningAlarm } from "@/constants/notifications";
import { Colors } from "@/constants/theme";
import { saveSetting } from "@/db/crudOperations"; // ✅ import
import { router, Stack } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MorningTimeInput from "./date-picker";
import GoalsToSurface from "./goals-to-surface";
import MorningBrief from "./MorningBrief";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import EnableReminder from "./UI/enable-reminder";

interface Goals {
  id: string;
  title: string;
  type: number;
}

const MorningBriefSetting = function () {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [selectedGoals, setSelectedGoals] = useState<Goals[]>([]);
  const [wakeUpTime, setWakeUpTime] = useState<string>("07:00");
  const [affirmation, setAffirmation] = useState(
    "You have the power to make today extraordinary.",
  );
  const [showStreak, setShowStreak] = useState(false);

  // ✅ save everything to app_settings
  const handleSave = async () => {
    try {
      saveSetting("morning_brief_time", JSON.stringify(wakeUpTime));
      const goalIds = selectedGoals.map((g) => g.id);
      saveSetting("morning_brief_goals", JSON.stringify(goalIds));
      saveSetting("morning_brief_affirmation", JSON.stringify(affirmation));
      saveSetting("morning_brief_show_streak", JSON.stringify(showStreak));

      // ✅ schedule the alarm with the saved time
      await scheduleMorningAlarm(wakeUpTime);
      router.back();

      console.log("Settings saved and alarm scheduled");
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ backgroundColor: c.background }}
      >
        <Stack.Screen
          options={{
            title: "Morning Brief",
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "bold",
              color: c.foreground,
              fontFamily: "Inter",
            },
            headerTintColor: "#fff",
            headerStyle: {
              backgroundColor: c.background,
            },
          }}
        />
        <View
          style={{
            flex: 1,
            borderTopWidth: 1,
            borderColor: c.border,
          }}
        >
          <View
            style={{
              flex: 1,
              width: "85%",
              alignSelf: "center",
              paddingVertical: 30,
              gap: 25,
            }}
          >
            <View style={styles.dualView}>
              <ThemedText textType="default" style={styles.dTexts}>
                PREVIEW
              </ThemedText>
              <MorningBrief
                pageRendering="setting"
                selectedGoals={selectedGoals}
              />
            </View>
            <View style={styles.dualView}>
              <ThemedText textType="default" style={styles.dTexts}>
                Wake-up Time
              </ThemedText>
              <MorningTimeInput
                onTimeChange={(time) => setWakeUpTime(time)} // ✅ lift time up
              />
            </View>
            <View style={styles.dualView}>
              <ThemedText textType="default" style={styles.dTexts}>
                Goals to Surface
              </ThemedText>
              <GoalsToSurface onSelect={(goals) => setSelectedGoals(goals)} />
            </View>
            <View style={styles.dualView}>
              <ThemedText textType="default" style={styles.dTexts}>
                Daily Affirmation
              </ThemedText>
              <TextInput
                value={affirmation}
                onChangeText={setAffirmation} // ✅ was missing
                style={styles.affirmInput}
              />
            </View>
            <View style={styles.showStreak}>
              <EnableReminder
                onEnable={(val) => setShowStreak(val)} // ✅ lift toggle up
                textContent="Show streak on brief"
                color={c.background}
              />
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave} // ✅ was missing
            >
              <ThemedText
                textType="default"
                style={{ fontSize: 20, fontWeight: "600" }}
              >
                Save Settings
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ThemedView>
  );
};

export default MorningBriefSetting;

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
    dualView: {
      gap: 10,
    },
    dTexts: {
      fontWeight: "600",
    },
    affirmInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      color: c.foreground,
      fontSize: 16,
      paddingTop: 15,
      paddingBottom: 15,
      paddingLeft: 10,
      backgroundColor: c.card,
    },
    showStreak: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      padding: 10,
      backgroundColor: c.card,
    },
    saveButton: {
      backgroundColor: c.accent,
      borderWidth: 1,
      borderRadius: 12,
      padding: 13,
      alignItems: "center",
    },
  });
};
