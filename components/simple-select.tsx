import * as React from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { simpleSelectItems, SimpleSelectItemsType } from "@/lib/constants";

interface SimpleSelectProps {
  itemsKey: keyof SimpleSelectItemsType;
  valueParam: string;
  disabled?: boolean;
  handleChange: (value: any) => void;
}

export const SimpleSelect = ({ itemsKey, valueParam, disabled = false, handleChange }: SimpleSelectProps) => {
  const items = simpleSelectItems[itemsKey];

  return (
    <Select>
      <SelectTrigger className="w-[80px]">
        <SelectValue placeholder={items.find((item) => item.value === valueParam)?.label} />
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
  );
};
