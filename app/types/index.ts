// types/index.ts
export * from "./patient-types";

export type EncryptionKeyType =
  | "patientPublicKey"
  | "patientPrivateKey"
  | "patientSymmetricKey"
  | "providerPublicKey"
  | "providerPrivateKey";
