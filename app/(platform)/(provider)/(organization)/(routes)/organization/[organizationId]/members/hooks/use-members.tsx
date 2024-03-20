import { create } from "zustand";
import { OrganizationMemberType } from "@/app/types";

interface OrganizationMembersStore {
  organizationMembers: OrganizationMemberType[];
  organizationMembersSet: boolean; // New field to track if organizationMembers have been set
  setOrganizationMembers: (organizationMembers: OrganizationMemberType[]) => void;
  addOrganizationMember: (organizationMember: OrganizationMemberType) => void;
  patchOrganizationMember: (organizationMemberId: string, updates: Partial<OrganizationMemberType>) => void;
  deleteOrganizationMember: (organizationMemberId: string) => void;
  isOrganizationMemberEmailExist: (email: string) => boolean;
  getOrganizationMemberById: (id: string) => OrganizationMemberType | undefined;
}

export const useOrganizationMembersStore = create<OrganizationMembersStore>((set, get) => ({
  organizationMembers: [],
  organizationMembersSet: false, // Initial value is false
  setOrganizationMembers: (organizationMembers) => set({ organizationMembers, organizationMembersSet: true }),
  addOrganizationMember: (organizationMember) =>
    set((state) => ({ organizationMembers: [...state.organizationMembers, organizationMember] })),
  patchOrganizationMember: (organizationMemberId, updates) =>
    set((state) => ({
      organizationMembers: state.organizationMembers.map((organizationMember) =>
        organizationMember.id === organizationMemberId ? { ...organizationMember, ...updates } : organizationMember,
      ),
    })),
  deleteOrganizationMember: (organizationMemberId) =>
    set((state) => ({
      organizationMembers: state.organizationMembers.filter(
        (organizationMember) => organizationMember.id !== organizationMemberId,
      ),
    })),
  isOrganizationMemberEmailExist: (email) => {
    const state = get();
    return state.organizationMembers.some((organizationMember) => organizationMember.user.email === email);
  },
  getOrganizationMemberById: (id) => {
    const state = get();
    return state.organizationMembers.find((organizationMember) => organizationMember.id === id);
  },
}));
