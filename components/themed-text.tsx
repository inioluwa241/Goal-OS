import { Colors } from "@/constants/theme";
import { StyleSheet, Text, useColorScheme, type TextProps } from "react-native";

type themedTextProps = TextProps & {
  textType:
    | "headForeground"
    | "default"
    | "defaultSubHead"
    | "coloredDefault"
    | "coloredHeadingForeground"
    | "mutedDefault"
    | "coloredSubHead"
    | "mutedItalics"
    | "mutedSmallText";
};
export const ThemedText = function ({
  textType = "default",
  style,
  ...otherProps
}: themedTextProps) {
  const scheme = useColorScheme() ?? "light";

  const styles = useStyles(scheme);

  return <Text style={[styles[textType], style]} {...otherProps} />;
};

const useStyles = (scheme: "light" | "dark") => {
  const c = Colors[scheme];
  return StyleSheet.create({
    default: {
      color: c.foreground,
      fontSize: 15,
      // fontWeight: "600",
    },
    defaultSubHead: {
      color: c.foreground,
      textTransform: "uppercase",
      fontSize: 20,
      lineHeight: 20,
      fontWeight: "600",
      marginBottom: 16,
      letterSpacing: 0.35,
    },
    coloredHeadingForeground: {
      // ← was missing
      color: c.accent,
      fontWeight: "700",
      fontSize: 36,
    },
    coloredDefault: {
      // ← was missing
      color: c.accent,
    },
    coloredSubHead: {
      color: c.accent,
      textTransform: "uppercase",
      fontSize: 20,
      lineHeight: 20,
      fontWeight: "600",
      marginBottom: 16,
      // textTransform: 'uppercase',
      letterSpacing: 0.35,
    },
    headForeground: {
      color: c.foreground,
      fontSize: 35,
      lineHeight: 36,
      fontWeight: "700",
      marginBottom: 4,
    },
    mutedDefault: {
      fontSize: 14,
      lineHeight: 20,
      color: c.mutedForeground,
    },

    mutedItalics: {
      color: c.mutedForeground,
      fontStyle: "italic",
    },
    mutedSmallText: {
      // ← was missing
      color: c.mutedForeground,
      fontSize: 12,
    },
  });
};
