"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { InviteMemberForm } from "./invite-member-form";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { useOrganizationMembersStore } from "../hooks/use-members";

interface InviteMemberButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const InviteMemberButton = ({ children, asChild }: InviteMemberButtonProps) => {
  const [open, setOpen] = useState(false);
  const currentUser = useCurrentUser();
  if (!currentUser) return null;
  const { getOrganizationMemberByUserId } = useOrganizationMembersStore();
  const currentUserMember = getOrganizationMemberByUserId(currentUser.id);
  if (!currentUserMember || (currentUserMember.role !== "ADMIN" && currentUserMember.role !== "OWNER")) {
    return null;
  }
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
      }}
    >
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="flex justify-center w-full max-w-[450px]">
        <InviteMemberForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
};
