import { create } from "zustand";
import { PatientMember } from "@prisma/client";

interface OrganizationsStore {
  organizations: PatientMember[];
  organizationsSet: boolean;
  setOrganizations: (organizationMembers: PatientMember[]) => void;
  addOrganization: (organizationMember: PatientMember) => void;
  patchOrganization: (organizationMemberId: string, updates: Partial<PatientMember>) => void;
  deleteOrganization: (organizationMemberId: string) => void;
  getOrganizationById: (id: string) => PatientMember | undefined;
}

export const useOrganizationsStore = create<OrganizationsStore>((set, get) => ({
  organizations: [],
  organizationsSet: false, // Initial value is false
  setOrganizations: (organizations) => set({ organizations, organizationsSet: true }),
  addOrganization: (organization) => set((state) => ({ organizations: [...state.organizations, organization] })),
  patchOrganization: (organizationId, updates) =>
    set((state) => ({
      organizations: state.organizations.map((organization) =>
        organization.id === organizationId ? { ...organization, ...updates } : organization,
      ),
    })),
  deleteOrganization: (organizationId) =>
    set((state) => ({
      organizations: state.organizations.filter((organization) => organization.id !== organizationId),
    })),
  getOrganizationById: (id) => {
    const state = get();
    return state.organizations.find((organization) => organization.id === id);
  },
}));
