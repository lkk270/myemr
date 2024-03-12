import { create } from "zustand";

interface UseInsuranceImagesStore {
  imagesUrls: { front: string | null; back: string | null };
  setInsuranceImageUrls: (urls: Partial<{ front: string | null; back: string | null }>) => void;
}

export const useInsuranceImages = create<UseInsuranceImagesStore>((set) => ({
  imagesUrls: { front: null, back: null },

  setInsuranceImageUrls: (urls: Partial<{ front: string | null; back: string | null }>) => {
    set((state) => ({
      imagesUrls: {
        ...state.imagesUrls,
        ...urls,
      },
    }));
  },
}));
