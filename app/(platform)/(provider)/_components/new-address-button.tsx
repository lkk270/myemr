"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddressForm } from "./forms/address-form";

interface LoginButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const NewAddressButton = ({ children, asChild }: LoginButtonProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="overflow-y-scroll h-5/6 max-w-[875px] w-full">
        <AddressForm />
      </DialogContent>
    </Dialog>
  );
};
