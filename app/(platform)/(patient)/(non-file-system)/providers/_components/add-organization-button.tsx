"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { AddOrganizationForm } from "./add-organization-form";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { useOrganizationsStore } from "../hooks/use-organizations";

interface AddOrganizationButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const AddOrganizationButton = ({ children, asChild }: AddOrganizationButtonProps) => {
  const [open, setOpen] = useState(false);
  const currentUser = useCurrentUser();
  if (!currentUser) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
      }}
    >
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="flex justify-center w-full max-w-[450px]">
        <AddOrganizationForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
