import { Colors } from "@/constants/theme";
import { getProfile, updateProfile } from "@/services/profile";
import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/(auth)/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      const profile = await getProfile(user.id);
      if (profile) {
        setFullName(profile.full_name ?? "");
        setUsername(profile.username ?? "");
      }

      setFetching(false);
    };

    load();
  }, []);

  const hasChanges = fullName.trim().length > 0; // at minimum a name is required

  const handleSave = async () => {
    if (!userId || !hasChanges) return;

    // Basic username validation
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert(
        "Invalid Username",
        "Username can only contain letters, numbers, and underscores.",
      );
      return;
    }

    setLoading(true);
    try {
      const success = await updateProfile(userId, {
        full_name: fullName.trim(),
        username: username.trim() || null,
      });

      if (success) {
        Alert.alert("Saved", "Your profile has been updated.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Could not save profile. Please try again.");
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={c.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color={c.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges || loading}
            style={styles.saveBtn}
          >
            {loading ? (
              <ActivityIndicator color={c.accent} size="small" />
            ) : (
              <Text
                style={[
                  styles.saveBtnText,
                  (!hasChanges || loading) && styles.saveBtnDisabled,
                ]}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Preview */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: c.accent }]}>
              <Text style={styles.avatarText}>{initials || "?"}</Text>
            </View>
            <Text style={styles.avatarHint}>
              Avatar is generated from your initials
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, fullNameFocused && styles.inputFocused]}
                placeholder="John Doe"
                placeholderTextColor={c.muted}
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFullNameFocused(true)}
                onBlur={() => setFullNameFocused(false)}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <View
                style={[
                  styles.inputWrapper,
                  usernameFocused && styles.inputFocused,
                ]}
              >
                <Text style={styles.inputPrefix}>@</Text>
                <TextInput
                  style={styles.inputInner}
                  placeholder="johndoe"
                  placeholderTextColor={c.muted}
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase())}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                />
              </View>
              <Text style={styles.hint}>
                Letters, numbers, and underscores only.
              </Text>
            </View>

            {/* Email — read only */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.input, styles.inputReadOnly]}>
                <Text style={styles.inputReadOnlyText}>{email}</Text>
              </View>
              <Text style={styles.hint}>
                Email cannot be changed here. Contact support to update it.
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!hasChanges || loading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];

  return StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: c.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.background,
    },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "ios" ? 56 : 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      backgroundColor: c.background,
    },
    backBtn: {
      padding: 4,
      width: 40,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: c.foreground,
    },
    saveBtn: {
      width: 50,
      alignItems: "flex-end",
      justifyContent: "center",
      padding: 4,
    },
    saveBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: c.accent,
    },
    saveBtnDisabled: {
      opacity: 0.4,
    },

    // Body
    body: {
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 60,
      gap: 32,
    },

    // Avatar
    avatarSection: {
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 30,
      fontWeight: "700",
      color: "#fff",
    },
    avatarHint: {
      fontSize: 12,
      color: c.muted,
    },

    // Form
    form: {
      gap: 20,
    },
    fieldGroup: {
      gap: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: c.foreground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    input: {
      height: 48,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 15,
      color: c.foreground,
    },
    inputFocused: {
      borderColor: c.accent,
    },
    inputWrapper: {
      height: 48,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      gap: 4,
    },
    inputPrefix: {
      fontSize: 15,
      color: c.mutedForeground,
      fontWeight: "600",
    },
    inputInner: {
      flex: 1,
      fontSize: 15,
      color: c.foreground,
    },
    inputReadOnly: {
      justifyContent: "center",
      opacity: 0.6,
    },
    inputReadOnlyText: {
      fontSize: 15,
      color: c.foreground,
    },
    hint: {
      fontSize: 11,
      color: c.muted,
      marginTop: 2,
    },

    // Primary Button
    primaryButton: {
      height: 50,
      backgroundColor: c.accent,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonDisabled: {
      opacity: 0.45,
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
  });
};
