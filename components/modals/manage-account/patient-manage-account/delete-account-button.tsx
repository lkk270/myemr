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
import { deleteAccount } from "@/lib/actions/delete-account";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { logout } from "@/auth/actions/logout";

interface DeleteAccountButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const DeleteAccountButton = ({ children, asChild }: DeleteAccountButtonProps) => {
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(() => {
      deleteAccount()
        .then((data) => {
          if (data?.error) {
            toast.error("something went wrong on delete");
          }
          if (data?.success) {
            logout();
          }
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogTrigger
        asChild={asChild}
        onClick={() => {
          setOpen(true);
        }}
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col xs:max-w-[500px] overflow-y-scroll max-h-full">
        <AlertDialogTitle className="text-md">Delete account?</AlertDialogTitle>
        <AlertDialogDescription className="flex flex-col gap-y-2">
          <p>
            Are you sure you want to delete your account? By confirming, you will initiate the deletion of your account,
            which will be permanently and irreversibly completed within the next 48 hours. You will receive a
            confirmation email once the deletion process is finalized.
          </p>
          <p>
            Please note, if you sign in while your account is scheduled for deletion, the process will be automatically
            canceled.
          </p>
        </AlertDialogDescription>
        <Label>{`Confirm by typing: "Delete Account"`}</Label>
        <Input placeholder="Delete Account" onChange={(e) => setConfirmation(e.target.value)} />
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setOpen(false);
            }}
            className="w-20 h-8 text-sm"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || confirmation !== "Delete Account"}
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
