import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  action?: React.ReactNode;
  isDestructive?: boolean;
};

const SettingRow = ({
  icon,
  label,
  action,
  isDestructive = false,
}: SettingRowProps) => {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingRowLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={isDestructive ? c.destructive : c.mutedForeground}
        />
        <Text
          style={[
            styles.settingRowLabel,
            isDestructive && { color: c.destructive },
          ]}
        >
          {label}
        </Text>
      </View>
      {action ?? null}
    </View>
  );
};

const Toggle = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) => {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const styles = useStyles(scheme);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[styles.track, { backgroundColor: value ? c.accent : c.card }]}
    >
      <View
        style={[
          styles.thumb,
          {
            alignSelf: value ? "flex-end" : "flex-start",
            backgroundColor: c.background,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title }: { title: string }) => {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  return <Text style={styles.sectionHeader}>{title}</Text>;
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("");

  const [showNudge, setShowNudge] = useState(!isLoggedIn);
  const [morningBrief, setMorningBrief] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Listen whenever auth changes (login, signup, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        const name = user.user_metadata?.full_name ?? user.email ?? "";
        setIsLoggedIn(true);
        setUserEmail(user.email ?? "");
        setUserName(name);
        setUserInitials(name.slice(0, 2).toUpperCase());
      } else {
        setIsLoggedIn(false);
        setUserEmail("");
        setUserName("");
        setUserInitials("");
      }
    });

    return () => subscription.unsubscribe(); // cleanup on unmount
  }, []);
  const handleLogOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          // TODO: clear session e.g. supabase.auth.signOut()
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: delete account logic
            console.log("Account deleted");
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {isLoggedIn ? (
            <View style={styles.profileRow}>
              <View style={[styles.avatar, { backgroundColor: c.accent }]}>
                <Text style={styles.avatarText}>{userInitials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {userEmail}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              <View style={styles.profileRow}>
                <View style={[styles.avatar, { backgroundColor: c.card }]}>
                  <Text
                    style={[styles.avatarText, { color: c.mutedForeground }]}
                  >
                    ?
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>Guest User</Text>
                  <Text style={styles.profileEmail}>No account yet</Text>
                </View>
              </View>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity
                  style={styles.createAccountButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createAccountButtonText}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>

        {/* Nudge Card — guest only */}
        {!isLoggedIn && showNudge && (
          <View style={styles.nudgeCard}>
            <View style={styles.nudgeTop}>
              <Text style={styles.nudgeTitle}>Back up your goals</Text>
              <TouchableOpacity onPress={() => setShowNudge(false)}>
                <Ionicons name="close" size={18} color={c.mutedForeground} />
              </TouchableOpacity>
            </View>
            <Text style={styles.nudgeBody}>
              Create a free account to sync your goals across devices and never
              lose your progress.
            </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity style={styles.nudgeButton} activeOpacity={0.8}>
                <Text style={styles.nudgeButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        {/* Notifications */}
        <View style={styles.section}>
          <SectionHeader title="NOTIFICATIONS" />
          <View style={styles.sectionBody}>
            <SettingRow
              icon="notifications-outline"
              label="Wake-up Time"
              action={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={c.mutedForeground}
                />
              }
            />
            <SettingRow
              icon="notifications-outline"
              label="Morning Brief"
              action={
                <Toggle value={morningBrief} onValueChange={setMorningBrief} />
              }
            />
            <SettingRow
              icon="notifications-outline"
              label="Goal Reminders"
              action={
                <Toggle
                  value={goalReminders}
                  onValueChange={setGoalReminders}
                />
              }
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <SectionHeader title="APPEARANCE" />
          <View style={styles.sectionBody}>
            <SettingRow
              icon="moon-outline"
              label="Dark Mode"
              action={<Toggle value={darkMode} onValueChange={setDarkMode} />}
            />
            <SettingRow
              icon="image-outline"
              label="Wallpaper Mode"
              action={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={c.mutedForeground}
                />
              }
            />
          </View>
        </View>

        {/* Widgets */}
        <View style={styles.section}>
          <SectionHeader title="WIDGETS" />
          <View style={styles.sectionBody}>
            <SettingRow
              icon="phone-portrait-outline"
              label="Lock Screen Widget"
              action={
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={c.mutedForeground}
                />
              }
            />
          </View>
        </View>

        {/* Account */}
        {isLoggedIn && (
          <View style={styles.section}>
            <SectionHeader title="ACCOUNT" />
            <View style={styles.sectionBody}>
              <SettingRow
                icon="person-outline"
                label="Edit Profile"
                action={
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={c.mutedForeground}
                  />
                }
              />
              <SettingRow
                icon="lock-closed-outline"
                label="Change Password"
                action={
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={c.mutedForeground}
                  />
                }
              />
              <TouchableOpacity onPress={handleLogOut}>
                <SettingRow
                  icon="log-out-outline"
                  label="Log Out"
                  isDestructive
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAccount}>
                <SettingRow
                  icon="trash-outline"
                  label="Delete Account"
                  isDestructive
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];

  return StyleSheet.create({
    body: {
      paddingTop: 40,
      paddingBottom: 100,
      gap: 24,
    },

    // Profile header
    profileHeader: {
      paddingHorizontal: 16,
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 20,
      fontWeight: "700",
      color: "#fff",
    },
    profileInfo: {
      flex: 1,
      gap: 4,
    },
    profileName: {
      fontSize: 25,
      fontWeight: "700",
      color: c.foreground,
    },
    profileEmail: {
      fontSize: 15,
      color: c.mutedForeground,
    },
    createAccountButton: {
      height: 44,
      backgroundColor: c.accent,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    createAccountButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },

    // Nudge card
    nudgeCard: {
      marginHorizontal: 16,
      padding: 16,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      gap: 10,
    },
    nudgeTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    nudgeTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: c.foreground,
    },
    nudgeBody: {
      fontSize: 12,
      color: c.mutedForeground,
      lineHeight: 18,
    },
    nudgeButton: {
      height: 36,
      backgroundColor: c.accent,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    nudgeButtonText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },

    // Section
    section: {
      gap: 0,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 14,
      fontWeight: "700",
      color: c.mutedForeground,
      letterSpacing: 1.5,
    },
    sectionBody: {
      borderTopWidth: 1,
      borderTopColor: c.border,
    },

    // Setting row
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: c.card,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    settingRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    settingRowLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: c.foreground,
    },

    // Toggle
    track: {
      width: 50,
      height: 28,
      borderRadius: 15,
      padding: 2,
    },
    thumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
    },
  });
};
