import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ComponentProps, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import VisionGridDisplay from "./vision-grid-display";
import VisionImagesDisplay from "./vision-images-display";
import VisionTextDisplay from "./vision-text-display";

type IconName = ComponentProps<typeof Ionicons>["name"];

const iconNames: IconName[] = ["image", "text", "grid-outline"];

const Vision = function () {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [whichScreen, setWhichScreen] = useState("image");
  const [canSubmit, setCanSubmit] = useState(false);
  const [activeIcon, setActiveIcon] = useState(iconNames[0]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Vision Board",
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
            >
              <Text>Set</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View
        style={{
          borderTopWidth: 1,
          borderColor: c.border,
          paddingTop: 30,
        }}
      >
        <View
          style={{
            width: "85%",
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          {whichScreen === "image" && <VisionImagesDisplay />}
          {whichScreen === "text" && <VisionTextDisplay />}
          {whichScreen === "grid-outline" && <VisionGridDisplay />}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.fEle}>
          <Ionicons name="add" size={20} color={c.foreground} />
          <ThemedText textType="default">Image</ThemedText>
        </View>
        <View style={styles.fEle}>
          <Ionicons name="text" size={20} color={c.foreground} />
          <ThemedText textType="default">Text</ThemedText>
        </View>
        <View style={styles.theIcons}>
          {iconNames.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[activeIcon === icon ? styles.activeIcon : styles.icon]}
              onPress={() => {
                setWhichScreen(icon);
                setActiveIcon(icon);
              }}
            >
              <Ionicons name={icon} size={20} color={c.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ThemedView>
  );
};

export default Vision;

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

    saveButton: {
      paddingVertical: 7,
      paddingHorizontal: 15,
      backgroundColor: c.accent,
      borderRadius: 12,
    },

    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: 15,
      paddingHorizontal: 10,
      justifyContent: "space-between",
      flexDirection: "row",
      borderTopWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    fEle: {
      padding: 10,
      backgroundColor: "#2d2d2d",
      borderRadius: 12,
      gap: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    theIcons: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 5,
      width: "45%",
      backgroundColor: c.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    icon: {
      flex: 1,
      //   padding: 10,
      //   borderRadius: 10,
      alignItems: "center",
    },
    activeIcon: {
      backgroundColor: c.accent,
      flex: 1,
      padding: 5,
      borderRadius: 10,
      alignItems: "center",
    },
  });
};
