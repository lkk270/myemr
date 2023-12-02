import React, { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";

interface GenericCalendarProps {
  disabled: boolean;
  className?: string;
}

export const GenericCalendar = ({ disabled, className }: GenericCalendarProps) => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue: any) => {
    console.log("newValue:", newValue);
    setValue(newValue);
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
