import { Plan } from "@prisma/client";

// types/index.ts
export * from "./patient-types";
export * from "./table-types";
export * from "./organization-types";

export type EncryptionKeyType =
  | "patientPublicKey"
  | "patientPrivateKey"
  | "patientSymmetricKey"
  | "providerPublicKey"
  | "providerPrivateKey";

export type PermissionsType = {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canUploadFiles: boolean;
  showActions: boolean;
  isPatient: boolean;
};

export type PermissionKey = keyof PermissionsType;

export type SubscriptionTierType = {
  id: Plan;
  title: string;
  description?: string;
  priceText: string;
  stripePrice: number;
  featured: boolean;
  items: string[];
};

export type TermsParagraphType = {
  title: string;
  description?: string;
  headerClassName?: string;
  bullets?: string[];
};

export type currentUserPermissionsType = {
  canRead: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canUploadFiles: boolean;
  showActions: boolean;
  isPatient: boolean;
  isProvider: boolean;
  hasAccount: boolean;
};

export type currentProviderPermissionsType = {
  canRead: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canUploadFiles: boolean;
  showActions: boolean;
};

export type ComboboxItemType = {
  id?: string;
  value: string;
  label: string;
  namePath?: string;
};
