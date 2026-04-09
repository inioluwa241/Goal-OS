import { Colors } from "@/constants/theme";
import { useColorScheme, View } from "react-native";

const Divider = function () {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  return <View style={{ height: 2, backgroundColor: c.border }}></View>;
};

export default Divider;
