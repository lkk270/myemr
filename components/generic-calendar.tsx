"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GenericCombobox } from "@/components/generic-combobox";

interface ComboboxItem {
  value: string;
  label: string;
}

const startYear = 1900;
const endYear = 2023;

const years: ComboboxItem[] = [];

for (let year = endYear; year >= startYear; year--) {
  years.push({ value: year.toString(), label: year.toString() });
}
export const GenericCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date("2022-01-01"));
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("w-[240px] pl-3 text-left font-normal", !date && "text-muted-foreground")}
          >
            {date ? format(date, "PPP") : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div>
            <GenericCombobox
              handleChange={setDate}
              width="w-[100px]"
              placeholder="Select"
              valueParam={date?.getFullYear().toString()}
              searchPlaceholder="Search"
              noItemsMessage="No year found."
              items={years}
            />
            <Calendar
              defaultMonth={new Date(date?.getFullYear() || 2023, date?.getMonth() || new Date().getMonth())}
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
            ></Calendar>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
