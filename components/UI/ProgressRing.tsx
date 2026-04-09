import React, { ReactNode } from "react";

import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressRingProps {
  size?: number;
  thickness?: number;
  progress?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}
const ProgressRing = ({
  size = 60,
  thickness = 2,
  progress = 0.75,
  color = "white",
  trackColor = "#27374e",
  children,
}: ProgressRingProps) => {
  const s = Number(size);
  const t = Number(thickness);
  const p = Number(progress);

  const radius = (s - t) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - p);
  const center = s / 2;

  return (
    <View
      style={{
        width: s,
        height: s,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg width={s} height={s} style={{ position: "absolute" }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={t}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={t}
          fill="none"
          strokeDasharray={[circumference, circumference]}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {/* Content sits centered inside the ring */}
      {children}
    </View>
  );
};

export default ProgressRing;
