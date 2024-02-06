import { create } from "zustand";

interface usePathnameStore {
  prevPathnameVar: string | null;
  setPrevPathnameVar: (pathnameVar: string | null) => void;
  pathnameVar: string | null;
  setPathnameVar: (pathnameVar: string | null) => void;
}

export const usePathnameHook = create<usePathnameStore>((set) => ({
  prevPathnameVar: null,
  setPrevPathnameVar: (pathnameVar) => set({ prevPathnameVar: pathnameVar }),
  pathnameVar: null,
  setPathnameVar: (pathnameVar) => set({ pathnameVar: pathnameVar }),
}));
