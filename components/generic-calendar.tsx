import React, { useState } from "react";
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

  return (
    <Datepicker
      minDate={new Date("1900-01-01")}
      maxDate={new Date()}
      useRange={false}
      asSingle={true}
      value={value}
      onChange={handleValueChange}
      readOnly={true}
      disabled={disabled}
    />
  );
};
