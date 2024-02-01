import { create } from "zustand";

interface useIsLoadingStore {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useIsLoading = create<useIsLoadingStore>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading: isLoading }),
}));
