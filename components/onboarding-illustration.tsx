import { Colors } from "@/constants/theme";
import { StyleSheet, useColorScheme, View } from "react-native";

export default function OnboardingIllustration() {
  const scheme = useColorScheme() ?? "light";
  const styles = useStyles(scheme);
  const c = Colors[scheme];

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {/* Outer ring */}
        <View style={styles.outerRing}>
          {/* Middle ring */}
          <View style={styles.middleRing}>
            {/* Inner filled circle */}
            <View style={styles.innerCircle} />
          </View>
        </View>

        {/* Accent dot — top right */}
        <View style={styles.accentDotTopRight} />

        {/* Accent dot — bottom left */}
        <View style={styles.accentDotBottomLeft} />
      </View>
    </View>
  );
}

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    container: {
      width: "100%",
      height: 192,
      marginBottom: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    wrapper: {
      position: "relative",
      width: 200,
      height: 200,
      alignItems: "center",
      justifyContent: "center",
      //   backgroundColor: "red",
    },
    outerRing: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 2,
      borderColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
      //   opacity: 0.7,
    },
    middleRing: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 2,
      borderColor: c.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    innerCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: c.accent,
    },
    accentDotTopRight: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.accent,
    },
    accentDotBottomLeft: {
      position: "absolute",
      bottom: 16,
      left: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.accent,
      opacity: 0.7,
    },
  });
};
