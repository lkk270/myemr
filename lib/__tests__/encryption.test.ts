import {
  generateAsymmetricKeyPairs,
  encryptWithPublicKey,
  decryptWithPrivateKey,
  generateSymmetricKey,
  encryptPatientRecord,
  decryptOnePatientField,
  encryptKey,
  decryptKey,
} from "../encryption";
import { EncryptionKeyType } from "@/app/types";

describe("Encryption Utils", () => {
  describe("Asymmetric Encryption", () => {
    test("should generate valid key pairs", () => {
      // Generate key pairs and check if both keys are defined and of string type
      const keys = generateAsymmetricKeyPairs();
      expect(keys.publicKey).toBeDefined();
      expect(keys.privateKey).toBeDefined();
      expect(typeof keys.publicKey).toBe("string");
      expect(typeof keys.privateKey).toBe("string");
      expect(keys.publicKey).toContain("BEGIN RSA PUBLIC KEY");
      expect(keys.privateKey).toContain("BEGIN RSA PRIVATE KEY");
    });

    test("should encrypt and decrypt data using asymmetric keys", () => {
      // Encrypt test data with public key and decrypt it with private key, then verify
      const testData = "Hello, World!";
      const keys = generateAsymmetricKeyPairs();

      const encrypted = encryptWithPublicKey(Buffer.from(testData), keys.publicKey);
      const decrypted = decryptWithPrivateKey(encrypted, keys.privateKey);

      expect(decrypted.toString()).toBe(testData);
    });
  });

  describe("Symmetric Encryption", () => {
    test("should generate valid symmetric key", () => {
      // Generate a symmetric key and check its type and length
      const key = generateSymmetricKey();
      expect(typeof key).toBe("string");
      expect(key.length).toBe(64); // 32 bytes in hex = 64 characters
    });

    test("should encrypt and decrypt patient record", () => {
      // Encrypt patient data and verify decryption returns the original data
      const testData = "Test Patient Data";
      const symmetricKey = generateSymmetricKey();

      const encrypted = encryptPatientRecord(testData, symmetricKey);
      const decrypted = decryptOnePatientField(encrypted, symmetricKey, "testField");

      expect(decrypted).toBe(testData);
    });
  });

  describe("Key Encryption", () => {
    beforeEach(() => {
      // Set up environment variables for testing
      process.env.PATIENT_PUBLIC_KEY_SECRET = "0".repeat(64);
      process.env.PATIENT_PRIVATE_KEY_SECRET = "1".repeat(64);
      process.env.PATIENT_SYMMETRIC_KEY_SECRET = "2".repeat(64);
      process.env.PROVIDER_PUBLIC_KEY_SECRET = "3".repeat(64);
      process.env.PROVIDER_PRIVATE_KEY_SECRET = "4".repeat(64);
    });

    afterEach(() => {
      // Clean up environment variables after each test
      delete process.env.PATIENT_PUBLIC_KEY_SECRET;
      delete process.env.PATIENT_PRIVATE_KEY_SECRET;
      delete process.env.PATIENT_SYMMETRIC_KEY_SECRET;
      delete process.env.PROVIDER_PUBLIC_KEY_SECRET;
      delete process.env.PROVIDER_PRIVATE_KEY_SECRET;
    });

    test("should encrypt and decrypt keys", () => {
      // Encrypt a test key and verify decryption returns the original key
      const testKey = "test-key-data";
      const encrypted = encryptKey(testKey, "patientPublicKey" as EncryptionKeyType);
      const decrypted = decryptKey(encrypted, "patientPublicKey" as EncryptionKeyType);

      expect(decrypted).toBe(testKey);
    });

    test("should handle missing environment variables", () => {
      // Test that missing environment variable throws an error
      process.env.PATIENT_PUBLIC_KEY_SECRET = undefined;
      const testKey = "test-key-data";
      expect(() => encryptKey(testKey, "patientPublicKey" as EncryptionKeyType)).toThrow(
        "Secret not found for key type: patientPublicKey",
      );
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid encrypted data format", () => {
      // Verify that invalid encrypted data format throws an error
      const symmetricKey = generateSymmetricKey();
      expect(() => decryptOnePatientField("invalid-format", symmetricKey, "testField")).toThrow(
        "Invalid encrypted record format",
      );
    });
  });
});
