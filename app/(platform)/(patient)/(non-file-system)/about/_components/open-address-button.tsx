"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddressForm } from "./address-form";
import { AddressSchema } from "@/lib/schemas/address";
import { z } from "zod";
import { useState } from "react";

interface OpenAddressButtonProps {
  initialData?: z.infer<typeof AddressSchema>;
  numOfCurrentAddresses: number;
  addOrUpdateFunction: (address: z.infer<typeof AddressSchema>) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

export const OpenAddressButton = ({
  children,
  asChild,
  addOrUpdateFunction,
  initialData,
  numOfCurrentAddresses,
}: OpenAddressButtonProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
      }}
    >
      <DialogTrigger
        // onClick={() => {
        //   setOpen(true);
        // }}
        asChild={asChild}
      >
        {children}
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll h-5/6 max-w-[875px] w-full">
        <AddressForm
          numOfCurrentAddresses={numOfCurrentAddresses}
          initialData={initialData}
          setOpen={setOpen}
          addOrUpdateFunction={addOrUpdateFunction}
        />
      </DialogContent>
    </Dialog>
  );
};
