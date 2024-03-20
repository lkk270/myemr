import { create } from "zustand";

type ShowTwoFactorStore = {
  showTwoFactor: boolean;
  setShowTwoFactor: (newShowTwoFactor: boolean) => void;
};

export const useShowTwoFactor = create<ShowTwoFactorStore>((set) => ({
  showTwoFactor: false,
  setShowTwoFactor: (newShowTwoFactor) =>
    set(() => ({
      showTwoFactor: newShowTwoFactor,
    })),
}));
