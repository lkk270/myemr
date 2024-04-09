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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { deleteOrganization } from "../../actions/organization";
import { useOrganizationStore } from "../hooks/use-organizations";

interface DeleteOrganizationButtonProps {
  organizationId: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export const DeleteOrganizationButton = ({ organizationId, children, asChild }: DeleteOrganizationButtonProps) => {
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const { deleteOrganization: deleteOrganizationState } = useOrganizationStore();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(() => {
      deleteOrganization(organizationId)
        .then((data) => {
          if (data?.error) {
            toast.error("something went wrong on delete");
          }
          if (data?.success) {
            deleteOrganizationState(organizationId);
            toast.success("Organization successfully deleted");
            router.push("/provider-home");
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
        <AlertDialogTitle className="text-md">Delete organization?</AlertDialogTitle>
        <AlertDialogDescription className="flex flex-col gap-y-2">
          <p>
            {` Are you sure you want to delete this organization? By confirming, the organization will be be permanently
            and irreversibly deleted immediately. If you'd like to delete your account instead, you can do so in your
            account settings. However, you will first need to make a different member the owner of this organization (if
            is not the case already)`}
            .
          </p>
        </AlertDialogDescription>
        <Label>{`Confirm by typing: "Delete Organization"`}</Label>
        <Input placeholder="Delete Organization" onChange={(e) => setConfirmation(e.target.value)} />
        <AlertDialogFooter>
          <AlertDialogCancel
            className="w-20 h-8 text-sm"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || confirmation !== "Delete Organization"}
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
