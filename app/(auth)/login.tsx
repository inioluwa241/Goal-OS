import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { saveSetting } from "@/db/crudOperations";
import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
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

export default function LoginScreen() {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const isFormValid = email.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
    if (!isFormValid) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      const userId = data.user?.id;
      if (userId) {
        // Save user_id locally so the rest of the app can use it
        saveSetting("user_id", userId);
      }

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login Failed", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // TODO: replace with your Google OAuth implementation
      console.log("Google log in");
    } catch (error) {
      Alert.alert("Google Login Failed", "Please try again.");
    }
  };

  const handleAppleLogin = async () => {
    try {
      // TODO: replace with expo-apple-authentication
      console.log("Apple log in");
    } catch (error) {
      Alert.alert("Apple Login Failed", "Please try again.");
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
          <ThemedText textType="headForeground">Welcome back</ThemedText>
          <ThemedText textType="mutedDefault" style={{ fontSize: 16 }}>
            Log in to your account
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
              placeholderTextColor={c.muted}
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
              placeholder="Enter your password"
              placeholderTextColor={c.muted}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {/* Forgot Password */}
          {/* <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link> */}

          {/* Log In Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!isFormValid || loading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Log In</Text>
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
            onPress={handleGoogleLogin}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-google" size={20} color={c.foreground} />
            <Text style={styles.oauthButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleAppleLogin}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-apple" size={20} color={c.foreground} />
            <Text style={styles.oauthButtonText}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign up</Text>
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
    forgotPassword: {
      alignSelf: "flex-end",
    },
    forgotPasswordText: {
      fontSize: 14,
      fontWeight: "600",
      color: c.accent,
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
      color: "#fff",
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
