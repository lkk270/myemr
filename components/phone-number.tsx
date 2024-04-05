"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface PhoneNumberProps {
  number?: string | null;
  disabled?: boolean;
  fieldName: string;
  className?: string;
  handleChange: (value: any) => void;
}

export const PhoneNumber = ({
  number = "",
  disabled = false,
  handleChange,
  fieldName,
  className = "bg-secondary border-primary/10",
}: PhoneNumberProps) => {
  // Helper function to format the phone number.
  const formatPhoneNumber = (inputNumber: string) => {
    if (!inputNumber) {
      return "";
    }

    const digits = inputNumber.replace(/\D/g, "");
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Initialize the state with the formatted version of the `number` prop.
  const [value, setValue] = useState(formatPhoneNumber(number || ""));

  // Effect hook to update the state when the `number` prop changes.
  // This ensures that the input field updates if the prop changes from the outside.
  useEffect(() => {
    setValue(formatPhoneNumber(number || ""));
  }, [number]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setValue(formattedNumber); // Schedule state update.
    handleChange(formattedNumber.replace(/\D/g, "")); // Lifting state up as plain digits.
  };

  return (
    <div className="relative flex items-center">
      <span className="pr-3 text-2xl">🇺🇸</span>
      <Input
        type="tel"
        autoComplete="tel"
        className={className}
        value={value} // Controlled component.
        onChange={onChange}
        placeholder="(000) 000-0000"
        disabled={disabled}
      />
    </div>
  );
};
