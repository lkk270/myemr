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
import { deleteProfilePicture } from "@/lib/actions/delete-profile-picture";
import { useCurrentUser } from "@/auth/hooks/use-current-user";

interface DeleteProfilePictureButtonProps {
  setIsProfilePictureLoading: (value: boolean) => void;
  children: React.ReactNode;
  asChild?: boolean;
}

export const DeleteProfilePictureButton = ({
  setIsProfilePictureLoading,
  children,
  asChild,
}: DeleteProfilePictureButtonProps) => {
  const { update } = useSession();
  const user = useCurrentUser();
  // console.log(user);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setIsProfilePictureLoading(true);
    startTransition(() => {
      deleteProfilePicture()
        .then((data) => {
          if (data?.error) {
            toast.error("something went wrong on delete");
          }
          if (data?.success) {
            update(); // This should now trigger the useEffect in useCurrentUser
          }
        })
        .catch(() => {
          toast.error("Something went wrong");
        })
        .finally(() => {
          setIsProfilePictureLoading(false);
        });
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogTitle className="text-md">Delete profile picture?</AlertDialogTitle>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              handleDelete();
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
