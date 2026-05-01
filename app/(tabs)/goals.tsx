import GoalsFilterBar from "@/components/GoalsFilterBar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ProgressRing from "@/components/UI/ProgressRing";
import { getRelativeDate } from "@/constants/format_date";
import { Colors } from "@/constants/theme";
import {
  getAllForDailyTitle,
  getGoals,
  getGoalTitleById,
} from "@/db/crudOperations";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Goal = {
  id: number;
  title: string;
  description: string | null;
  type: number;
  parent_id: number | null;
  reason: string | null;
  due_date: string | null;
  enable_reminder: number;
  status: string;
  progress_value: number;
};

const Goals = function () {
  const tabHeight = useBottomTabBarHeight();
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);

  const [selectedLabel, setSelectedLabel] = useState<number>(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const labels = ["", "Daily", "Weekly", "Monthly", "Yearly"];

  useEffect(() => {
    try {
      const allGoals = getGoals() as Goal[];
      const stuff = getAllForDailyTitle();
      const reversed = [...allGoals].reverse();

      if (selectedLabel !== 0) {
        setGoals(allGoals.filter((each) => each.type === selectedLabel));
      } else {
        setGoals(reversed);
      }
    } catch (e) {
      console.error("Failed to load goals:", e);
    }
  }, [selectedLabel]);

  const renderItem = ({ item }: { item: Goal }) => {
    const parentGoal = getGoalTitleById(item.parent_id);
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
                <View style={styles.type}>
                  <ThemedText textType="mutedSmallText">
                    {labels[Number(item.type)]}
                  </ThemedText>
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
                Due: {getRelativeDate(item.due_date)}
              </ThemedText>
              {parentGoal && (
                <ThemedText textType="mutedSmallText" style={styles.smallText}>
                  <Ionicons name="arrow-up" size={12} color="gray" />{" "}
                  {parentGoal}
                </ThemedText>
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
            // flexGrow: 1, // allows ListEmptyComponent to fill height
          }}
          ListEmptyComponent={<EmptyState />} // 👈 key addition
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
    },
    type: {
      padding: 10,
      backgroundColor: "#2d2d2d",
      borderRadius: 10,
    },
    smallText: {
      marginTop: 10,
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
  });
};
