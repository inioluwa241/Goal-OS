import NotesFilterBar from "@/components/note-filter-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import NoteCard from "@/components/UI/note-card";
import { Colors } from "@/constants/theme";
import { getNotes } from "@/db/crudOperations";
import { pullFromSupabase } from "@/services/sync";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Note {
  id: string;
  title: string;
  content: string;
  category: "Mindset" | "Gratitude" | "Lessons" | "Ideas";
  createdDate: string;
}

const Notes = function () {
  const tabHeight = useBottomTabBarHeight();
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);

  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCateory] = useState("All");
  const [notes, setNotes] = useState<Note[]>([]);

  useFocusEffect(
    useCallback(() => {
      try {
        const allNotes = getNotes() as Note[];
        console.log(allNotes, "from notes");
        pullFromSupabase("394f7b91-3933-4eaf-8883-91b383eb00d8");
        const reversed = [...allNotes].reverse();

        if (category !== "All") {
          setNotes(
            allNotes.filter(
              (each) => each.category.toLowerCase() === category.toLowerCase(),
            ),
          );
        } else {
          setNotes(reversed);
        }
      } catch (e) {
        console.error("Failed to load notes:", e);
      }
    }, [category]),
  );

  const filteredNotes = notes.filter(
    (note) =>
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.title.toLowerCase().includes(query.toLowerCase()),
  );

  const displayedNotes = !query ? notes : filteredNotes;

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/notes/[id]",
          params: { id: item.id },
        })
      }
    >
      <NoteCard
        title={item.title}
        note={item.content}
        date={item.createdDate}
        category={item.category}
      />
    </TouchableOpacity>
  );

  const EmptyState = () => {
    // searching but no results
    if (query) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={52} color={c.mutedForeground} />
          <ThemedText textType="headForeground" style={styles.emptyTitle}>
            No results found
          </ThemedText>
          <ThemedText textType="mutedDefault" style={styles.emptySubtitle}>
            Nothing matched {query}. Try a different search.
          </ThemedText>
        </View>
      );
    }

    // filtered category but no notes in it
    if (category !== "All") {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="folder-open-outline"
            size={52}
            color={c.mutedForeground}
          />
          <ThemedText textType="headForeground" style={styles.emptyTitle}>
            No {category} notes
          </ThemedText>
          <ThemedText textType="mutedDefault" style={styles.emptySubtitle}>
            You haven't added any {category.toLowerCase()} notes yet.
          </ThemedText>
        </View>
      );
    }

    // completely empty
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="document-text-outline"
          size={52}
          color={c.mutedForeground}
        />
        <ThemedText textType="headForeground" style={styles.emptyTitle}>
          No notes yet
        </ThemedText>
        <ThemedText textType="mutedDefault" style={styles.emptySubtitle}>
          Tap the + button to write your first note.
        </ThemedText>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: c.accent }]}
          onPress={() => router.push("/add-notes")}
        >
          <ThemedText textType="default" style={styles.emptyButtonText}>
            Create your first note
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

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
            style={{ marginBottom: 30, marginHorizontal: 20 }}
          >
            Notes
          </ThemedText>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: focused ? c.accent : c.border,
              alignItems: "center",
              marginBottom: 25,
              marginHorizontal: 20,
            }}
          >
            <Ionicons
              name="search-outline"
              size={25}
              color={focused ? c.accent : c.muted}
            />
            <TextInput
              placeholder="Search notes..."
              placeholderTextColor={c.muted}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{ flex: 1, color: c.foreground }}
            />
          </View>

          <View>
            <NotesFilterBar
              onSelect={(selectedCategory) => setCateory(selectedCategory)}
            />
          </View>
        </View>

        <FlatList
          data={displayedNotes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            ...styles.goalsList,
            paddingBottom: tabHeight,
            flexGrow: 1,
          }}
          ListEmptyComponent={<EmptyState />}
        />

        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => router.push("/add-notes")}
        >
          <Ionicons name="add" size={40} color={c.background} />
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
};

export default Notes;

const useStyles = function (scheme: "light" | "dark") {
  const c = Colors[scheme];

  return StyleSheet.create({
    header: {
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
      right: 20,
      bottom: 20,
      backgroundColor: c.accent,
      height: 60,
      width: 60,
      borderRadius: 30,
      elevation: 5,
      shadowOpacity: 0.3,
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
