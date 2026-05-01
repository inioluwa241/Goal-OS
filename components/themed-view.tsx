import { Colors } from "@/constants/theme";
import { View, type ViewProps, useColorScheme } from "react-native";

export const ThemedView = function ({ style, ...otherProps }: ViewProps) {
  const scheme = useColorScheme() ?? "light";
  const backgroundColor = Colors[scheme].background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
};
