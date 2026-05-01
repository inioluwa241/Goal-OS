// VisionImagesDisplay.tsx
import { Colors } from "@/constants/theme";
import {
  addVisionImage,
  deleteVisionImage,
  getVisionImages,
  VisionImage,
} from "@/db/crudOperations";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const bundledImages: Record<string, any> = {
  one: require("@/assets/images/vision-images/Incomparable.png"),
  two: require("@/assets/images/vision-images/Rectangle 397.png"),
  three: require("@/assets/images/vision-images/Save me.png"),
  four: require("@/assets/images/vision-images/Swallows.png"),
  five: require("@/assets/images/vision-images/The Church.png"),
  six: require("@/assets/images/vision-images/Utopia.png"),
  seven: require("@/assets/images/vision-images/Worthy.png"),
};

type Props = {
  onImageSelect: (uri: string) => void;
  selectedUri: string | null;
};

const VisionImagesDisplay = function ({ onImageSelect, selectedUri }: Props) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];
  const imageSize = Dimensions.get("window").width / 3.5 - 10;

  const [userImages, setUserImages] = useState<VisionImage[]>([]);

  useEffect(() => {
    setUserImages(getVisionImages());
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      addVisionImage(uri);
      setUserImages(getVisionImages());
    }
  };

  const handleDelete = (id: string) => {
    deleteVisionImage(id);
    setUserImages(getVisionImages());
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
      {/* Bundled images */}
      {Object.keys(bundledImages).map((key) => (
        <TouchableOpacity
          key={key}
          onPress={() => onImageSelect(key)}
          style={{
            width: imageSize,
            height: imageSize,
            borderWidth: selectedUri === key ? 2 : 0,
            borderColor: "#fff",
            borderRadius: 8,
          }}
        >
          <Image
            source={bundledImages[key]}
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
          />
        </TouchableOpacity>
      ))}

      {/* User picked images */}
      {userImages.map((img) => (
        <TouchableOpacity
          key={img.id}
          onPress={() => onImageSelect(img.local_uri)}
          onLongPress={() => handleDelete(img.id)}
          style={{
            width: imageSize,
            height: imageSize,
            borderWidth: selectedUri === img.local_uri ? 2 : 0,
            borderColor: "#fff",
            borderRadius: 8,
          }}
        >
          <Image
            source={{ uri: img.local_uri }}
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
          />
        </TouchableOpacity>
      ))}

      {/* Add button */}
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
    </View>
  );
};

export default VisionImagesDisplay;
