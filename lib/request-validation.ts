import { PermissionsType, PermissionKey } from "@/app/types";

const validUpdateTypes = [
  "demographics",
  "newMedication",
  "editMedication",
  "deleteMedication",
  "renameNode",
  "moveNode",
  "trashNode",
  "restoreRootFolder",
  "deleteNode",
  "addRootNode",
  "addSubFolder",
  "uploadFiles",
  "insuranceUpload",
  "tpaUploadFiles",
];
const patientConditionals: any = {
  demographics: { requiredFields: ["fieldsObj"], optionalFields: [], mandatoryTruePermissions: ["isPatient"] },
  newMedication: { requiredFields: ["fieldsObj"], optionalFields: [], mandatoryTruePermissions: ["canAdd"] },
  editMedication: {
    requiredFields: ["fieldsObj", "medicationId"],
    optionalFields: ["dosageHistoryInitialFields"],
    mandatoryTruePermissions: ["canEdit"],
  },
  deleteMedication: { requiredFields: ["medicationId"], optionalFields: [], mandatoryTruePermissions: ["canDelete"] },
  renameNode: {
    requiredFields: ["nodeId", "isFile", "newName"],
    optionalFields: [],
    mandatoryTruePermissions: ["canEdit"],
  },
  moveNode: { requiredFields: ["selectedIds", "targetId"], optionalFields: [], mandatoryTruePermissions: ["canEdit"] },
  trashNode: {
    requiredFields: ["selectedIds", "targetId"],
    optionalFields: [],
    mandatoryTruePermissions: ["canDelete"],
  },
  restoreRootFolder: { requiredFields: ["selectedId"], optionalFields: [], mandatoryTruePermissions: ["isPatient"] },
  deleteNode: {
    requiredFields: ["nodeId", "isFile", "forEmptyTrash"],
    optionalFields: [],
    mandatoryTruePermissions: ["canDelete"],
  },
  addRootNode: {
    requiredFields: ["folderName", "addedByUserId", "patientUserId", "addedByName"],
    optionalFields: ["patientProfileId"],
    mandatoryTruePermissions: ["canAdd"],
  },
  addSubFolder: {
    requiredFields: ["parentId", "folderName", "addedByUserId", "patientUserId", "addedByName"],
    optionalFields: ["patientProfileId"],
    mandatoryTruePermissions: ["canAdd"],
  },
  uploadFiles: {
    requiredFields: ["fileName", "contentType", "size", "parentId", "parentNamePath", "parentPath"],
    optionalFields: ["folderPath"],
    mandatoryTruePermissions: ["canAdd", "canUploadFiles"],
  },
  insuranceUpload: {
    requiredFields: ["side", "contentType", "size"],
    optionalFields: [],
    mandatoryTruePermissions: ["isPatient"],
  },
  tpaUploadFiles: {
    requiredFields: ["fileName", "contentType", "size"],
    optionalFields: [],
    mandatoryTruePermissions: ["canUploadFiles"],
  },
};

const insuranceFileNames = ["FRONT", "BACK"];

export const patientUpdateVerification = (body: any, currentUserPermissions: PermissionsType) => {
  try {
    // Basic checks
    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      return false;
    }
    const { updateType } = body;

    // Check if updateType is valid
    if (!validUpdateTypes.includes(updateType)) {
      return false;
    }
    const conditionals = patientConditionals[updateType];
    const allFields = [...conditionals.requiredFields, ...conditionals.optionalFields];

    const permissions: PermissionKey[] = conditionals.mandatoryTruePermissions;

    // Check if body contains only the allowed fields (required + optional)
    for (const key in body) {
      if (!allFields.includes(key) && key !== "updateType") {
        return false;
      }
    }

    // Check if required fields are present
    for (const field of conditionals.requiredFields) {
      if (!body.hasOwnProperty(field)) {
        return false;
      }
    }
    // Check that the user has valid permissions
    for (const permission of permissions) {
      if (!currentUserPermissions[permission]) {
        return false;
      }
    }

    // Specific checks for 'deleteMedication'
    if (updateType === "deleteMedication" && body.fieldsObj) {
      return false;
    }
    if (updateType === "insuranceUpload" && !insuranceFileNames.includes(body.side)) {
      return false;
    }

    return true;
  } catch (error: any) {
    console.log(error);
    return false;
  }
};
