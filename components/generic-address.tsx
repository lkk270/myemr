"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericCombobox } from "@/components/generic-combobox";
import { states } from "@/lib/constants";
import { PatientAddress } from "@prisma/client";
import { cn } from "@/lib/utils";

const inputClassName = "bg-secondary border-primary/10";
interface AddressProps {
  address?: PatientAddress | null;
  disabled?: boolean;
  handleChange: (value: any) => void;
}

export const GenericAddress = ({ address, disabled = false, handleChange }: AddressProps) => {
  let localAddress: any = address || {};
  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const updatedAddress = { ...localAddress, [name]: value };
    localAddress = updatedAddress;
    handleChange(updatedAddress); // Update the address in parent component
  };

  const handleLocalChangeForCombobox = (fieldName: string, value: string) => {
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
            className={inputClassName}
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
            className={inputClassName}
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
            className={inputClassName}
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
            className={cn("font-normal w-full", inputClassName)}
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
            className={inputClassName}
            value={localAddress?.zipcode || ""}
            disabled={disabled}
            onChange={handleLocalChange}
          />
        </div>
      </div>
    </>
  );
};
