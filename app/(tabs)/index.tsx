import ActiveStreak from "@/components/ActiveStreak";
import GoalHealthScore from "@/components/GoalHealthScore";
import MorningBrief from "@/components/MorningBrief";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import TodaysGoal from "@/components/TodaysGoal";
import { formatDate } from "@/constants/format_date";
import { Colors } from "@/constants/theme";
import { syncLocalDataToSupabase } from "@/services/sync";
import { router } from "expo-router";
import { ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const scheme = useColorScheme() ?? "light";

  syncLocalDataToSupabase("53351080-b663-4a6c-917f-6dcc4fac580a");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[scheme].background }}
    >
      {/* <StatusBar style="auto" /> */}
      <ScrollView>
        <ThemedView
          style={{
            flex: 1,
            width: "80%",
            alignSelf: "center",
            paddingTop: 30,
          }}
        >
          <ThemedText
            textType="headForeground"
            onPress={() => {
              router.replace("/(auth)/onboarding");
            }}
          >
            Good morning, Alex
          </ThemedText>
          <ThemedText textType="mutedDefault">
            {formatDate(new Date().toISOString())}
          </ThemedText>
          <MorningBrief pageRendering="home" />
          <TodaysGoal />
          <ActiveStreak />
          <GoalHealthScore />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}
