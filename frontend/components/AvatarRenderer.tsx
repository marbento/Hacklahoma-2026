// frontend/components/AvatarRenderer.tsx
// Renders pixel art avatar from layered rect data using react-native Svg
import React, { useMemo } from "react";
import { View } from "react-native";
import { AVATAR_PARTS, AvatarConfig } from "../assets/avatarData";

interface Props {
  config: AvatarConfig;
  size?: number;
}

export function AvatarRenderer({ config, size = 128 }: Props) {
  const scale = size / 64;

  const layers = useMemo(() => {
    const body = AVATAR_PARTS.bodies.find((b) => b.id === config.body);
    const clothes = AVATAR_PARTS.clothes.find((c) => c.id === config.clothes);
    const hair = AVATAR_PARTS.hairs.find((h) => h.id === config.hair);
    // Layer order: body first, then clothes, then hair on top
    return [
      ...(body?.rects || []),
      ...(clothes?.rects || []),
      ...(hair?.rects || []),
    ];
  }, [config.body, config.clothes, config.hair]);

  return (
    <View style={{ width: size, height: size, backgroundColor: "transparent" }}>
      {layers.map(([x, y, w, h, fill], i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: x * scale,
            top: y * scale,
            width: w * scale,
            height: h * scale,
            backgroundColor: fill,
          }}
        />
      ))}
    </View>
  );
}
