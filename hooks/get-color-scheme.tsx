import { useColorScheme } from "react-native";

export const ColorScheme = function () {
  const colorScheme = useColorScheme();

  return colorScheme;
};

export const colorScheme = ColorScheme();
