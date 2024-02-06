"use client";

import { useEffect, useState, useRef } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ComboboxItem {
  value: string;
  label: string;
  namePath?: string;
}

interface GenericComboboxProps {
  items: ComboboxItem[];
  width?: string;
  valueParam?: string | null;
  placeholder?: string;
  searchPlaceholder?: string;
  noItemsMessage?: string;
  handleChange?: (value: any) => void;
  className?: string;
  disabled?: boolean;
  allowOther?: boolean;
  forFileSystem?: boolean;
}

export const GenericCombobox = ({
  items,
  placeholder = "Select item...",
  searchPlaceholder = "Search item...",
  noItemsMessage = "No item found.",
  width = "w-[220px] md:w-full",
  valueParam,
  handleChange,
  className = "bg-secondary",
  disabled = false,
  allowOther = false,
  forFileSystem = false,
}: GenericComboboxProps) => {
  const [newItems, setNewItems] = useState(items);
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const initialLoadHandled = useRef(false);

  useEffect(() => {
    if (!initialLoadHandled.current && valueParam) {
      const foundItem = newItems.find((item) => item.value === valueParam);
      if (!foundItem) {
        setNewItems((prevItems) => [...prevItems, { value: valueParam, label: valueParam }]);
        initialLoadHandled.current = true;
      }
    }
  }, [valueParam, newItems]);

  return (
    <div className={disabled ? "cursor-not-allowed" : "cursor-default"}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            disabled={disabled}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(width, "justify-between items-center", className, "font-normal flex")}
          >
            <div className="flex flex-col flex-grow min-w-0 items-start">
              <span className="truncate text-left w-full">
                {valueParam ? newItems.find((item) => item.value === valueParam)?.label || valueParam : placeholder}
              </span>
              <span className="truncate text-left w-full text-xs text-primary/40">
                {forFileSystem && newItems.find((item) => item.value === valueParam)?.namePath}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(width, "p-0 overflow-y-scroll max-h-[250px]", className)}>
          <Command>
            <CommandInput placeholder={searchPlaceholder} onValueChange={(value) => setSearchInput(value)} />
            <CommandEmpty>
              {!allowOther || (searchInput && searchInput.trim() === "") ? (
                noItemsMessage
              ) : (
                <div className="pt-2">
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (valueParam) {
                        setNewItems((prevItems) => [...prevItems, { value: searchInput, label: searchInput }]);
                      }
                      handleChange && handleChange(searchInput);
                      setOpen(false);
                    }}
                  >
                    Use: {searchInput}
                  </Button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {newItems.map((item) => (
                <CommandItem
                  className={cn("cursor-pointer", className)}
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    handleChange && handleChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", valueParam === item.value ? "opacity-100" : "opacity-0")} />
                  <div className={cn("flex flex-col flex-grow min-w-0 items-start")}>
                    <span className="text-left w-full whitespace-normal break-all">{item.label}</span>
                    <span className="text-left w-full text-xs text-primary/40 whitespace-normal break-all">
                      {forFileSystem && item.namePath}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
