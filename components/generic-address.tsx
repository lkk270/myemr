"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { states } from "@/lib/constants";
import { Address } from "@prisma/client";

interface AddressProps {
  address?: Address | null;
  disabled?: boolean;
  handleChange: (value: any) => void;
}

export const GenericAddress = ({ address, disabled = false, handleChange}: AddressProps) => {
  let localAddress: any = address || {};
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const updatedAddress = { ...localAddress, [name]: value };
    localAddress = updatedAddress;
    handleChange(updatedAddress); // Update the address in parent component
  };

  const handleLocalChangeForCombobox = (fieldName: string, value: string) => {
    console.log(fieldName, value);
    const updatedAddress = { ...localAddress, [fieldName]: value };
    localAddress = updatedAddress;
    handleChange(updatedAddress); // Update the address in parent component
  };
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 w-full items-center gap-4 px-4">
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            type="text"
            id="address"
            name="address"
            className="dark:bg-slate-800"
            value={localAddress?.address || ""}
            disabled={disabled}
            onChange={handleLocalChange}
          />
        </div>
        <div>
          <Label htmlFor="address2">Apt, suite, etc (optional)</Label>
          <Input
            type="text"
            id="address2"
            name="address2"
            className="dark:bg-slate-800"
            value={localAddress?.address2 || ""}
            disabled={disabled}
            onChange={handleLocalChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 w-full items-center gap-4 px-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            type="text"
            id="city"
            name="city"
            className="dark:bg-slate-800"
            value={localAddress?.city || ""}
            disabled={disabled}
            onChange={handleLocalChange}
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <GenericCombobox
            valueParam={localAddress?.state || ""}
            handleChange={(value) => handleLocalChangeForCombobox("state", value)}
            disabled={disabled}
            className="dark:bg-slate-800 font-normal w-full"
            placeholder="Select..."
            searchPlaceholder="Search..."
            noItemsMessage="No state found."
            items={states}
          />
        </div>
        <div>
          <Label htmlFor="zip">ZIP / Postal code</Label>
          <Input
            type="text"
            id="zipcode"
            name="zipcode"
            className="dark:bg-slate-800"
            value={localAddress?.zipcode || ""}
            disabled={disabled}
            onChange={handleLocalChange}
          />
        </div>
      </div>
    </>
  );
};
