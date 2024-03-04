import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Unit } from "@prisma/client";
import { NewMedicationType } from "@/app/types";
import { genders, martialStatuses, races, heightsImperial, heightsMetric, states, dosageFrequency } from "./constants";
export * from "./encryption";
// export * from "./initial-profile";
export * from "./request-validation";

import { FaRegFilePowerpoint } from "react-icons/fa";
import { BiMoviePlay } from "react-icons/bi";
import {
  BsFiletypePng,
  BsFiletypeJpg,
  BsFiletypeCsv,
  BsFiletypeMp4,
  BsFiletypeMp3,
  BsFiletypeTxt,
  BsFiletypeDocx,
  BsFileEarmarkExcel,
  BsFiletypePdf,
  BsFileEarmark,
  BsFileEarmarkImage,
  BsFiletypeTiff,
  BsFileZip,
} from "react-icons/bs";
import { SingleLayerNodesType, SingleLayerNodesType2 } from "@/app/types/file-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDateWithGivenYear(year: number) {
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();
  return new Date(year, month, day);
}

export function isNum(str: string): boolean {
  return /^\d*\.?\d+$/.test(str);
}

export function checkForInvalidDemographicsData(data: any, initialUser: any) {
  const allowedFields = [
    "firstName",
    "lastName",
    "gender",
    "dateOfBirth",
    "maritalStatus",
    "race",
    "allergies",
    "mobilePhone",
    "homePhone",
    "height",
    "weight",
    "insuranceProvider",
    "policyNumber",
    "groupNumber",
    "addresses",
  ];
  // Return true if the string is undefined (skipping validation), otherwise check if it's a valid non-empty string
  const isStringValid = (str: string | undefined) => str === undefined || (str !== null && str.length > 0);
  const isNameValid = (str: string | undefined) => {
    return str === undefined || /^[A-Za-z]+(-[A-Za-z]+)*$/.test(str);
  };
  const isValidZipCode = (zip: string) => {
    const regex = /^(\d{5})(-\d{4})?$/;
    return regex.test(zip);
  };

  // Return true if the phone number is undefined (skipping validation), otherwise check if it's a valid 10-digit number
  const isPhoneNumberValid = (phone: string | undefined) => !phone || (phone.length === 10 && isNum(phone));

  // Validate gender, considering undefined as valid (skipping validation)
  if (data.gender !== undefined && !isValueInArrayOfConstObj(genders, data.gender)) {
    return "Gender is invalid";
  }

  // Validate mobile phone
  if (!isPhoneNumberValid(data.mobilePhone)) {
    return "Mobile phone is invalid";
  }

  // Validate home phone
  if (!isPhoneNumberValid(data.homePhone)) {
    return "Home phone is invalid";
  }

  // Validate first name
  if (!isNameValid(data.firstName)) {
    return "First name is invalid";
  }

  // Validate last name
  if (!isNameValid(data.lastName)) {
    return "Last name is invalid";
  }
  if (
    typeof data.height === "string" &&
    !isValueInArrayOfConstObj(heightsImperial, data.height) &&
    !isValueInArrayOfConstObj(heightsMetric, data.height)
  ) {
    return "Invalid height";
  }
  if (typeof data.race === "string" && !isValueInArrayOfConstObj(races, data.race)) {
    return "Invalid race";
  }
  if (typeof data.maritalStatus === "string" && !isValueInArrayOfConstObj(martialStatuses, data.maritalStatus)) {
    return "Invalid marital status";
  }
  if (
    !isStringValid(data.weight) ||
    (data.weight && (data.weight.length > 8 || data.weight.includes("-") || parseFloat(data.weight) < 2))
  ) {
    return "Weight is invalid";
  }
  if (!initialUser.addresses || (initialUser.addresses.length === 0 && data.addresses)) {
    const newAddresses = data.addresses[0];
    if (!newAddresses.address || !newAddresses.city || !newAddresses.state || !newAddresses.zipcode) {
      return "Address is missing required fields";
    }
  }
  if (data.addresses && data.addresses.length !== 0) {
    const address = data.addresses[0];
    if (typeof address.address === "string" && address.address.length === 0) {
      return "Invalid address";
    }
    if (typeof address.city === "string" && address.city.length === 0) {
      return "Invalid city";
    }
    if (typeof address.state === "string" && !isValueInArrayOfConstObj(states, address.state)) {
      return "Invalid state";
    }
    if (typeof address.zipcode === "string" && !isValidZipCode(address.zipcode)) {
      return "Invalid zip code";
    }
    return checkForExtraneousFields(Object.keys(address), ["address", "address2", "city", "state", "zipcode"]);
  }
  return checkForExtraneousFields(Object.keys(data), allowedFields);
}

function convertHeightToMeters(height: string): number {
  const feetInches = height.split("' ");
  const feet = parseInt(feetInches[0]);
  const inches = parseInt(feetInches[1].replace('"', ""));
  // Convert feet and inches to meters
  const meters = feet * 0.3048 + inches * 0.0254;
  return meters;
}

export function calculateBMI(unit: Unit, height: string, weight: string): string {
  let newHeight;
  let newWeight = parseFloat(weight);
  if (unit === Unit.METRIC) {
    newHeight = (parseFloat(height) / 100) ** 2;
  } else {
    newHeight = Math.pow(convertHeightToMeters(height), 2);
    newWeight /= 2.2046226218;
  }
  // let roundedVal = Math.round((newWeight / newHeight) * 100) / 100;
  // console.log((newWeight / newHeight).toFixed(2));
  // console.log(roundedVal);
  // console.log(roundedVal.toString());
  return (newWeight / newHeight).toFixed(2);
}

function isValueInArrayOfConstObj(array: any[], stringValue: string) {
  return array.some((element) => element.value === stringValue);
}

function checkForExtraneousFields(dataKeys: string[], allowedFields: string[]) {
  for (const key of dataKeys) {
    if (!allowedFields.includes(key)) {
      return `Invalid field: ${key}`;
    }
  }
  return "";
}

export function checkForInvalidNewMedication(data: NewMedicationType | null) {
  const requiredFields = {
    name: "Name is required",
    category: "Category is required",
    dosage: "Dosage is required",
    dosageUnits: "Dosage units are required",
    frequency: "Dosage frequency is required",
    prescribedByName: "Prescriber is required",
    status: "Status is required",
  };

  if (!data) return "Data is invalid";
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!data[key as keyof NewMedicationType]) {
      return value;
    }
  }
  if (data.status !== "active" && data.status !== "inactive") {
    return "Invalid status";
  }
  if (typeof data.prescribedById === "string" && (!data.prescribedById || !data.prescribedByName)) {
    return "Invalid prescriber";
  }
  if (typeof data.dosage === "string") {
    const dosageNum = parseFloat(data.dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      return "Invalid dosage";
    }
  }
  if (!isValueInArrayOfConstObj(dosageFrequency, data.frequency)) {
    return "Invalid dosage frequency";
  }
  const allowedFields = [...Object.keys(requiredFields), "prescribedById", "description"];
  return checkForExtraneousFields(Object.keys(data), allowedFields);
}

export function checkForInvalidEditedMedication(data: Partial<NewMedicationType>) {
  const allowedFields = {
    category: "Category is required",
    dosage: "Dosage is required",
    dosageUnits: "Dosage units are required",
    frequency: "Dosage frequency is required",
    prescribedByName: "Prescriber is required",
    prescribedById: "Prescriber Id is required",
    description: "Description is cannot be an empty string",
    status: "Status is required",
  };
  if (typeof data.name === "string") {
    return "Cannot edit the name of a medication";
  }
  for (const [key, value] of Object.entries(allowedFields)) {
    const fieldValue = data[key as keyof NewMedicationType];
    if (typeof fieldValue === "string" && fieldValue.length === 0) {
      return value;
    }
  }
  if (data.status && data.status !== "active" && data.status !== "inactive") {
    return "Invalid status";
  }

  if (typeof data.dosage === "string") {
    const dosageNum = parseFloat(data.dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      return "Invalid dosage";
    }
  }
  if (data.frequency && !isValueInArrayOfConstObj(dosageFrequency, data.frequency)) {
    return "Invalid dosage frequency";
  }
  if (typeof data.prescribedById === "string" && (!data.prescribedById || !data.prescribedByName)) {
    return "Invalid prescriber";
  }
  return checkForExtraneousFields(Object.keys(data), Object.keys(allowedFields));
}

export function capitalizeFirstLetter(str: string) {
  if (!str) return str; // Return the original string if it's empty
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// export function getFileIcon(filename: string, fileType?: string) {
//   // Provide a fallback ('') for pop() in case the array is empty
//   const extension = filename.split(".").pop()?.toLowerCase() || "";

//   switch (extension) {
//     case "doc":
//     case "docx":
//       return BsFiletypeDocx;
//     case "xls":
//     case "xlsx":
//       return BsFileEarmarkExcel;
//     case "ppt":
//     case "pptx":
//     case "pptm":
//       return FaRegFilePowerpoint;
//     case "pdf":
//       return BsFiletypePdf;
//     case "mov":
//       return BiMoviePlay;
//     case "png":
//       return BsFiletypePng;
//     case "jpg":
//     case "jpeg":
//       return BsFiletypeJpg;
//     case "csv":
//       return BsFiletypeCsv;
//     case "mp4":
//       return BsFiletypeMp4;
//     case "mp3":
//       return BsFiletypeMp3;
//     case "txt":
//       return BsFiletypeTxt;
//     default:
//       if (fileType?.includes("image")) {
//         return BsFileEarmarkImage;
//       } else {
//         return BsFileEarmark;
//       }
//   }
// }

export function getFileIcon(fileType: string) {
  switch (fileType) {
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return BsFiletypeDocx;
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return BsFileEarmarkExcel;
    case "text/csv":
      return BsFiletypeCsv;
    case "application/vnd.ms-powerpoint":
    case "application/vnd.ms-powerpoint.presentation.macroenabled.12":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return FaRegFilePowerpoint;
    case "application/pdf":
      return BsFiletypePdf;
    case "video/quicktime":
      return BiMoviePlay;
    case "image/png":
      return BsFiletypePng;
    case "image/jpeg":
      return BsFiletypeJpg;
    case "image/tiff":
      return BsFiletypeTiff;
    case "audio/mp4":
      return BsFiletypeMp4;
    case "audio/mpeg":
      return BsFiletypeMp3;
    case "text/plain":
      return BsFiletypeTxt;
    case "application/zip":
      return BsFileZip;
    default:
      if (fileType.includes("video")) {
        return BiMoviePlay;
      }
      if (fileType.includes("image")) {
        return BsFileEarmarkImage;
      } else {
        return BsFileEarmark;
      }
  }
}

export function isViewableFile(fileType: string) {
  const viewableTypes = [
    "application/pdf",
    "audio/mpeg",
    "audio/mp4",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/avif",
    "image/webp",
    "image/svg+xml",
    "image/vnd.microsoft.icon",
    "image/x-icon",
    "image/bmp",
  ];
  return viewableTypes.includes(fileType);
}

export function isValidNodeName(fileName: string): boolean {
  // Check if the file name is empty
  if (!fileName || fileName.trim().length === 0) {
    return false;
  }
  const invalidChars = /[\/\\?%*:|"<>&]/g;
  return !invalidChars.test(fileName);
}

// Utility function to sort nodes: folders first (alphabetically), then files (alphabetically).
const sortNodes = (nodes: any[]): any[] => {
  return nodes.sort((a, b) => {
    // Sort folders before files
    if (a.isFile !== b.isFile) {
      return a.isFile ? 1 : -1;
    }
    // Then sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
};

// Recursive function to apply sorting to each folder's children
export const sortFolderChildren = (folder: any): any => {
  let sortedFolder = { ...folder };

  if (folder.children && folder.children.length > 0) {
    sortedFolder.children = sortNodes(folder.children.map((child: any) => sortFolderChildren(child)));
  }

  return sortedFolder;
};

export const sortRootNodes = (array: any[]) => {
  return array.sort((a, b) => {
    // Check for special 'Trash' condition
    const isATrash = a.name === "Trash" && !a.isFile && a.isRoot === true;
    const isBTrash = b.name === "Trash" && !b.isFile && b.isRoot === true;

    if (isATrash) return 1; // Always sort 'Trash' to the end
    if (isBTrash) return -1;

    // Standard alphabetical sorting
    return a.name.localeCompare(b.name);
  });
};

export const extractNodes = (folders: any[]) => {
  let rawAllNodes: any[] = [];

  const extract = (folders: any[]) => {
    folders.forEach((folder) => {
      rawAllNodes.push({ ...folder, children: undefined }); // Assuming you want to remove 'children' from each node
      if (folder.children) {
        extract(folder.children);
      }
    });
  };

  extract(folders);
  return rawAllNodes;
};

export function addLastViewedAtAndSort(array: SingleLayerNodesType[]): SingleLayerNodesType2[] {
  // Extract lastViewedAt and remove recordViewActivity
  const updatedArray = array.map((item) => {
    const lastViewedAt = item.recordViewActivity.length > 0 ? item.recordViewActivity[0].lastViewedAt : undefined;

    const { recordViewActivity, ...rest } = item;
    return { ...rest, lastViewedAt };
  });

  return sortSingleLayerNodes(updatedArray);
}

export function sortSingleLayerNodes(array: SingleLayerNodesType2[]): SingleLayerNodesType2[] {
  // Separate items with and without a lastViewedAt
  const itemsWithDate = array.filter((item) => item.lastViewedAt != null);
  const itemsWithoutDate = array.filter((item) => item.lastViewedAt == null);

  const sortedItems = itemsWithDate
    .sort((a, b) => {
      const dateA = a.lastViewedAt as Date;
      const dateB = b.lastViewedAt as Date;
      return dateB.getTime() - dateA.getTime();
    })
    .concat(itemsWithoutDate);

  return sortedItems;
}

export function formatFileSize(bytes: bigint) {
  const KB = 1000n;
  const MB = 1000000n;
  const GB = 1000000000n;
  const TB = 1000000000000n;

  if (bytes < KB) return bytes + " Bytes";
  else if (bytes < MB) return Number(bytes / KB).toFixed(1) + " KB";
  else if (bytes < GB) return Number(bytes / MB).toFixed(1) + " MB";
  else if (bytes < TB) return Number(bytes / GB).toFixed(2) + " GB";
  return Number(bytes / TB).toFixed(2) + " TB";
}

// Assuming amzDate is a string like "20240205T235432Z"
export const isLinkExpired = (url: string) => {
  const urlParams = new URL(url);
  const amzDateStr = urlParams.searchParams.get("X-Amz-Date");
  const amzExpires = urlParams.searchParams.get("X-Amz-Expires");

  if (!amzDateStr || !amzExpires) {
    return false; // If any parameter is missing, assume the link is not expired.
  }
  // Parse the X-Amz-Date string to a Date object.
  // The X-Amz-Date is in the format "YYYYMMDDTHHMMSSZ", which is basically ISO8601.
  // However, JavaScript's Date constructor might not parse it correctly without modifications.
  // Convert "YYYYMMDDTHHMMSSZ" to "YYYY-MM-DDTHH:MM:SSZ" which is fully supported.
  const amzDate = amzDateStr.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, "$1-$2-$3T$4:$5:$6Z");

  const expiryTimestamp = new Date(amzDate).getTime() + parseInt(amzExpires) * 1000; // Convert expires to milliseconds
  // Compare with current UTC time in milliseconds
  return expiryTimestamp <= new Date().getTime();
};

export const extractNewNodeIdFromPath = (pathnameVar: string) => {
  // Regular expression to match the patterns and capture the ID part
  const regex = /\/(files|file|tpa-files|tpa-file)\/([^\/]+)/;
  const match = pathnameVar.match(regex);

  if (match) {
    return match[2];
  }
  return "";
};

export const getNodeHref = (isPatient: boolean, isFile: boolean, nodeId: string) => {
  return `${isPatient ? (isFile ? "/file/" : "/files/") : isFile ? "/tpa-file/" : "/tpa-files/"}${nodeId}`;
};

export function getTimeUntil(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000); // Convert milliseconds to seconds

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"}`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.ceil(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.ceil(diffInSeconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  } else {
    const days = Math.ceil(diffInSeconds / 86400);
    return `${days} day${days === 1 ? "" : "s"}`;
  }
}

// function flattenStructure(data: any[]) {
//   let result: any[] = [];

//   function flattenItem(item: any) {
//     // Add the current item to the result
//     result.push({
//       id: item.id,
//       path: item.path,
//       namePath: item.namePath,
//       name: item.name,
//       isFile: item.isFile,
//     });

//     // If the item has children, flatten each child
//     if (item.children && item.children.length) {
//       item.children.forEach((child: any) => flattenItem(child));
//     }
//   }

//   flattenItem(data); // start with the root item
//   return result;
// }

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_URL}${path}`;
}
