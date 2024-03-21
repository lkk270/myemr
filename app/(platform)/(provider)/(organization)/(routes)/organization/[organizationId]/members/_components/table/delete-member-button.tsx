"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DeleteOrganizationMemberSchema } from "@/app/(platform)/(provider)/(organization)/schema/organization";
import { deleteMember } from "@/app/(platform)/(provider)/(organization)/actions/organization";
import { logout } from "@/auth/actions/logout";
import { useOrganizationMembersStore } from "../../hooks/use-members";
import { useIsLoading } from "@/hooks/use-is-loading";
import { z } from "zod";
interface DeleteMemberButtonProps {
  member: { id: string; email: string; organizationId: string };
  children: React.ReactNode;
  asChild?: boolean;
}

export const DeleteMemberButton = ({ children, asChild, member }: DeleteMemberButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const { isLoading, setIsLoading } = useIsLoading();
  const { deleteOrganizationMember } = useOrganizationMembersStore();

  const handleDelete = (values: z.infer<typeof DeleteOrganizationMemberSchema>) => {
    setIsLoading(true);
    startTransition(() => {
      deleteMember(values)
        .then((data) => {
          if (!!data.error) {
            toast.error(data.error);
            if (data.error === "Unauthorized") {
              logout();
            }
          }
          if (!!data.success) {
            deleteOrganizationMember(values.memberId);
            toast.success(data.success);
          }
        })
        .catch((e) => {
          console.log(e);
          toast.error("Something went wrong");
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogTitle className="text-md">Remove member?</AlertDialogTitle>
        <AlertDialogDescription className="flex flex-col gap-y-2">
          <p>
            Are you sure you want to remove the member:{" "}
            <p className="break-words whitespace-normal italic font-semibold">
              {member.email}
              <span className="not-italic font-normal">? This action cannot be undone</span>
            </p>
          </p>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || isLoading}
            onClick={() => {
              handleDelete({ memberId: member.id, organizationId: member.organizationId });
            }}
            className="w-20 h-8 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
