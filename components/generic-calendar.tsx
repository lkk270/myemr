import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Datepicker, { DateValueType, DateType } from "react-tailwindcss-datepicker";

interface GenericCalendarProps {
  disabled: boolean;
  className?: string;
  valueParam?: string | null;
  handleChange: (value: any) => void;
}

function createDateValueType(dateString: string | null | undefined): DateValueType {
  if (!dateString) {
    return null;
  }
  return {
    startDate: dateString,
    endDate: dateString,
  };
}

export const GenericCalendar = ({ disabled, className, valueParam, handleChange }: GenericCalendarProps) => {
  const value = createDateValueType(valueParam);
  const handleValueChange = (newValue: any) => {
    // console.log("newValue:", newValue);
    // console.log(newValue);
    // console.log(typeof newValue);
    // setValue(newValue);
    handleChange(newValue.startDate);
  };

  const inputClassName = cn(
    "rounded-md h-[40px] p-2 w-full text-sm",
    disabled
      ? "dark:bg-[#1a1817] dark:text-[#838281] text-[#858484] cursor-not-allowed"
      : "bg-secondary dark:text-[#fafaf9]",
  );
  return (
    <div className="border-primary/10 border-[1px] rounded-md">
      <Datepicker
        minDate={new Date("1900-01-01")}
        maxDate={new Date()}
        useRange={false}
        asSingle={true}
        value={value}
        onChange={handleValueChange}
        readOnly={true}
        inputClassName={inputClassName}
        disabled={disabled}
      />
    </div>
  );
};
