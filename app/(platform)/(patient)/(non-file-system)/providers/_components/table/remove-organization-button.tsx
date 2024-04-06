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
import { useTransition } from "react";
import { toast } from "sonner";
import { logout } from "@/auth/actions/logout";
import { useOrganizationsStore } from "../../hooks/use-organizations";
import { useIsLoading } from "@/hooks/use-is-loading";
import { RemoveOrganizationSchema } from "../../schemas";
import { removeOrganization } from "../../actions/organizations";
import { z } from "zod";
interface DeleteMemberButtonProps {
  organization: { memberId: string; organizationName: string };
  children: React.ReactNode;
  asChild?: boolean;
}

export const RemoveOrganizationButton = ({ children, asChild, organization }: DeleteMemberButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const { isLoading, setIsLoading } = useIsLoading();
  const { deleteOrganization } = useOrganizationsStore();

  const handleDelete = (values: z.infer<typeof RemoveOrganizationSchema>) => {
    setIsLoading(true);
    startTransition(() => {
      removeOrganization(values)
        .then((data) => {
          if (!!data.error) {
            toast.error(data.error);
            if (data.error === "Unauthorized") {
              logout();
            }
          }
          if (!!data.success) {
            deleteOrganization(values.memberId);
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
        <AlertDialogTitle className="text-md">Remove organization?</AlertDialogTitle>
        <AlertDialogDescription className="flex flex-col gap-y-2">
          <p>
            Are you sure you want to remove the organization:{" "}
            <p className="break-words whitespace-normal italic font-semibold">
              {organization.organizationName}
              <span className="not-italic font-normal">?</span>
            </p>
          </p>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || isLoading}
            onClick={() => {
              handleDelete({ memberId: organization.memberId });
            }}
            className="w-20 h-8 text-sm bg-secondary hover:bg-[#fdf0ef] dark:hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
