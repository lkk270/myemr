"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface AddMemberButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const AddMemberButton = ({ children, asChild }: AddMemberButtonProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
      }}
    >
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="overflow-y-scroll h-1/2 max-w-[450px] w-full">
        <div>HULLO</div>
      </DialogContent>
    </Dialog>
  );
};
