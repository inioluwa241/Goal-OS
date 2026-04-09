import { Colors } from "@/constants/theme";
import { ColorScheme } from "@/hooks/get-color-scheme";
import { View, type ViewProps } from "react-native";

export const ThemedView = function ({ style, ...otherProps }: ViewProps) {
  const backgroundColor =
    ColorScheme() === "dark" ? Colors.dark.background : Colors.light.background;
  return (
    <View
      style={[
        {
          backgroundColor: backgroundColor,
        },
        style,
      ]}
      {...otherProps}
    />
  );
};
