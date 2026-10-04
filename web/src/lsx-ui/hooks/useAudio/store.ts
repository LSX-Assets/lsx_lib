import { create } from 'zustand';

// Import sounds as URLs (TypeScript-safe)
import clickSoundUrl from './click_sound.mp3';
import hoverSoundUrl from './hover_sound.mp3';

// Define a type for the store state and actions
type AudioPlayerStore = {
  play: (sound: string) => void;
  stop: (sound: string) => void;
};

// Create the store using Zustand
export const useAudio = create<AudioPlayerStore>(() => {
  const audioRefs: Record<string, HTMLAudioElement> = {};

  // Predefined sounds
  const sounds: Record<string, string> = {
    click: clickSoundUrl,
    hover: hoverSoundUrl,
  };

  // Initialize audio elements for each sound
  for (const [key, src] of Object.entries(sounds)) {
    audioRefs[key] = new Audio(src);
  }

  return {
    play: (sound) => {
      const audio = audioRefs[sound];
      if (!audio) return console.warn(`Sound '${sound}' not found.`);
      audio.currentTime = 0;
      audio.volume = 0.1;
      audio.play();
    },
    stop: (sound) => {
      const audio = audioRefs[sound];
      if (!audio) return console.warn(`Sound '${sound}' not found.`);
      audio.pause();
      audio.currentTime = 0;
    },
  };
});
