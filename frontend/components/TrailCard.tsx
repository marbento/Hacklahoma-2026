// frontend/components/TrailCard.tsx
// Trail Card component - displays the winding path with avatar progress
// Adapted from my-tailwind-ui with backgrounds, animations, and avatar rendering
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AVATAR_PARTS, AvatarConfig } from "../assets/avatarData";
import { C } from "../theme";

// Sprite sheet JSON data
const b1c1Data = require("../assets/b1c1.json");
const b1c2Data = require("../assets/b1c2.json");
const b2c1Data = require("../assets/b2c1.json");
const b2c2Data = require("../assets/b2c2.json");

// Trail node coordinates (from my-tailwind-ui)
const TRAIL_NODES = [
  { x: 140, y: 430 },
  { x: 80, y: 390 },
  { x: 110, y: 350 },
  { x: 160, y: 350 },
  { x: 150, y: 290 },
  { x: 80, y: 280 },
  { x: 45, y: 214 },
  { x: 150, y: 194 },
  { x: 210, y: 144 },
  { x: 145, y: 90 },
  { x: 95, y: 144 },
  { x: 100, y: 76 },
  { x: 70, y: 76 },
  { x: 30, y: 35 },
];

const DETOUR_NODES = [
  { x: 280, y: 350 },
  { x: 210, y: 350 },
  { x: 160, y: 350 },
  { x: 80, y: 350 },
  { x: 20, y: 350 },
];

// Trail backgrounds
const TRAIL_BACKGROUNDS = {
  detour: require("../assets/detour.png"),
  trail1: require("../assets/trail1.png"),
  trail2: require("../assets/trail2.png"),
};

// Sprite sheets for walking animation
const SPRITE_SHEETS = {
  b1c1: { image: require("../assets/b1c1sheet.png"), data: b1c1Data },
  b1c2: { image: require("../assets/b1c2sheet.png"), data: b1c2Data },
  b2c1: { image: require("../assets/b2c1sheet.png"), data: b2c1Data },
  b2c2: { image: require("../assets/b2c2sheet.png"), data: b2c2Data },
};

// Helper to get sprite sheet key from avatar config
const getSpriteSheetKey = (
  body: string,
  clothes: string,
): keyof typeof SPRITE_SHEETS => {
  const bodyNum = body === "body1" ? "1" : "2";
  const clothesNum = clothes === "cloth1" ? "1" : "2";
  return `b${bodyNum}c${clothesNum}` as keyof typeof SPRITE_SHEETS;
};

// Animated sprite component with hair layer
const AnimatedSprite: React.FC<{
  spriteKey: keyof typeof SPRITE_SHEETS;
  hairIndex: number;
  size: number;
  duration: number;
}> = ({ spriteKey, hairIndex, size, duration }) => {
  const sprite = SPRITE_SHEETS[spriteKey];
  const frameCount = Object.keys(sprite.data.frames).length;
  const frameWidth = sprite.data.meta.size.w / frameCount;
  const scale = size / frameWidth;

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animValue, {
        toValue: frameCount,
        duration: duration,
        useNativeDriver: true,
        easing: (t) => Math.floor(t * frameCount) / frameCount, // Step function
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [frameCount, duration]);

  const translateX = animValue.interpolate({
    inputRange: [0, frameCount],
    outputRange: [0, -sprite.data.meta.size.w * scale],
  });

  // Render hair layer on top
  const hair = AVATAR_PARTS.hairs[hairIndex] || AVATAR_PARTS.hairs[0];
  const renderHairRects = () => {
    return hair.rects.map((rect, i) => {
      const [x, y, width, height, fill] = rect;
      return (
        <View
          key={i}
          style={{
            position: "absolute",
            left: x * scale,
            top: y * scale,
            width: width * scale,
            height: height * scale,
            backgroundColor: fill,
          }}
        />
      );
    });
  };

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      {/* Animated body + clothing sprite */}
      <View style={{ width: size, height: size, overflow: "hidden" }}>
        <Animated.Image
          source={sprite.image}
          style={{
            width: sprite.data.meta.size.w * scale,
            height: frameWidth * scale,
            transform: [{ translateX }],
          }}
          resizeMode="stretch"
        />
      </View>
      {/* Static hair layer on top */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
        }}
      >
        {renderHairRects()}
      </View>
    </View>
  );
};

// Confetti component
const ConfettiPiece: React.FC<{
  leftPercent: number;
  delay: number;
  duration: number;
}> = ({ leftPercent, delay, duration }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay * 1000),
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 500],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: `${leftPercent}%`,
        fontSize: 20,
        transform: [{ translateY }],
        opacity,
      }}
    >
      🎉
    </Animated.Text>
  );
};

// Pixel Avatar Renderer - renders avatar using pixel art data
const PixelAvatar: React.FC<{
  bodyIndex: number;
  hairIndex: number;
  clothingIndex: number;
  size: number;
}> = ({ bodyIndex, hairIndex, clothingIndex, size }) => {
  const scale = size / 64; // Base size is 64x64

  const renderRects = (
    rects: Array<[number, number, number, number, string]>,
  ) => {
    return rects.map((rect, i) => {
      const [x, y, width, height, fill] = rect;
      return (
        <View
          key={i}
          style={{
            position: "absolute",
            left: x * scale,
            top: y * scale,
            width: width * scale,
            height: height * scale,
            backgroundColor: fill,
          }}
        />
      );
    });
  };

  const body = AVATAR_PARTS.bodies[bodyIndex] || AVATAR_PARTS.bodies[0];
  const hair = AVATAR_PARTS.hairs[hairIndex] || AVATAR_PARTS.hairs[0];
  const clothing =
    AVATAR_PARTS.clothes[clothingIndex] || AVATAR_PARTS.clothes[0];

  return (
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      {renderRects(body.rects)}
      {renderRects(clothing.rects)}
      {renderRects(hair.rects)}
    </View>
  );
};

interface TrailCardProps {
  currentTile: number;
  bankedSteps: number;
  onTakeStep?: () => void;
  hasDetour?: boolean;
  isMoving?: boolean;
  avatarConfig: AvatarConfig;
  currentTrailIndex?: number;
  isTrailComplete?: boolean;
  totalStepsInvested?: number; // Total steps taken across all trails
  totalStepsNeeded?: number; // Total steps needed to complete all trails
  loading?: boolean; // Loading state for banked steps
}

const TrailCard: React.FC<TrailCardProps> = ({
  currentTile,
  bankedSteps,
  onTakeStep,
  hasDetour = false,
  isMoving = false,
  avatarConfig,
  currentTrailIndex = 0,
  isTrailComplete = false,
  totalStepsInvested = 0,
  totalStepsNeeded = 0,
  loading = false,
}) => {
  // Convert avatar string IDs to indices for PixelAvatar
  const bodyIndex = avatarConfig.body === "body1" ? 0 : 1;
  const hairIndex = avatarConfig.hair === "hair1" ? 0 : 1;
  const clothingIndex = avatarConfig.clothes === "cloth1" ? 0 : 1;

  // Get sprite sheet key for animated walking
  const spriteKey = getSpriteSheetKey(avatarConfig.body, avatarConfig.clothes);
  // Determine which nodes and background to use
  const trails = useMemo(() => {
    const allTrails = [
      ...(hasDetour
        ? [
            {
              name: "Detour",
              background: TRAIL_BACKGROUNDS.detour,
              nodes: DETOUR_NODES,
            },
          ]
        : []),
      {
        name: "Trail 1",
        background: TRAIL_BACKGROUNDS.trail1,
        nodes: TRAIL_NODES,
      },
      {
        name: "Trail 2",
        background: TRAIL_BACKGROUNDS.trail2,
        nodes: TRAIL_NODES.map((node, index) => {
          // Transform trail 2 nodes like in web version
          if (index === 0) return { ...node, y: node.y - 20 };
          if (index === 1) return { x: node.x - 20, y: node.y - 15 };
          if (index === 2) return { x: 115, y: 375 };
          if (index === 3) return { x: 165, y: 380 };
          if (index === 4) return { ...node, y: node.y + 35 };
          if (index === 5) return { x: node.x - 10, y: node.y + 45 };
          if (index === 6) return { ...node, y: node.y + 45 };
          if (index === 7) return { ...node, y: node.y + 65 };
          if (index === 8) return { ...node, y: node.y + 115 };
          if (index === 9) return { x: node.x + 60, y: node.y + 100 };
          if (index === 10) return { x: node.x + 40, y: node.y + 55 };
          if (index === 11) return { x: node.x + 40, y: node.y + 85 };
          if (index === 12) return { x: node.x + 60, y: node.y + 50 };
          if (index === 13) return { x: node.x + 60, y: node.y + 60 };
          return { ...node };
        }),
      },
    ];
    return allTrails;
  }, [hasDetour]);

  const currentTrail =
    trails[Math.min(currentTrailIndex, trails.length - 1)];
  const trailNodes = currentTrail.nodes;
  const trailBackground = currentTrail.background;

  const maxTile = trailNodes.length - 1;
  const moveDurationMs = 520;

  // Calculate avatar position with animation
  const avatarPos = trailNodes[Math.min(currentTile, maxTile)] || trailNodes[0];
  const avatarX = useRef(new Animated.Value(avatarPos.x)).current;
  const avatarY = useRef(new Animated.Value(avatarPos.y)).current;

  // Animate avatar position when tile changes
  useEffect(() => {
    if (isMoving) {
      Animated.parallel([
        Animated.timing(avatarX, {
          toValue: avatarPos.x,
          duration: moveDurationMs,
          useNativeDriver: true,
        }),
        Animated.timing(avatarY, {
          toValue: avatarPos.y,
          duration: moveDurationMs,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [avatarPos, isMoving, avatarX, avatarY]);

  // Calculate overall progress across ALL trails (like reference App.jsx)
  const overallProgressPct =
    totalStepsNeeded > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((totalStepsInvested / totalStepsNeeded) * 100)),
        )
      : 0;

  const isFinale = currentTile === maxTile;

  // 🔥 DEBUG: Log total steps to ensure they're being passed correctly
  useEffect(() => {
    console.log("🥾 TrailCard - Total Steps:", {
      totalStepsInvested,
      totalStepsNeeded,
      overallProgressPct,
      currentTile,
      currentTrailIndex,
    });
  }, [totalStepsInvested, totalStepsNeeded, overallProgressPct, currentTile, currentTrailIndex]);

  // Confetti pieces configuration
  const confettiPieces = [
    { left: 8, delay: 0, duration: 2.2 },
    { left: 18, delay: 0.3, duration: 2.6 },
    { left: 30, delay: 0.6, duration: 2.4 },
    { left: 42, delay: 0.2, duration: 2.8 },
    { left: 54, delay: 0.5, duration: 2.1 },
    { left: 66, delay: 0.1, duration: 2.7 },
    { left: 78, delay: 0.4, duration: 2.3 },
    { left: 90, delay: 0.7, duration: 2.5 },
  ];

  return (
    <View style={st.card}>
      <View style={st.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={st.cardLabel}>YOUR JOURNEY</Text>
          <Text style={st.cardTitle}>The Trail 🥾</Text>
          <Text style={st.totalStepsText}>
            {totalStepsInvested}/{totalStepsNeeded} steps • {overallProgressPct}%
          </Text>
        </View>
        <View style={st.stepsBadge}>
          <Text style={{ fontSize: 16 }}>👣</Text>
          <Text style={st.stepsValue}>{loading ? "..." : bankedSteps}</Text>
        </View>
      </View>

      {/* Trail visualization container with background */}
      <ImageBackground
        source={trailBackground}
        style={st.trailContainer}
        resizeMode="cover"
      >
        {/* Trail tiles - invisible, only used for positioning */}
        {trailNodes.map((pos, index) => {
          return (
            <View
              key={index}
              style={[
                st.tile,
                {
                  left: pos.x - 14,
                  top: pos.y - 14,
                  opacity: 0, // Invisible
                },
              ]}
            />
          );
        })}

        {/* Avatar with animated sprite when moving, static when not */}
        <Animated.View
          style={[
            st.avatar,
            isFinale && st.avatarFinale,
            {
              transform: [
                { translateX: avatarX },
                { translateY: avatarY },
                { translateX: -22 },
                { translateY: -48 },
              ],
            },
          ]}
        >
          {isMoving ? (
            <AnimatedSprite
              spriteKey={spriteKey}
              hairIndex={hairIndex}
              size={44}
              duration={moveDurationMs}
            />
          ) : (
            <PixelAvatar
              bodyIndex={bodyIndex}
              hairIndex={hairIndex}
              clothingIndex={clothingIndex}
              size={44}
            />
          )}
        </Animated.View>

        {/* Fog overlay removed per user request */}

        {/* Confetti at finale */}
        {isFinale &&
          confettiPieces.map((piece, i) => (
            <ConfettiPiece
              key={i}
              leftPercent={piece.left}
              delay={piece.delay}
              duration={piece.duration}
            />
          ))}
      </ImageBackground>

      {/* Trail Progress Summary - Shows TOTAL steps across ALL trails */}
      <View style={st.progressSection}>
        <View style={st.progressCard}>
          <Text style={st.progressLabel}>PROGRESS</Text>
          <View style={st.progressStats}>
            <Text style={st.progressText}>
              {totalStepsInvested}/{totalStepsNeeded} steps
            </Text>
            <Text style={st.progressPercent}>{overallProgressPct}% completed</Text>
          </View>
          <View style={st.progressBarContainer}>
            <View
              style={[st.progressBar, { width: `${overallProgressPct}%` as any }]}
            />
          </View>
        </View>

        {/* Take Step Button */}
        <TouchableOpacity
          style={[
            st.takeStepBtn,
            (bankedSteps === 0 || isTrailComplete) && st.takeStepBtnDisabled,
          ]}
          onPress={onTakeStep}
          disabled={bankedSteps === 0 || isTrailComplete}
        >
          <Text style={st.takeStepText}>
            {isTrailComplete ? "Trail Complete! 🎉" : "Take a Step"}
          </Text>
          {!isTrailComplete && <Text style={{ fontSize: 16 }}>👣</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  card: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 0,
    marginTop: 14,
    borderWidth: 1,
    borderColor: C.cream,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.cream,
  },
  cardLabel: {
    fontSize: 10,
    color: C.textLight,
    letterSpacing: 1.5,
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: 22,
    color: C.kelp,
    fontWeight: "600",
    marginTop: 4,
  },
  totalStepsText: {
    fontSize: 13,
    color: C.textMid,  // Darker for better visibility
    fontWeight: "600",
    marginTop: 6,
    letterSpacing: 0.3,
  },
  trailContainer: {
    height: 450,
    overflow: "hidden",
    position: "relative",
    margin: 0,
  },
  tile: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  tilePast: {
    borderColor: "#8f9974",
    backgroundColor: "#dfe6cf",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tileCurrent: {
    borderColor: "#a7b48a",
    backgroundColor: "#e8edd8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  tileFuture: {
    borderColor: C.cream,
    backgroundColor: "#fdf9f0",
  },
  avatar: {
    position: "absolute",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFinale: {
    shadowColor: "#3d472c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  fogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "25%",
    ...Platform.select({
      ios: {
        backgroundColor: "rgba(255, 255, 255, 0.6)",
      },
      android: {
        backgroundColor: "rgba(255, 255, 255, 0.4)",
      },
    }),
  },
  progressSection: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 10,
  },
  progressCard: {
    backgroundColor: C.parchment,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: C.cream,
  },
  progressLabel: {
    fontSize: 9,
    color: C.textLight,
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 8,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: C.textDark,
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 14,
    color: C.textLight,
    fontWeight: "700",
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: C.cream,
    borderRadius: 2.5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: C.kelp,
    borderRadius: 2.5,
  },
  takeStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fbf8ef",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.cream,
  },
  takeStepBtnDisabled: {
    opacity: 0.4,
  },
  takeStepText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textDark,
  },
  stepsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fbf8ef",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepsValue: {
    fontSize: 16,
    color: C.kelp,  // Use kelp green to make it stand out!
    fontWeight: "700",
  },
});

export default TrailCard;
