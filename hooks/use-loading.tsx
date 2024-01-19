import { create } from "zustand";

type LoadingStore = {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
};

export const useLoading = create<LoadingStore>((set) => ({
  isLoading: false,
  showLoading: () => set({ isLoading: true }),
  hideLoading: () => set({ isLoading: false }),
}));
