"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import { Ban } from "lucide-react";
import { PatientProfileAccessCode, RequestRecordsCode, UserRole } from "@prisma/client";
import { getActiveCodes } from "../data/get-active-codes";
import { invalidateActiveCode } from "../actions/invalidate-code";
import { accessCodeType, genericPatientAccessCodeType } from "@/app/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMediaQuery } from "usehooks-ts";
import { accessTypesText } from "@/lib/constants";

interface InvalidateCodeButtonProps {
  codeId: string;
  children: React.ReactNode;
  asChild?: boolean;
  codeType: "patientProfileAccessCode" | "requestRecordsCode";
  onInvalidate: (codeId: string, codeType: accessCodeType) => void;
}

export const InvalidateCodeButton = ({
  onInvalidate,
  codeId,
  children,
  asChild,
  codeType,
}: InvalidateCodeButtonProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>{children}</AlertDialogTrigger>
      <AlertDialogContent className="flex flex-col xs:max-w-[400px]">
        <AlertDialogTitle className="text-md">Invalidate this code?</AlertDialogTitle>
        <AlertDialogDescription className="text-sm">
          By clicking "Invalidate", this code will be invalidated and any active access sessions revoked. This action
          cannot be undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-20 h-8 text-sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onInvalidate(codeId, codeType);
            }}
            className="w-20 h-8 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            Invalidate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
