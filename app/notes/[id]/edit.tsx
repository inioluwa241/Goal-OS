import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
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
const TAGS = [
  { value: "mindset", label: "Mindset" },
  { value: "gratitude", label: "Gratitude" },
  { value: "lessons", label: "Lessons" },
  { value: "ideas", label: "Ideas" },
];

// Mock note - replace with actual fetch using id
const mockNote = {
  title: "Morning Mindset Shift",
  content:
    "Today I realized that my limiting beliefs are just stories I tell myself. By changing the narrative, I can change my reality. Small consistent actions compound into extraordinary results.",
  tag: "mindset",
};

export default function NoteEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [title, setTitle] = useState(mockNote.title);
  const [content, setContent] = useState(mockNote.content);
  const [tag, setTag] = useState(mockNote.tag);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);

  const canSave = title.trim().length > 0 && content.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    // TODO: replace with actual update logic e.g. supabase update
    console.log("Saving note:", { id, title, content, tag });
    router.back();
  };

  const selectedTagLabel = TAGS.find((t) => t.value === tag)?.label ?? tag;

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Edit Note",
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
                Title
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  titleFocused && styles.inputFocused,
                  title.length > 0 && styles.inputFilled,
                ]}
                placeholder="Note title..."
                placeholderTextColor={c.muted}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                returnKeyType="next"
              />
            </View>

            {/* Category */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Category
              </ThemedText>

              {showTagPicker ? (
                <View style={styles.tagList}>
                  {TAGS.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      style={styles.tagOption}
                      onPress={() => {
                        setTag(t.value);
                        setShowTagPicker(false);
                      }}
                    >
                      <Text style={styles.tagOptionText}>{t.label}</Text>
                      {tag === t.value && (
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
                  <Text style={styles.tagSelectorText}>{selectedTagLabel}</Text>
                  <Ionicons name="chevron-down" size={16} color={c.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View style={styles.fieldGroup}>
              <ThemedText textType="default" style={styles.label}>
                Note Content
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.contentInput,
                  contentFocused && styles.inputFocused,
                ]}
                placeholder="Write your note..."
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
      height: 256,
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
