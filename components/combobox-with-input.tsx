"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { simpleSelectItems, SelectItemType, SimpleSelectItemsType, heightsImperial } from "@/lib/constants";

interface ComboboxWithInputProps {
  inputValueParam?: string | null;
  selectValueParam: string;
  disabled?: boolean;
  fieldName: keyof ConstantsType;
  handleChange: (value: any) => void;
}

interface ConstantsType {
  height: SelectItemType[];
}

const constants: ConstantsType = {
  height: heightsImperial,
};

export const ComboboxWithInput = ({
  inputValueParam = "",
  selectValueParam,
  disabled = false,
  handleChange,
  fieldName,
}: ComboboxWithInputProps) => {
  const [inputValue, setInputValue] = useState(inputValueParam || "");
  const items = simpleSelectItems[fieldName];
  const [selectedUnit, setSelectedUnit] = useState(selectValueParam);
  const [displayItems, setDisplayItems] = useState(constants[fieldName]);

  const updateDisplayItems = (unit: string) => {
    const updatedItems = constants[fieldName].map((item) => ({
      ...item,
      label: unit === selectValueParam ? item.value : item.value2 || "",
    }));
    setDisplayItems(updatedItems);
  };

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    updateDisplayItems(unit);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    handleChange((prev: any) => ({
      ...prev,
      [fieldName]: e.target.value,
    }));
  };

  return (
    <div className="relative flex items-center">
      <Input />
      <Select onValueChange={(val) => handleUnitChange(val)}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder={items.find((item) => item.value === selectValueParam)?.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
