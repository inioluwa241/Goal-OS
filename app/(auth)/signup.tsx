import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";

import { saveSetting } from "@/db/crudOperations";
import { supabase } from "@/services/supabase";
import { syncLocalDataToSupabase } from "@/services/sync";

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

export default function SignUpScreen() {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const isFormValid = email.trim().length > 0 && password.length >= 8;

  const handleSignUp = async () => {
    if (!isFormValid) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        Alert.alert(
          "Sign Up Failed",
          "Could not retrieve user. Please try again.",
        );
        return;
      }

      // Claim all anonymous local data and sync to Supabase
      await syncLocalDataToSupabase(userId);

      // Save user_id locally for future use
      saveSetting("user_id", userId);

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Sign Up Failed", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // TODO: replace with your Google OAuth implementation
      console.log("Google sign up");
    } catch (error) {
      Alert.alert("Google Sign Up Failed", "Please try again.");
    }
  };

  const handleAppleSignUp = async () => {
    try {
      // TODO: replace with expo-apple-authentication
      console.log("Apple sign up");
    } catch (error) {
      Alert.alert("Apple Sign Up Failed", "Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText textType="headForeground">Goal OS</ThemedText>
          <ThemedText textType="mutedDefault" style={{ fontSize: 16 }}>
            Create your account
          </ThemedText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="you@example.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordFocused && styles.inputFocused]}
              placeholder="At least 8 characters"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!isFormValid || loading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleSignUp}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* OAuth Buttons */}
        <View style={styles.oauthGroup}>
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleGoogleSignUp}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-google" size={20} color={c.foreground} />
            <Text style={styles.oauthButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleAppleSignUp}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-apple" size={20} color={c.foreground} />
            <Text style={styles.oauthButtonText}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];

  return StyleSheet.create({
    keyboardAvoid: {
      flex: 1,
      backgroundColor: c.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 32,
    },

    // Header
    header: {
      paddingTop: 48,
      paddingBottom: 32,
      gap: 6,
    },
    appTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: c.foreground,
    },
    subtitle: {
      fontSize: 14,
      color: c.muted,
    },

    // Form
    form: {
      gap: 16,
    },
    fieldGroup: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: c.foreground,
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

    // Primary button
    primaryButton: {
      height: 50,
      backgroundColor: c.accent,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    primaryButtonDisabled: {
      opacity: 0.45,
    },
    primaryButtonText: {
      color: c.accentForeground,
      fontSize: 16,
      fontWeight: "700",
    },

    // Divider
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.border,
    },
    dividerText: {
      fontSize: 12,
      color: c.muted,
      fontWeight: "500",
    },

    // OAuth buttons
    oauthGroup: {
      gap: 12,
    },
    oauthButton: {
      height: 50,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    oauthButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: c.foreground,
    },

    // Footer
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "auto",
      paddingTop: 32,
    },
    footerText: {
      fontSize: 14,
      color: c.muted,
    },
    footerLink: {
      fontSize: 14,
      color: c.accent,
      fontWeight: "600",
    },
  });
};
