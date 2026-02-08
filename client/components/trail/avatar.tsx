import React from 'react';
import { View, StyleSheet } from 'react-native';

import Body1 from '@/assets/body1.svg';
import Body2 from '@/assets/body2.svg';
import Cloth1 from '@/assets/cloth1.svg';
import Cloth2 from '@/assets/cloth2.svg';
import Hair1 from '@/assets/hair1.svg';
import Hair2 from '@/assets/hair2.svg';

type AvatarVariant = 0 | 1;

interface AvatarProps {
  body: AvatarVariant;
  hair: AvatarVariant;
  clothing: AvatarVariant;
  size?: number;
  style?: object;
}

export function Avatar({ body, hair, clothing, size = 64, style }: AvatarProps) {
  const Body = body === 0 ? Body1 : Body2;
  const Hair = hair === 0 ? Hair1 : Hair2;
  const Cloth = clothing === 0 ? Cloth1 : Cloth2;

  const layerStyle = [StyleSheet.absoluteFill, { width: size, height: size }];

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <View style={layerStyle}>
        <Body width={size} height={size} preserveAspectRatio="xMidYMid meet" />
      </View>
      <View style={[layerStyle, { pointerEvents: 'none' }]}>
        <Cloth width={size} height={size} preserveAspectRatio="xMidYMid meet" />
      </View>
      <View style={[layerStyle, { pointerEvents: 'none' }]}>
        <Hair width={size} height={size} preserveAspectRatio="xMidYMid meet" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    transform: [{ scaleX: -1 }],
  },
});
