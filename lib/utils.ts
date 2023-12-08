import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Unit } from "@prisma/client";
export * from "./encryption";
export * from "./initial-profile";

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

export function checkForInvalidData(data: any, initialUser: any) {
  console.log(data.addresses);
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
  const isPhoneNumberValid = (phone: string | undefined) =>
    phone === undefined || (phone.length === 10 && isNum(phone));

  // Validate gender, considering undefined as valid (skipping validation)
  if (data.gender !== undefined && data.gender !== "MALE" && data.gender !== "FEMALE") {
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
    console.log(data.firstName);

    return "First name is invalid";
  }

  // Validate last name
  if (!isNameValid(data.lastName)) {
    console.log(data.lastName);
    return "Last name is invalid";
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
    if (typeof address.state === "string" && address.state.length !== 2) {
      return "Invalid state";
    }
    if (typeof address.zipcode === "string" && !isValidZipCode(address.zipcode)) {
      return "Invalid zip code";
    }
  }
  return "";
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
