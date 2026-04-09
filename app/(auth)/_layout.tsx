// auth/_layout.tsx
import { Colors } from "@/constants/theme";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function AuthLayout() {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: c.background,
          paddingTop: 60,
        },
        headerShown: false,
      }}
    />
  );
}
