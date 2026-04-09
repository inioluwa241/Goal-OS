import GoalsFilterBar from "@/components/GoalsFilterBar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ProgressRing from "@/components/UI/ProgressRing";
import { Colors } from "@/constants/theme";
import { getGoals } from "@/db/crudOperations";
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
  parent_id: number | null; // Match the DB name!
  reason: string | null;
  due_date: string | null; // Match the DB name!
  enable_reminder: number; // Remember, this is 0 or 1
  status: string;
  progress_value: number;
  // ... add others if you need them
};

const Goals = function () {
  const tabHeight = useBottomTabBarHeight();
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);

  const [selectedLabel, setSelectedLabel] = useState<number>(0);
  const [goals, setGoals] = useState<Goal[]>([]);

  const allGoals = getGoals() as Goal[];

  const labels = ["", "Daily", "Weekly", "Monthly", "Yearly"];

  useEffect(() => {
    setGoals([...allGoals].reverse());

    if (selectedLabel !== 0) {
      setGoals(allGoals.filter((each) => each.type === selectedLabel));
    }
  }, [allGoals, selectedLabel]);

  // const OPTIONS = goals.filter((each) => each.type?.toLowerCase() === type);

  const renderItem = ({ item }: { item: Goal }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/goals/[id]/",
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
            <ThemedText textType="mutedSmallText" style={styles.smallText}>
              {item.due_date}
            </ThemedText>
            <ThemedText textType="mutedSmallText" style={styles.smallText}>
              {item.parent_id}
            </ThemedText>
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[scheme].background,
      }}
    >
      <ThemedView style={{ paddingBottom: 120 }}>
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
          keyExtractor={(item) => item.id.toString()} // Unique ID for each item
          contentContainerStyle={{
            ...styles.goalsList,
            marginBottom: tabHeight,
          }} // Fixes your tab bar overlap!
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
      // alignContent: "center",
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
      //   paddingRight: 10,
    },
    firstHori: {
      flexDirection: "row",
      justifyContent: "space-between",
      //   alignSelf: "stretch",
    },
    type: {
      padding: 10,
      backgroundColor: "#2d2d2d",
      borderRadius: 10,
      //   flex: 1,
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
  });
};
