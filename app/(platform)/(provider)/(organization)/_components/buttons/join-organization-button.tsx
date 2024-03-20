"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { JoinOrganizationForm } from "../forms/join-organization-form";
interface InviteMemberButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const InviteMemberButton = ({ children, asChild }: InviteMemberButtonProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
      }}
    >
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="overflow-y-scroll max-w-[450px] w-full">
        <JoinOrganizationForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
