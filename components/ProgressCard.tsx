import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";
import ProgressRing from "./UI/ProgressRing";

interface ProgressCardProps {
  title: string;
  progress: number;
  streak: number;
  goalType: number;
}

export const ProgressCard = React.forwardRef<ViewShot, ProgressCardProps>(
  ({ title, progress, streak, goalType }, ref) => {
    const [sharing, setSharing] = React.useState(false);

    const handleShare = async () => {
      try {
        setSharing(true);
        if (ref && "current" in ref && ref.current) {
          const uri = await ref.current.capture();
          await Sharing.shareAsync(uri);
        }
      } catch (error) {
        console.error("Share error:", error);
        Alert.alert("Error", "Failed to share progress card");
      } finally {
        setSharing(false);
      }
    };

    return (
      <View style={styles.container}>
        <ViewShot ref={ref} options={{ format: "png", quality: 0.9 }}>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>🎯 Goal OS</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.goalTitle} numberOfLines={2}>
                {title}
              </Text>

              {/* Progress Ring */}
              <View style={styles.ringContainer}>
                <ProgressRing
                  size={120}
                  thickness={4}
                  color="#4F46E5"
                  progress={progress / 100}
                >
                  <View style={styles.ringCenter}>
                    <Text style={styles.progressPercent}>{progress}%</Text>
                  </View>
                </ProgressRing>
              </View>

              {/* Stats */}
              <View style={styles.stats}>
                <View style={styles.statBox}>
                  <Ionicons name="flame" size={20} color="#FF6B6B" />
                  <Text style={styles.statLabel}>Streak</Text>
                  <Text style={styles.statValue}>{streak}</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Shared from Goal OS</Text>
            </View>
          </View>
        </ViewShot>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          disabled={sharing}
          activeOpacity={0.8}
        >
          {sharing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="share-social" size={18} color="#fff" />
              <Text style={styles.shareButtonText}>Share Progress</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

ProgressCard.displayName = "ProgressCard";

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  header: {
    marginBottom: 16,
  },
  logo: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  ringContainer: {
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercent: {
    fontSize: 32,
    fontWeight: "800",
    color: "#4F46E5",
  },
  stats: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  statBox: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 6,
    minWidth: 120,
  },
  statLabel: {
    fontSize: 12,
    color: "#aaa",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6B6B",
  },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    width: "100%",
  },
  footerText: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  shareButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
