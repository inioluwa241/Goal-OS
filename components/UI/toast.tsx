// components/toast.tsx
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export type ToastType = "error" | "success" | "warning" | "info";

interface ToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message: string;
  onDismiss: () => void;
  duration?: number;
}

interface ToastState {
  visible: boolean;
  type: ToastType;
  title: string;
  message: string;
}

const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: keyof typeof Ionicons.glyphMap;
    light: {
      bg: string;
      border: string;
      iconBg: string;
      title: string;
      msg: string;
    };
    dark: {
      bg: string;
      border: string;
      iconBg: string;
      title: string;
      msg: string;
    };
  }
> = {
  error: {
    icon: "alert-circle",
    light: {
      bg: "#FEF2F2",
      border: "#FECACA",
      iconBg: "#FEE2E2",
      title: "#B91C1C",
      msg: "#7F1D1D",
    },
    dark: {
      bg: "#1f0e0e",
      border: "#811719",
      iconBg: "#2c1010",
      title: "#FA2B36",
      msg: "#fca5a5",
    },
  },
  success: {
    icon: "checkmark-circle",
    light: {
      bg: "#F0FDF4",
      border: "#86EFAC",
      iconBg: "#DCFCE7",
      title: "#15803D",
      msg: "#14532D",
    },
    dark: {
      bg: "#0d1f13",
      border: "#166534",
      iconBg: "#14290e",
      title: "#4ade80",
      msg: "#86efac",
    },
  },
  warning: {
    icon: "warning",
    light: {
      bg: "#FFFBEB",
      border: "#FCD34D",
      iconBg: "#FEF3C7",
      title: "#B45309",
      msg: "#78350F",
    },
    dark: {
      bg: "#1c1500",
      border: "#854d0e",
      iconBg: "#231a00",
      title: "#fbbf24",
      msg: "#fcd34d",
    },
  },
  info: {
    icon: "information-circle",
    light: {
      bg: "#EFF6FF",
      border: "#BFDBFE",
      iconBg: "#DBEAFE",
      title: "#1D4ED8",
      msg: "#1E3A8A",
    },
    dark: {
      bg: "#110f2e",
      border: "#5b4bff",
      iconBg: "#1a1640",
      title: "#a89dff",
      msg: "#c4bcff",
    },
  },
};

export function Toast({
  visible,
  type,
  title,
  message,
  onDismiss,
  duration = 4000,
}: ToastProps) {
  const scheme = useColorScheme() ?? "light";
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const cfg = TOAST_CONFIG[type][scheme];

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
      ]).start();

      const timer = setTimeout(() => dismiss(), duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }]}>
        <Ionicons name={TOAST_CONFIG[type].icon} size={20} color={cfg.title} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: cfg.title }]}>{title}</Text>
        <Text style={[styles.message, { color: cfg.msg }]}>{message}</Text>
      </View>

      <TouchableOpacity
        onPress={dismiss}
        style={styles.closeBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={18} color={cfg.msg} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const show = useCallback(
    (type: ToastType, title: string, message: string) => {
      setToast({ visible: true, type, title, message });
    },
    [],
  );

  const hide = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const toastProps = { ...toast, onDismiss: hide };

  return { show, hide, toastProps };
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    alignSelf: "center",
    paddingLeft: 4,
  },
});
