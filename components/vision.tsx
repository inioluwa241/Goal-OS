// Vision.tsx
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { ComponentProps, useEffect, useRef, useState } from "react";
import {
  NativeModules,
  Platform,
  ScrollView,
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

const getWallpaperModule = () => NativeModules.WallpaperModule ?? null;
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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(
    null,
  );
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Diagnostics for NativeModules availability
  const [diagVisible, setDiagVisible] = useState(false);
  const [nativeKeys, setNativeKeys] = useState<string[]>([]);
  const [nativePingResult, setNativePingResult] = useState<string | null>(null);
  const getTurboWallpaperModule = () =>
    TurboModuleRegistry.get("WallpaperModule") ?? null;
  const getNativeWallpaperModule = () => NativeModules.WallpaperModule ?? null;
  const refreshNativeKeys = () =>
    setNativeKeys(Object.keys(NativeModules || {}));
  const getWallpaperModuleInstance = () => getWallpaperModule();
  const wallpaperAvailable = !!getWallpaperModuleInstance();

  const handleNativePing = async () => {
    const wallpaperModule = getWallpaperModuleInstance();
    if (Platform.OS !== "android" || !wallpaperModule?.ping) {
      showFeedback("Wallpaper module unavailable", "error");
      return;
    }

    try {
      const result = await wallpaperModule.ping();
      setNativePingResult(String(result));
      showFeedback("Native ping succeeded", "success");
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Native ping failed:", e);
      setNativePingResult(`Error: ${errorMessage}`);
      showFeedback(`✗ Ping failed: ${errorMessage}`, "error");
    }
  };

  const showFeedback = (
    message: string,
    type: "success" | "error",
    duration = 3000,
  ) => {
    setFeedbackMessage(message);
    setFeedbackType(type);

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackMessage(null);
      setFeedbackType(null);
    }, duration);
  };

  const handleSet = async () => {
    try {
      const wallpaperModule = getWallpaperModuleInstance();
      if (Platform.OS !== "android" || !wallpaperModule) {
        showFeedback("Wallpaper module unavailable", "error");
        return;
      }

      if (whichScreen === "image") {
        if (!selectedImageUri) {
          showFeedback("Please select an image first", "error");
          return;
        }

        if (bundledImages[selectedImageUri]) {
          const asset = await Asset.fromModule(
            bundledImages[selectedImageUri],
          ).downloadAsync();
          if (!asset.localUri) {
            showFeedback("Failed to load image asset", "error");
            return;
          }
          await wallpaperModule.setSingleImageWallpaper(asset.localUri);
        } else {
          await wallpaperModule.setSingleImageWallpaper(selectedImageUri);
        }
        showFeedback("✓ Wallpaper set successfully!", "success");
      } else if (whichScreen === "text") {
        const lines = customTextLines.map((l) => l.text);
        if (lines.length === 0) {
          showFeedback("Please add text lines first", "error");
          return;
        }
        await wallpaperModule.setVisionTextWallpaper(JSON.stringify(lines));
        showFeedback("✓ Text wallpaper set successfully!", "success");
      } else if (whichScreen === "grid-outline") {
        await wallpaperModule.setVisionGridWallpaper();
        showFeedback("✓ Grid wallpaper set successfully!", "success");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("handleSet error:", error);
      showFeedback(`✗ Error: ${errorMessage}`, "error");
    }
  };

  const handleSetRef = useRef(handleSet);
  useEffect(() => {
    handleSetRef.current = handleSet;
  }, [selectedImageUri, whichScreen, customTextLines]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

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

      {/* Feedback Card */}
      {feedbackMessage && (
        <View
          style={[
            styles.feedbackCard,
            {
              backgroundColor:
                feedbackType === "success"
                  ? "rgba(34, 197, 94, 0.15)"
                  : "rgba(239, 68, 68, 0.15)",
              borderColor: feedbackType === "success" ? "#22c55e" : "#ef4444",
            },
          ]}
        >
          <Ionicons
            name={
              feedbackType === "success" ? "checkmark-circle" : "close-circle"
            }
            size={20}
            color={feedbackType === "success" ? "#22c55e" : "#ef4444"}
          />
          <Text
            style={{
              marginLeft: 10,
              color: feedbackType === "success" ? "#22c55e" : "#ef4444",
              fontSize: 14,
              fontWeight: "500",
              flex: 1,
            }}
          >
            {feedbackMessage}
          </Text>
        </View>
      )}

      {/* Diagnostic Toggle & Card */}
      <View style={{ alignItems: "center", marginTop: 8 }}>
        <TouchableOpacity
          onPress={() => {
            refreshNativeKeys();
            setDiagVisible((v) => !v);
          }}
          style={{ padding: 6 }}
        >
          <Text style={{ color: c.mutedForeground, fontSize: 13 }}>
            {diagVisible ? "Hide diagnostics" : "Show native diagnostics"}
          </Text>
        </TouchableOpacity>
      </View>

      {diagVisible && (
        <View
          style={[
            styles.feedbackCard,
            {
              backgroundColor: "rgba(99,102,241,0.06)",
              borderColor: "#6366f1",
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>
              Runtime Info
            </Text>
            <Text style={{ fontSize: 13, color: c.mutedForeground }}>
              Platform: {Platform.OS}
            </Text>
            <Text style={{ fontSize: 13, color: c.mutedForeground }}>
              WallpaperModule available: {wallpaperAvailable ? "Yes" : "No"}
            </Text>
            <Text style={{ fontSize: 13, color: c.mutedForeground }}>
              NativeModules.WallpaperModule:{" "}
              {getNativeWallpaperModule() ? "Yes" : "No"}
            </Text>
            <Text style={{ fontSize: 13, color: c.mutedForeground }}>
              TurboModuleRegistry.get("WallpaperModule"):{" "}
              {getTurboWallpaperModule() ? "Yes" : "No"}
            </Text>
            <Text style={{ fontSize: 13, color: c.mutedForeground }}>
              WallpaperScheduler present:{" "}
              {NativeModules.WallpaperScheduler ? "Yes" : "No"}
            </Text>
            <Text style={{ fontSize: 13, color: c.mutedForeground }}>
              AlarmChannel present: {NativeModules.AlarmChannel ? "Yes" : "No"}
            </Text>
            <Text style={{ fontSize: 13, color: c.mutedForeground }}>
              Native ping: {nativePingResult ?? "Not run"}
            </Text>
            <View style={{ maxHeight: 120, marginTop: 8 }}>
              <ScrollView>
                <Text style={{ fontSize: 12, color: c.mutedForeground }}>
                  NativeModules keys ({nativeKeys.length}):{" "}
                  {nativeKeys.join(", ")}
                </Text>
              </ScrollView>
            </View>
          </View>
          <View style={{ marginLeft: 10, alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={handleNativePing}
              style={{
                marginBottom: 10,
                padding: 10,
                backgroundColor: c.accent,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Ping</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={refreshNativeKeys}
              style={{
                padding: 10,
                backgroundColor: c.background,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <Text style={{ color: c.foreground, fontWeight: "600" }}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
    feedbackCard: {
      marginHorizontal: 15,
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
    },
  });
};
