import { Colors } from "@/constants/theme";
import { addNote } from "@/db/crudOperations";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
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
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

const TAGS = ["Mindset", "Gratitude", "Lessons", "Ideas"];

export default function CreateNoteScreen() {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCateory] = useState("Mindset");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);

  const canSave = title.trim().length > 0 && content.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const newNote = { title, category, content };
    addNote(newNote);
    console.log("Creating note:", { title, content, category });
    router.back();
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "New Note",
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
            {/* Title */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Note Title
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  titleFocused && styles.inputFocused,
                  title.length > 0 && styles.inputFilled,
                ]}
                placeholder="What's on your mind?"
                placeholderTextColor={c.muted}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                returnKeyType="next"
              />
            </View>

            {/* Tag / Category */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Category
              </ThemedText>

              {showTagPicker ? (
                <View style={styles.tagList}>
                  {TAGS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={styles.tagOption}
                      onPress={() => {
                        setCateory(t);
                        setShowTagPicker(false);
                      }}
                    >
                      <Text style={styles.tagOptionText}>{t}</Text>
                      {category === t && (
                        <Ionicons name="checkmark" size={16} color={c.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.tagSelector}
                  onPress={() => setShowTagPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagSelectorText}>{category}</Text>
                  <Ionicons name="chevron-down" size={16} color={c.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Your Note
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.contentInput,
                  contentFocused && styles.inputFocused,
                ]}
                placeholder="Write your thoughts, lessons, ideas, or gratitude..."
                placeholderTextColor={c.muted}
                value={content}
                onChangeText={setContent}
                onFocus={() => setContentFocused(true)}
                onBlur={() => setContentFocused(false)}
                multiline
                autoCorrect={false}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ThemedView>
  );
}

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];

  return StyleSheet.create({
    body: {
      width: "85%",
      alignSelf: "center",
      gap: 28,
      paddingTop: 40,
      paddingBottom: 100,
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
    contentInput: {
      height: 160,
      paddingTop: 12,
      paddingBottom: 12,
    },

    // Tag selector
    tagSelector: {
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
    tagSelectorText: {
      fontSize: 14,
      color: c.foreground,
    },
    tagList: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      overflow: "hidden",
    },
    tagOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    tagOptionText: {
      fontSize: 14,
      color: c.foreground,
    },
  });
};
