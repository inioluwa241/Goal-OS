// Vision.tsx
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { ComponentProps, useEffect, useRef, useState } from "react";
import {
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TurboModuleRegistry,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import VisionGridDisplay from "./vision-grid-display";
import VisionImagesDisplay from "./vision-images-display";
import VisionTextDisplay, { TextLine } from "./vision-text-display";

type IconName = ComponentProps<typeof Ionicons>["name"];
const iconNames: IconName[] = ["image", "text", "grid-outline"];

const WallpaperModule =
  TurboModuleRegistry.get("WallpaperModule") ??
  NativeModules.WallpaperModule ??
  null;
const bundledImages: Record<string, any> = {
  one: require("@/assets/images/vision-images/Incomparable.png"),
  two: require("@/assets/images/vision-images/Rectangle 397.png"),
  three: require("@/assets/images/vision-images/Save me.png"),
  four: require("@/assets/images/vision-images/Swallows.png"),
  five: require("@/assets/images/vision-images/The Church.png"),
  six: require("@/assets/images/vision-images/Utopia.png"),
  seven: require("@/assets/images/vision-images/Worthy.png"),
};

const Vision = function () {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [whichScreen, setWhichScreen] = useState<IconName>("image");
  const [activeIcon, setActiveIcon] = useState<IconName>(iconNames[0]);
  const [customTextLines, setCustomTextLines] = useState<TextLine[]>([]);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const handleSet = async () => {
    try {
      console.log("welllll i thinking i'm working");
      console.log(WallpaperModule);
      if (Platform.OS !== "android" || !WallpaperModule) return;

      console.log("welllll i thinking i'm working");

      if (whichScreen === "image") {
        if (!selectedImageUri) return;

        if (bundledImages[selectedImageUri]) {
          const asset = await Asset.fromModule(
            bundledImages[selectedImageUri],
          ).downloadAsync();
          if (!asset.localUri) return;
          WallpaperModule.setSingleImageWallpaper(asset.localUri);
        } else {
          WallpaperModule.setSingleImageWallpaper(selectedImageUri); // ← fixed
        }
      } else if (whichScreen === "text") {
        const lines = customTextLines.map((l) => l.text);
        WallpaperModule.setVisionTextWallpaper(JSON.stringify(lines));
      } else if (whichScreen === "grid-outline") {
        WallpaperModule.setVisionGridWallpaper();
      }
      console.log("welllll i might thinking i'm working");
    } catch (error) {
      console.error("handleSet error:", error);
    }
  };

  const handleSetRef = useRef(handleSet);
  useEffect(() => {
    handleSetRef.current = handleSet;
  }, [selectedImageUri, whichScreen, customTextLines]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Vision Board",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold",
            color: c.foreground,
          },
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: c.background },
          headerRight: () => (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSetRef.current()}
              activeOpacity={0.8}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Set</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View
        style={{
          borderTopWidth: 1,
          borderColor: c.border,
          paddingTop: 30,
          flex: 1,
        }}
      >
        <View
          style={{
            width: "85%",
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          {whichScreen === "image" && (
            <VisionImagesDisplay
              onImageSelect={setSelectedImageUri}
              selectedUri={selectedImageUri}
            />
          )}

          {whichScreen === "text" && (
            <VisionTextDisplay
              onLinesChange={(lines) => setCustomTextLines(lines)}
            />
          )}

          {whichScreen === "grid-outline" && <VisionGridDisplay />}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.fEle}
          onPress={() => {
            setWhichScreen("image");
            setActiveIcon("image");
          }}
        >
          <Ionicons name="add" size={20} color={c.foreground} />
          <ThemedText textType="default">Image</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fEle}
          onPress={() => {
            setWhichScreen("text");
            setActiveIcon("text");
          }}
        >
          <Ionicons name="text" size={20} color={c.foreground} />
          <ThemedText textType="default">Text</ThemedText>
        </TouchableOpacity>
        <View style={styles.theIcons}>
          {iconNames.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={activeIcon === icon ? styles.activeIcon : styles.icon}
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
