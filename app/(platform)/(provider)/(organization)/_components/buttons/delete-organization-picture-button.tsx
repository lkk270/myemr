"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTransition } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { deleteOrganizationProfilePicture } from "../../actions/organization";
import { useOrganizationStore } from "../hooks/use-organizations";
interface DeleteOrganizationProfilePictureButton {
  setIsProfilePictureLoading: (value: boolean) => void;
  organizationId: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export const DeleteOrganizationProfilePictureButton = ({
  setIsProfilePictureLoading,
  organizationId,
  children,
  asChild,
}: DeleteOrganizationProfilePictureButton) => {
  const { patchOrganization } = useOrganizationStore();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setIsProfilePictureLoading(true);
    startTransition(() => {
      deleteOrganizationProfilePicture(organizationId)
        .then((data) => {
          if (data?.error) {
            toast.error("something went wrong on delete");
          }
          if (data?.success) {
            patchOrganization(organizationId, { profileImageUrl: null });
          }
        })
        .catch(() => toast.error("Something went wrong"))
        .finally(() => {
          setIsProfilePictureLoading(false);
        });
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogTitle className="text-md">Delete organization's profile picture?</AlertDialogTitle>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              handleDelete();
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
