import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";

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
    "rounded-md h-[40px] p-2 w-full text-sm z-[1000]",
    disabled
      ? "bg-[#ececec] dark:bg-[#282828] dark:text-[#7c7c7c] text-[#818181] cursor-not-allowed"
      : "bg-secondary dark:text-[#d9d9d9]",
  );
  return (
    <div className="z-[1000] border-primary/10 border-[1px] rounded-md">
      <Datepicker
        popoverDirection="down"
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
