import NotesFilterBar from "@/components/note-filter-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import NoteCard from "@/components/UI/note-card";
import { Colors } from "@/constants/theme";
import { getNotes } from "@/db/crudOperations";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
  // isPinned: boolean;
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

  const allNotes = getNotes() as Note[];

  useEffect(() => {
    setNotes([...allNotes].reverse());

    if (category !== "All") {
      setNotes(
        allNotes.filter(
          (each) => each.category.toLowerCase() === category.toLowerCase(),
        ),
      );
    }
  }, [allNotes, category]);

  // your notes filtered in real time
  const filteredNotes = notes.filter(
    (note) =>
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.title.toLowerCase().includes(query.toLowerCase()),
  );

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
              marginBottom: 30,
              marginHorizontal: 20,
            }}
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
          data={!query ? notes : filteredNotes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()} // Unique ID for each item
          contentContainerStyle={{
            ...styles.goalsList,
            paddingBottom: tabHeight,
          }}
        />

        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => {
            router.push("/add-notes");
          }}
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
      //   flexDirection: "row",
      //   justifyContent: "space-between",
      //   alignItems: "center",
      // alignContent: "center",
      //   width: "89%",
      //   alignSelf: "center",
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
      right: 20,
      bottom: 20,
      backgroundColor: c.accent,
      height: 60,
      width: 60,
      borderRadius: 30,
      elevation: 5,
      shadowOpacity: 0.3,
    },
  });
};
