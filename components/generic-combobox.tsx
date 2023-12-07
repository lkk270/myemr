"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
interface ComboboxItem {
  value: string;
  label: string;
}

interface GenericComboboxProps {
  items: ComboboxItem[];
  width?: string;
  fieldName: string;
  valueParam?: string | null;
  placeholder?: string;
  searchPlaceholder?: string;
  noItemsMessage?: string;
  handleChange?: (value: any) => void;
  className?: string;
  disabled?: boolean;
}

export const GenericCombobox = ({
  items = [],
  placeholder = "Select item...",
  searchPlaceholder = "Search item...",
  noItemsMessage = "No item found.",
  width = "w-[240px]",
  valueParam,
  fieldName = "",
  handleChange,
  className = "dark:bg-slate-800",
  disabled = false,
}: GenericComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(valueParam);

  return (
    <div className={disabled ? "cursor-not-allowed" : "cursor-default"}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            disabled={disabled}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(width, "justify-between", className)}
          >
            {value ? items.find((item) => item.value === value)?.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(width, "p-0 overflow-y-scroll max-h-[250px]", className)}>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandEmpty>{noItemsMessage}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  className={"cursor-pointer"}
                  key={item.value}
                  onSelect={() => {
                    setValue((prevValue) => (prevValue === item.value ? "" : item.value));
                    if (handleChange) {
                      handleChange((prev: any) => ({
                        ...prev,
                        [fieldName]: item.value,
                      }));

                      setOpen(false);
                    }
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")} />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
