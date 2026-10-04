import { create } from 'zustand';
import { useMemo } from 'react';

export type SkillSettings = {
  baseLevel: number;
  maxLevel: number;
  baseXP: number;
  modifier: number;
};

type SkillStore = {
  settings: SkillSettings;
  levelMap: Record<string, number>;
  setSettings: (updater: SkillSettings | ((prev: SkillSettings) => SkillSettings)) => void;
};

type SkillHookResult = {
  prevLevelXP: number;
  currentLevel: number;
  nextLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressToLevel: number;
  xpToNextLevel: number;
};

function calculateXPForLevel(level: number, settings: SkillSettings): number {
  if (level < settings.baseLevel) return 0;
  if (level === 1) return 0;
  if (level === 2) return settings.baseXP;

  let totalXP = settings.baseXP;

  for (let i = 2; i <= level - 1; i++) {
    const baseRuneScapeXP = Math.floor((i + 300 * 2 ** (i / 7)) / 4);
    totalXP += baseRuneScapeXP * settings.modifier;
  }

  return Math.floor(totalXP);
}

function generateLevelMap(settings: SkillSettings): Record<string, number> {
  const levelMap: Record<string, number> = {};
  for (let level = settings.baseLevel; level <= settings.maxLevel; level++) {
    levelMap[level.toString()] = calculateXPForLevel(level, settings);
  }
  return levelMap;
}

function getLevelFromXP(xp: number, levelMap: Record<string, number>, settings: SkillSettings): number {
  for (let level = settings.baseLevel; level <= settings.maxLevel; level++) {
    const xpForLevel = levelMap[level.toString()];
    if (xpForLevel > xp) return level - 1;
  }
  return settings.maxLevel;
}

export function createSkill(defaultSettings: SkillSettings) {
  const useStore = create<SkillStore>((set) => ({
    settings: defaultSettings,
    levelMap: generateLevelMap(defaultSettings),
    setSettings: (updater) =>
      set((state) => {
        const newSettings = typeof updater === 'function' ? updater(state.settings) : updater;
        return {
          settings: newSettings,
          levelMap: generateLevelMap(newSettings),
        };
      }),
  }));

  const useSkill = (xp: number): SkillHookResult => {
    const { settings, levelMap } = useStore();

    return useMemo(() => {
      const currentLevel = getLevelFromXP(xp, levelMap, settings);
      const nextLevel = Math.min(currentLevel + 1, settings.maxLevel);
      
      const currentLevelXP = levelMap[currentLevel.toString()] || 0;
      const nextLevelXP = levelMap[nextLevel.toString()] || 0;

      const xpInCurrentLevel = xp - currentLevelXP;
      const xpRequiredForLevel = nextLevelXP - currentLevelXP;
      const progressToLevel = xpRequiredForLevel > 0 
        ? (xpInCurrentLevel / xpRequiredForLevel) * 100 
        : 100;

      const xpToNextLevel = Math.max(0, nextLevelXP - xp);
      const prevLevelXP = calculateXPForLevel(currentLevel - 1, settings);
      return {
        currentLevel,
        nextLevel,
        currentLevelXP,
        prevLevelXP,
        nextLevelXP,
        progressToLevel: Math.min(100, Math.max(0, progressToLevel)),
        xpToNextLevel,
      };
    }, [xp, levelMap, settings]);
  };

  // Return settings object with access to store
  const skill = {
    get settings() {
      return useStore.getState().settings;
    },
    setSettings: (updater: SkillSettings | ((prev: SkillSettings) => SkillSettings)) => {
      useStore.getState().setSettings(updater);
    },
    useSettings: () => useStore((state) => state.settings),
  };

  return {
    skill,
    useSkill,
  };
}

// Example usage:
// export const { skill: drugSkill, useSkill: useDrugSkill } = createSkill({
//   baseLevel: 1,
//   maxLevel: 99,
//   baseXP: 83,
//   modifier: 1,
// });