import { Colors } from "@/constants/theme";
import { getGoals } from "@/db/crudOperations";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

const FONT_OPTIONS = ["Default", "Bold", "Italic"];
const COLOR_OPTIONS = ["#ffffff", "#6C8EF5", "#f87171", "#34d399", "#fbbf24"];

export type TextLine = {
  text: string;
  color: string;
  bold: boolean;
  italic: boolean;
};

type Props = {
  onLinesChange?: (lines: TextLine[]) => void;
};

const VisionTextDisplay = function ({ onLinesChange }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const [dbGoals, setDbGoals] = useState<string[]>([]);
  const [customLines, setCustomLines] = useState<TextLine[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);

  useEffect(() => {
    const goals = getGoals() as any[];
    setDbGoals(
      goals
        .filter((g) => g.status === "active")
        .slice(0, 3)
        .map((g) => g.title),
    );
  }, []);

  const handleAddLine = () => {
    if (!newText.trim()) return;
    const line: TextLine = {
      text: newText.trim(),
      color: selectedColor,
      bold: selectedFont === "Bold",
      italic: selectedFont === "Italic",
    };
    const updated = [...customLines, line];
    setCustomLines(updated);
    onLinesChange?.(updated);
    setNewText("");
    setShowAddModal(false);
  };

  const handleDelete = (index: number) => {
    const updated = customLines.filter((_, i) => i !== index);
    setCustomLines(updated);
    onLinesChange?.(updated);
  };

  return (
    <ScrollView
      style={{ paddingTop: "20%" }}
      showsVerticalScrollIndicator={false}
    >
      <ThemedText
        textType="headForeground"
        style={{ textAlign: "center", marginBottom: 20 }}
      >
        Your Vision
      </ThemedText>

      {/* DB Goals */}
      {dbGoals.map((goal, i) => (
        <View
          key={`db-${i}`}
          style={{
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            backgroundColor: c.card,
            paddingHorizontal: 10,
            paddingVertical: 24,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <ThemedText
            textType="defaultSubHead"
            style={{ fontSize: 20, textAlign: "center" }}
          >
            {goal}
          </ThemedText>
        </View>
      ))}

      {/* Custom lines */}
      {customLines.map((line, i) => (
        <TouchableOpacity
          key={`custom-${i}`}
          onLongPress={() => handleDelete(i)}
          style={{
            borderWidth: 1,
            borderColor: c.accent,
            borderRadius: 12,
            backgroundColor: c.card,
            paddingHorizontal: 10,
            paddingVertical: 24,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              textAlign: "center",
              color: line.color,
              fontWeight: line.bold ? "700" : "400",
              fontStyle: line.italic ? "italic" : "normal",
            }}
          >
            {line.text}
          </Text>
          <Text
            style={{ fontSize: 10, color: c.mutedForeground, marginTop: 4 }}
          >
            Long press to remove
          </Text>
        </TouchableOpacity>
      ))}

      {/* Add button */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: c.border,
          borderRadius: 12,
          paddingVertical: 20,
          alignItems: "center",
          marginBottom: 100,
          gap: 6,
        }}
      >
        <Ionicons name="add" size={28} color={c.mutedForeground} />
        <Text style={{ color: c.mutedForeground, fontSize: 13 }}>
          Add custom text
        </Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 20,
              padding: 24,
              gap: 16,
            }}
          >
            <ThemedText
              textType="default"
              style={{ fontWeight: "700", fontSize: 16 }}
            >
              Add Text Line
            </ThemedText>

            <TextInput
              value={newText}
              onChangeText={setNewText}
              placeholder="E.g. Build financial freedom"
              placeholderTextColor={c.mutedForeground}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 10,
                padding: 12,
                color: c.foreground,
                fontSize: 15,
              }}
            />

            {/* Color picker */}
            <ThemedText textType="mutedDefault">Color</ThemedText>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {COLOR_OPTIONS.map((col) => (
                <TouchableOpacity
                  key={col}
                  onPress={() => setSelectedColor(col)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: col,
                    borderWidth: selectedColor === col ? 3 : 1,
                    borderColor:
                      selectedColor === col ? c.foreground : c.border,
                  }}
                />
              ))}
            </View>

            {/* Font style */}
            <ThemedText textType="mutedDefault">Style</ThemedText>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {FONT_OPTIONS.map((font) => (
                <TouchableOpacity
                  key={font}
                  onPress={() => setSelectedFont(font)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor:
                      selectedFont === font ? c.accent : c.background,
                    borderWidth: 1,
                    borderColor: c.border,
                  }}
                >
                  <Text
                    style={{
                      color: selectedFont === font ? "#fff" : c.foreground,
                      fontWeight: font === "Bold" ? "700" : "400",
                      fontStyle: font === "Italic" ? "italic" : "normal",
                    }}
                  >
                    {font}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <Text
              style={{
                color: selectedColor,
                fontWeight: selectedFont === "Bold" ? "700" : "400",
                fontStyle: selectedFont === "Italic" ? "italic" : "normal",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              {newText || "Preview"}
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={handleAddLine}
                style={{
                  flex: 1,
                  backgroundColor: c.accent,
                  padding: 14,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: c.background,
                  padding: 14,
                  borderRadius: 10,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: c.border,
                }}
              >
                <Text style={{ color: c.foreground, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default VisionTextDisplay;
