import React, { useState, ChangeEvent } from "react";
import Datepicker from "react-tailwindcss-datepicker";

export const GenericCalendar: React.FC = () => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const handleValueChange = (newValue: any) => {
    console.log("newValue:", newValue);
    setValue(newValue);
  };

  return (
    <div id="dob">
      <Datepicker
        minDate={new Date("1900-01-01")}
        maxDate={new Date()}
        useRange={false}
        asSingle={true}
        value={value}
        onChange={handleValueChange}
        readOnly={true}
      />
    </div>
  );
};
