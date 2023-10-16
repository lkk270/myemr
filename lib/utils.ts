import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDateWithGivenYear(year: number) {
  const today = new Date();
  const month = today.getMonth();
  const day = today.getDate();
  return new Date(year, month, day);
}
