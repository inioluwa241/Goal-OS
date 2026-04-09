import OnboardingIllustration from "@/components/onboarding-illustration";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

export default function OnboardingScreen() {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  const [active, setActive] = useState(0);

  const pagerRef = useRef<PagerView>(null); // 1. Create the reference

  const handleNext = () => {
    if (active < 2) {
      // Since you have 3 pages (0, 1, 2)
      const nextStep = active + 1;
      pagerRef.current?.setPage(nextStep); // 2. Tell the pager to slide
      setActive(nextStep);
    }
  };

  const handleBack = () => {
    if (active > 0) {
      const prevStep = active - 1;
      pagerRef.current?.setPage(prevStep);
    }
  };

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  return (
    <View
      style={{
        paddingTop: 150,
        flex: 1,
      }}
    >
      <TouchableOpacity
        style={styles.skip}
        onPress={() => router.push("/(auth)/signup")}
      >
        <ThemedText
          textType="mutedDefault"
          style={{ fontSize: 20, letterSpacing: 0.5 }}
        >
          Skip
        </ThemedText>
      </TouchableOpacity>

      <OnboardingIllustration />

      <View style={styles.pagerView}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons
            name="arrow-back"
            size={30}
            color={active === 0 ? c.muted : c.mutedForeground}
          />
        </TouchableOpacity>

        <PagerView
          ref={pagerRef}
          style={styles.pagerViewItself}
          initialPage={0}
          onPageSelected={(e) => setActive(e.nativeEvent.position)}
        >
          <View key={1} style={styles.page}>
            <ThemedText
              textType="headForeground"
              style={{
                fontSize: 40,
                textAlign: "center",
                maxWidth: "90%",
                lineHeight: 45,
              }}
            >
              Your goals, everywhere.
            </ThemedText>
            <ThemedText
              textType="mutedDefault"
              style={{
                fontSize: 20,
                textAlign: "center",
                maxWidth: "80%",
                lineHeight: 30,
              }}
            >
              Lock screen. Wallpaper. Morning routine.
            </ThemedText>
          </View>
          <View key={2} style={styles.page}>
            <ThemedText
              textType="headForeground"
              style={{
                fontSize: 40,
                textAlign: "center",
                maxWidth: "90%",
                lineHeight: 45,
              }}
            >
              Built for immersion.{" "}
            </ThemedText>
            <ThemedText
              textType="mutedDefault"
              style={{
                fontSize: 20,
                textAlign: "center",
                maxWidth: "80%",
                lineHeight: 30,
              }}
            >
              Stay connected to what matters most.{" "}
            </ThemedText>
          </View>
          <View key={3} style={styles.page}>
            <ThemedText
              textType="headForeground"
              style={{
                fontSize: 40,
                textAlign: "center",
                maxWidth: "90%",
                lineHeight: 45,
              }}
            >
              Transform daily.{" "}
            </ThemedText>
            <ThemedText
              textType="mutedDefault"
              style={{
                fontSize: 20,
                textAlign: "center",
                maxWidth: "80%",
                lineHeight: 30,
              }}
            >
              Small steps. Unstoppable progress.
            </ThemedText>
          </View>
        </PagerView>

        <TouchableOpacity onPress={handleNext}>
          <Ionicons
            name="arrow-forward"
            size={30}
            color={active === 2 ? c.muted : c.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.dots}>
        {[0, 1, 2].map((each) => (
          <TouchableOpacity
            key={each}
            style={[active === each ? styles.active : styles.dot]}
            onPress={() => goToPage(each)}
          ></TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];

  return StyleSheet.create({
    skip: {
      position: "absolute",
      top: 0,
      left: "82%",
    },
    container: { flex: 1 },
    fixedView: {
      height: 100,
      backgroundColor: "#eee",
      justifyContent: "center",
      alignItems: "center",
    },
    pagerView: {
      height: "35%",
      marginTop: "15%",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    pagerViewItself: { height: "100%", flex: 1 },
    page: {
      justifyContent: "center",
      alignItems: "center",
      gap: 15,
      // backgroundColor: "red",
    },
    dots: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: 30,
    },
    dot: { height: 10, width: 10, backgroundColor: c.card, borderRadius: 5 },
    active: {
      height: 10,
      width: 40,
      backgroundColor: c.accent,
      borderRadius: 5,
    },
  });
};
