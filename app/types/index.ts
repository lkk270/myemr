import { Plan } from "@prisma/client";

// types/index.ts
export * from "./patient-types";
export * from "./table-types";

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
  priceText: string;
  stripePrice: number;
  featured: boolean;
  items: string[];
};
