import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  Image,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

const images: Record<string, any> = {
  one: require("@/assets/images/vision-images/Incomparable.png"),
  two: require("@/assets/images/vision-images/Rectangle 397.png"),
  three: require("@/assets/images/vision-images/Save me.png"),
  four: require("@/assets/images/vision-images/Swallows.png"),
  five: require("@/assets/images/vision-images/The Church.png"),
  six: require("@/assets/images/vision-images/Utopia.png"),
  seven: require("@/assets/images/vision-images/Worthy.png"),
};

// // Then use it dynamically
// <Image source={images[imageName]} />

// const images = [
//   "Incomparable",
//   "Rectangle 397",
//   "Save me",
//   "Swallows",
//   "The Church",
//   "Utopia",
//   "Worthy",
// ];

const VisionImagesDisplay = function () {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const [image, setImage] = useState<string | null>(null);
  const imageSize = Dimensions.get("window").width / 3.5 - 10;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // images only
      allowsEditing: true, // lets user crop
      quality: 1, // full quality
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // ✅ save the image uri
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        rowGap: 50,
        columnGap: 5,
        padding: 20,
        paddingHorizontal: 0,
        justifyContent: "space-between",
      }}
    >
      {/* {Object.keys} */}
      {Object.keys(images).map((image) => (
        <TouchableOpacity
          key={image}
          style={{ width: imageSize, height: imageSize }}
        >
          <Image
            source={images[image]}
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
          />
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: 12,
          borderColor: c.border,
          borderWidth: 2,
          borderStyle: "dashed",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={pickImage}
      >
        <Ionicons name="add" size={40} color={c.mutedForeground} />
      </TouchableOpacity>

      {/* {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )} */}
    </View>
  );
};

export default VisionImagesDisplay;
