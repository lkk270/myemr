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
import { isNum } from "./utils";
import { EncryptionKeyType, PatientDemographicsType } from "@/app/types";

// Symmetric encryption configuration
const algorithm = "aes-256-cbc";
const exemptFields = [
  "unit",
  "patientProfileId",
  "userId",
  "id",
  "medicationId",
  "createdAt",
  "updatedAt",
  "usedFileStorage",
  "plan",
  "imageUrl",
];
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

function convertValueToString(value: any) {
  let valueToEncrypt;
  if (typeof value === "number") {
    // Convert number to string
    valueToEncrypt = value.toString();
  }
  // } else if (value instanceof Date) {
  //   // Convert Date to ISO string format
  //   valueToEncrypt = value.toISOString();
  // } else if (Array.isArray(value)) {
  //   // Handle array of objects
  //   valueToEncrypt = JSON.stringify(value.map((obj) => JSON.stringify(obj)));
  // } else if (typeof value === "object") {
  //   // Handle single object
  //   valueToEncrypt = JSON.stringify(value);
  // } else {
  // Handle other types (including string)
  valueToEncrypt = value;
  // }
  return valueToEncrypt;
}
// Encrypt patient records with the symmetric key
export function encryptPatientRecord(record: string, symmetricKeyString: string) {
  const valueToEncrypt = convertValueToString(record);
  const symmetricKey = Buffer.from(symmetricKeyString, "hex");
  const iv = randomBytes(16); // Generate a new IV for each encryption
  const cipher = createCipheriv(algorithm, symmetricKey, iv);
  let encrypted = cipher.update(valueToEncrypt, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted; // Prepend IV to the encrypted data
}

// Decrypt patient records with the symmetric key
export function decryptOnePatientField(encryptedRecord: string, symmetricKeyString: string, key: string) {
  const parts = encryptedRecord.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted record format");
  }

  const iv = Buffer.from(parts[0], "hex"); // Extract the IV from the encrypted data
  const encryptedText = parts[1];
  const symmetricKey = Buffer.from(symmetricKeyString, "hex"); // Convert the key from hex to a Buffer
  const decipher = createDecipheriv(algorithm, symmetricKey, iv);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return convertDecryptedStringToType(decrypted, key);
}

export function decryptMultiplePatientFields(
  encryptedRecords: any, // Can be an object or an array of objects
  symmetricKeyString: string,
) {
  // Function to decrypt fields of an object
  function decryptObjectFields(obj: any, keyString: string) {
    let decryptedObj: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "string" && !key.includes("Key") && !exemptFields.includes(key)) {
        decryptedObj[key] = decryptOnePatientField(value, keyString, key);
      } else if (Array.isArray(value) && !key.includes("Key") && !exemptFields.includes(key)) {
        decryptedObj[key] = decryptArray(value, keyString);
      } else if (typeof value === "object" && value !== null && !key.includes("Key") && !exemptFields.includes(key)) {
        decryptedObj[key] = decryptObjectFields(value, keyString);
      } else {
        decryptedObj[key] = value; // unencrypted values or exempt fields
      }
    });
    return decryptedObj;
  }

  // Function to decrypt arrays
  function decryptArray(arr: any[], keyString: string) {
    return arr.map((item) => {
      if (typeof item === "object" && item !== null) {
        return decryptObjectFields(item, keyString);
      }
      return item; // return as is if it's not an object
    });
  }

  // Check if the input is an array or a single object
  if (Array.isArray(encryptedRecords)) {
    return encryptedRecords.map((record) => decryptObjectFields(record, symmetricKeyString));
  } else {
    return decryptObjectFields(encryptedRecords, symmetricKeyString);
  }
}

// Helper function to decrypt fields of an object
export function decryptObjectFields(obj: any, symmetricKeyString: string) {
  const decryptedObj: any = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "string" && !key.includes("Key") && !exemptFields.includes(key)) {
      decryptedObj[key] = decryptOnePatientField(value, symmetricKeyString, key);
    } else {
      decryptedObj[key] = value; // return as is if it's not a string
    }
  });
  return decryptedObj;
}

function convertDecryptedStringToType(decryptedValue: any, key: string) {
  let ret = decryptedValue;
  // try {
  //   if (!key.includes("Phone")) {
  //     ret = JSON.parse(decryptedValue);
  //   }
  //   // Additional check for date
  //   // if (typeof ret === "string") {
  //   //   const date = new Date(ret);
  //   //   if (!isNaN(date.getTime())) {
  //   //     ret = date;
  //   //   }
  //   // }
  // } catch (e) {
  //   // If JSON.parse throws an error, assume the value is a plain string
  //   // If it's numeric, convert to a number
  //   if (isNum(ret) && !key.includes("Phone")) {
  //     console.log(key);
  //     ret = parseFloat(ret);
  //   }
  // }
  return ret;
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
    const decipher = createDecipheriv(algorithm, Buffer.from(secret, "hex"), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return "Decryption failed";
  }
}
