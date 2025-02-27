import { create } from "zustand";

const useAudioStore = create((set) => ({
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  audioStream: null,
  setAudioStream: (stream) => set({ audioStream: stream, isPlaying: true }),
  stopAudio: () => set({ isPlaying: false, audioStream: null }),
}));

export default useAudioStore;
