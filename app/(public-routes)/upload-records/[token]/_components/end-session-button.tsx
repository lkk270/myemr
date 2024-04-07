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
import { invalidateCodeById } from "../actions/code";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useIsLoading } from "@/hooks/use-is-loading";
interface EndSessionButtonProps {
  codeId: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export const EndSessionButton = ({ codeId, children, asChild }: EndSessionButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const { isLoading } = useIsLoading();
  const router = useRouter();

  const onInvalidateClick = () => {
    startTransition(() => {
      invalidateCodeById(codeId)
        .then((data) => {
          if (data?.success) {
            router.refresh();
          } else {
            toast.error("something went wrong");
          }
        })
        .catch((error) => {
          toast.error("something went wrong");
        });
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogTitle className="text-md">Invalidate this code?</AlertDialogTitle>
        <AlertDialogDescription className="text-sm">
          By clicking 'Complete', you confirm that you have uploaded all patient records in your possession. Once this
          button is pressed, you will not be able to upload additional records unless you receive a new request from the
          patient
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending || isLoading}
            onClick={onInvalidateClick}
            className="w-20 h-8 text-sm bg-secondary hover:bg-[#fdf0ef] dark:hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            Complete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
