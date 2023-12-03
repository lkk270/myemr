import {
  generateKeyPairSync,
  publicEncrypt,
  privateDecrypt,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  KeyObject,
  Decipher,
} from "crypto";

import { EncryptionKeyType, PatientDemographicsType } from "@/app/types";

// Symmetric encryption configuration
const algorithm = "aes-256-cbc";
const iv = randomBytes(16); // Initialization vector for AES

// Function to convert key objects to PEM formatted strings
function convertKeyToString(key: KeyObject) {
  return key.export({ type: "pkcs1", format: "pem" }).toString();
}

// Generate public-private key pairs
export function generateAsymmetricKeyPairs() {
  const keys = generateKeyPairSync("rsa", { modulusLength: 2048 });

  return {
    publicKey: convertKeyToString(keys.publicKey),
    privateKey: convertKeyToString(keys.privateKey),
  };
}

// Encrypt data using a public key
export function encryptWithPublicKey(data: Buffer, publicKey: string) {
  return publicEncrypt(publicKey, data);
}

// Decrypt data using a private key
export function decryptWithPrivateKey(data: Buffer, privateKey: string) {
  return privateDecrypt(privateKey, data);
}

// Generate a symmetric key for encrypting patient records
export function generateSymmetricKey() {
  return randomBytes(32).toString("hex"); // Generates a 256-bit key and converts it to a hex string
}

// Encrypt patient records with the symmetric key
export function encryptPatientRecords(records: string, symmetricKeyString: string) {
  const symmetricKey = Buffer.from(symmetricKeyString, "hex");
  const iv = randomBytes(16); // Generate a new IV for each encryption
  const cipher = createCipheriv(algorithm, symmetricKey, iv);
  let encrypted = cipher.update(records, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted; // Prepend IV to the encrypted data
}
// Decrypt patient records with the symmetric key
export function decryptOnePatientField(encryptedRecord: string, symmetricKeyString: string) {
  const parts = encryptedRecord.split(":");
  console.log(parts);
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted record format");
  }

  const iv = Buffer.from(parts[0], "hex"); // Extract the IV from the encrypted data
  const encryptedText = parts[1];

  const symmetricKey = Buffer.from(symmetricKeyString, "hex"); // Convert the key from hex to a Buffer
  const decipher = createDecipheriv(algorithm, symmetricKey, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function decryptMultiplePatientFields(
  encryptedRecords: PatientDemographicsType | any,
  symmetricKeyString: string,
) {
  let patientObj: any = {};

  Object.entries(encryptedRecords).forEach(([key, encryptedValue]) => {
    let decrypted = null;
    if (
      encryptedValue !== null &&
      encryptedValue !== undefined &&
      typeof encryptedValue === "string" &&
      !key.includes("Key")
    ) {
      const parts = encryptedValue.split(":");
      const iv = Buffer.from(parts[0], "hex"); // Extract the IV
      const encryptedText = parts[1];

      const symmetricKey = Buffer.from(symmetricKeyString, "hex");
      const decipher = createDecipheriv(algorithm, symmetricKey, iv);
      let decrypted = decipher.update(encryptedText, "hex", "utf8");
      decrypted += decipher.final("utf8");
      patientObj[key] = decrypted;
    } else {
      patientObj[key] = decrypted;
    }
  });

  return patientObj;
}

function getKeySecret(keyType: EncryptionKeyType): string {
  const envMapping: { [key in EncryptionKeyType]: string } = {
    patientPublicKey: "PATIENT_PUBLIC_KEY_SECRET",
    patientPrivateKey: "PATIENT_PRIVATE_KEY_SECRET",
    patientSymmetricKey: "PATIENT_SYMMETRIC_KEY_SECRET",
    providerPublicKey: "PROVIDER_PUBLIC_KEY_SECRET",
    providerPrivateKey: "PROVIDER_PRIVATE_KEY_SECRET",
  };

  const envVar = envMapping[keyType];
  const secret = process.env[envVar];

  if (!secret) {
    throw new Error(`Secret not found for key type: ${keyType}`);
  }

  return secret;
}

export function encryptKey(dataToEncrypt: string, keyType: EncryptionKeyType): string {
  try {
    const secret = getKeySecret(keyType);
    const iv = randomBytes(16); // generate a random IV
    const cipher = createCipheriv("aes-256-cbc", Buffer.from(secret, "hex"), iv);
    let encrypted = cipher.update(dataToEncrypt);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error(error);
    return "Encryption failed";
  }
}

export function decryptKey(dataToDecrypt: string, keyType: EncryptionKeyType): string {
  try {
    const secret = getKeySecret(keyType);
    const textParts = dataToDecrypt.split(":");

    // Check if IV is present
    const ivString = textParts.shift();
    if (!ivString) {
      throw new Error("IV not found in encrypted data");
    }

    const iv = Buffer.from(ivString, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = createDecipheriv("aes-256-cbc", Buffer.from(secret, "hex"), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error(error);
    return "Decryption failed";
  }
}
