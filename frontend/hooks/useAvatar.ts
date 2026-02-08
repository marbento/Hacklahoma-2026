// frontend/hooks/useAvatar.ts
// Persistent avatar config using AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { AvatarConfig, DEFAULT_AVATAR } from "../assets/avatarData";

const AVATAR_KEY = "@trail_avatar";

export function useAvatar() {
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_KEY).then((raw) => {
      if (raw) {
        try {
          setAvatar({ ...DEFAULT_AVATAR, ...JSON.parse(raw) });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback(async (config: AvatarConfig) => {
    setAvatar(config);
    await AsyncStorage.setItem(AVATAR_KEY, JSON.stringify(config));
  }, []);

  const updatePart = useCallback(
    async (key: keyof AvatarConfig, value: string) => {
      const next = { ...avatar, [key]: value };
      setAvatar(next);
      await AsyncStorage.setItem(AVATAR_KEY, JSON.stringify(next));
    },
    [avatar],
  );

  return { avatar, loaded, save, updatePart };
}
