"use client";

import React, { useState, useEffect } from "react";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  newOnOpen?: () => void;
  filters?: { accessorKey: string; title: string; options: { value: string; label: string }[] }[];
}

export function DataTableToolbar<TData>({ table, newOnOpen, filters = [] }: DataTableToolbarProps<TData>) {
  // const newMedicationModal = useNewMedicationModal();
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    // Set up a global filter
    table.setGlobalFilter(filterText);
  }, [filterText, table]);

  const isFiltered = table.getState().globalFilter;
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter..."
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filters.map((filter) => {
          return (
            <DataTableFacetedFilter
              key={filter.accessorKey}
              column={table.getColumn(filter.accessorKey)}
              title={filter.title}
              options={filter.options}
            />
          );
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setFilterText(""); // Reset the filter text state
              table.setGlobalFilter(""); // Reset the global filter
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {newOnOpen && (
        <div className="flex gap-x-2">
          <Button variant="outline" size="sm" className="ml-auto h-8" onClick={newOnOpen}>
            New
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      )}
    </div>
  );
}
