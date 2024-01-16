const validUpdateTypes = [
  "demographics",
  "newMedication",
  "editMedication",
  "deleteMedication",
  "renameNode",
  "moveNode",
  "addNode",
  "deleteNode",
];
const patientConditionals: any = {
  demographics: { requiredFields: ["fieldsObj"], optionalFields: [] },
  newMedication: { requiredFields: ["fieldsObj"], optionalFields: [] },
  editMedication: { requiredFields: ["fieldsObj", "medicationId"], optionalFields: ["dosageHistoryInitialFields"] },
  deleteMedication: { requiredFields: ["medicationId"], optionalFields: [] },
  renameNode: { requiredFields: ["nodeId", "isFile", "newName"], optionalFields: [] },
  moveNode: { requiredFields: ["selectedIds", "targetId"], optionalFields: [] },
  deleteNode: { requiredFields: ["nodeId", "isFile"], optionalFields: [] },

};

export const patientUpdateVerification = (body: any) => {
  // Basic checks
  if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
    console.log("FAIL");
    return false;
  }

  const { updateType } = body;

  // Check if updateType is valid
  if (!validUpdateTypes.includes(updateType)) {
    return false;
  }

  const conditionals = patientConditionals[updateType];
  const allFields = [...conditionals.requiredFields, ...conditionals.optionalFields];

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

  // Specific checks for 'deleteMedication'
  if (updateType === "deleteMedication" && body.fieldsObj) {
    return false;
  }

  return true;
};
