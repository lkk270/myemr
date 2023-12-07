"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface PhoneNumberProps {
  number?: string | null;
  disabled?: boolean;
  fieldName: string;
  handleChange: (value: any) => void;
}

export const PhoneNumber = ({ number = "", disabled = false, handleChange, fieldName }: PhoneNumberProps) => {
  const formatPhoneNumber = (inputNumber: string) => {
    if (!inputNumber) {
      return "";
    }

    const digits = inputNumber.replace(/\D/g, "");
    const length = digits.length;

    if (length < 4) return digits;
    if (length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const [value, setValue] = useState(formatPhoneNumber(number || ""));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    const formattedNumber = formatPhoneNumber(e.target.value);
    setValue(formattedNumber);
    handleChange((prev: any) => ({
      ...prev,
      [fieldName]: formattedNumber.replace(/\D/g, ""),
    }));
  };

  return (
    <div className="relative flex items-center">
      <span className="py-2 px-3 text-2xl">🇺🇸</span>
      <Input
        type="tel"
        autoComplete="tel"
        className="dark:bg-slate-800"
        value={value}
        onChange={onChange}
        placeholder="(123) 456-7890"
        disabled={disabled}
      />
    </div>
  );
};
