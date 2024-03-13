import { create } from "zustand";
import { OrganizationWithRoleType } from "@/app/types";

interface OrganizationsStore {
  organizations: OrganizationWithRoleType[];
  organizationsSet: boolean; // New field to track if organizations have been set
  setOrganizations: (organizations: OrganizationWithRoleType[]) => void;
  addOrganization: (organization: OrganizationWithRoleType) => void;
  updateOrganization: (updatedOrganization: OrganizationWithRoleType) => void;
  deleteOrganization: (organizationId: string) => void;
  isOrganizationNameExist: (name: string) => boolean;
  getOrganizationById: (id: string) => OrganizationWithRoleType | undefined;
}

export const useOrganizationStore = create<OrganizationsStore>((set, get) => ({
  organizations: [],
  organizationsSet: false, // Initial value is false
  setOrganizations: (organizations) => set({ organizations, organizationsSet: true }),
  addOrganization: (organization) => set((state) => ({ organizations: [...state.organizations, organization] })),
  updateOrganization: (updatedOrganization) =>
    set((state) => ({
      organizations: state.organizations.map((organization) => {
        if (organization.id === updatedOrganization.id) {
          return {
            ...updatedOrganization,
          };
        }
        return organization;
      }),
    })),
  deleteOrganization: (organizationId) =>
    set((state) => ({
      organizations: state.organizations.filter((organization) => organization.id !== organizationId),
    })),
  isOrganizationNameExist: (name) => {
    const state = get();
    return state.organizations.some((organization) => organization.title === name);
  },
  getOrganizationById: (id) => {
    const state = get();
    return state.organizations.find((organization) => organization.id === id);
  },
}));
