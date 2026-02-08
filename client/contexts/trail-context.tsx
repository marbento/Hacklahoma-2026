import React, { createContext, useContext, useState, useCallback } from 'react';

type AvatarVariant = 0 | 1;

export interface SavedAvatar {
  body: AvatarVariant;
  hair: AvatarVariant;
  clothing: AvatarVariant;
}

interface TrailContextValue {
  savedAvatar: SavedAvatar;
  setSavedAvatar: (avatar: SavedAvatar) => void;
  selectedHair: AvatarVariant;
  setSelectedHair: (v: AvatarVariant) => void;
  selectedBody: AvatarVariant;
  setSelectedBody: (v: AvatarVariant) => void;
  selectedClothing: AvatarVariant;
  setSelectedClothing: (v: AvatarVariant) => void;
  saveAvatar: () => void;
}

const defaultAvatar: SavedAvatar = { body: 0, hair: 0, clothing: 0 };

const TrailContext = createContext<TrailContextValue | null>(null);

export function TrailProvider({ children }: { children: React.ReactNode }) {
  const [savedAvatar, setSavedAvatarState] = useState<SavedAvatar>(defaultAvatar);
  const [selectedHair, setSelectedHair] = useState<AvatarVariant>(0);
  const [selectedBody, setSelectedBody] = useState<AvatarVariant>(0);
  const [selectedClothing, setSelectedClothing] = useState<AvatarVariant>(0);

  const setSavedAvatar = useCallback((avatar: SavedAvatar) => {
    setSavedAvatarState(avatar);
  }, []);

  const saveAvatar = useCallback(() => {
    setSavedAvatarState({
      body: selectedBody,
      hair: selectedHair,
      clothing: selectedClothing,
    });
  }, [selectedBody, selectedHair, selectedClothing]);

  const value: TrailContextValue = {
    savedAvatar,
    setSavedAvatar,
    selectedHair,
    setSelectedHair,
    selectedBody,
    setSelectedBody,
    selectedClothing,
    setSelectedClothing,
    saveAvatar,
  };

  return <TrailContext.Provider value={value}>{children}</TrailContext.Provider>;
}

export function useTrail() {
  const ctx = useContext(TrailContext);
  if (!ctx) throw new Error('useTrail must be used within TrailProvider');
  return ctx;
}
