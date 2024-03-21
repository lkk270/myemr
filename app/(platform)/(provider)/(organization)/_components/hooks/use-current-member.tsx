import { OrganizationMemberRole } from "@prisma/client";
import { create } from "zustand";

type CurrentMemberRole = {
  currentMemberRole: OrganizationMemberRole;
  setNewCurrentMemberRole: (newCurrentMemberRole: OrganizationMemberRole) => void;
};

export const useCurrentMember = create<CurrentMemberRole>((set) => ({
  currentMemberRole: "USER",
  setNewCurrentMemberRole: (newCurrentMemberRole) =>
    set(() => ({
      currentMemberRole: newCurrentMemberRole,
    })),
}));
