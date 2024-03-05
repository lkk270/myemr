"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import { Ban } from "lucide-react";
import { PatientProfileAccessCode, RequestRecordsCode, UserRole } from "@prisma/client";
import { getActiveCodes } from "../data/get-active-codes";
import { invalidateActiveCode } from "../actions/invalidate-code";
import { genericPatientAccessCodeType, accessCodeType } from "@/app/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMediaQuery } from "usehooks-ts";
import { accessTypesText } from "@/lib/constants";
import { InvalidateCodeButton } from "./invalidate-code-button";
import { cn, getTimeUntil } from "@/lib/utils";
import { useIsLoading } from "@/hooks/use-is-loading";
import { Spinner } from "@/components/spinner";

interface ViewActiveCodesButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
  codeType: accessCodeType;
}

export const ViewActiveCodesButton = ({ children, asChild, codeType }: ViewActiveCodesButtonProps) => {
  const { isLoading, setIsLoading } = useIsLoading();
  const [loadingCodeId, setLoadingCodeId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 550px)");
  const [activeCodes, setActiveCodes] = useState<genericPatientAccessCodeType[] | null>([]);
  const [isPending, startTransition] = useTransition();
  const openDialog = () => {
    startTransition(() => {
      getActiveCodes(codeType)
        .then((data) => {
          setActiveCodes(data);
          if (!data) {
            toast.error("something went wrong");
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error("something went wrong");
        });
    });
  };

  const setCodeIsValidToFalse = (codeId: string, codeType: accessCodeType) => {
    setActiveCodes((prevActiveCodes) => {
      if (prevActiveCodes === null) {
        return null;
      }
      return prevActiveCodes.map((code) => (code.id === codeId ? { ...code, isValid: false } : code));
    });
  };

  const onInvalidateCode = (codeId: string, codeType: accessCodeType) => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadingCodeId(codeId);
    invalidateActiveCode(codeId, codeType)
      .then((data) => {
        setIsLoading(false);
        if (data.success) {
          setCodeIsValidToFalse(codeId, codeType);
          toast.success("Code successfully invalidated");
        } else {
          toast.error("something went wrong");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
        toast.error("something went wrong");
      });
  };

  return (
    <Dialog>
      <DialogTrigger onClick={openDialog} asChild={asChild}>
        {children}
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-[calc(100vh-200px)] max-w-[850px] w-full">
        <DialogTitle className="text-md">
          Active codes
          <span className="font-normal ml-2">
            {(() => {
              if (!activeCodes) return;

              const activeCodesLocal = activeCodes.filter((obj) => {
                return obj.isValid;
              });
              if (activeCodesLocal && !isPending && activeCodesLocal.length > 0) {
                return (
                  <span>
                    Total: {activeCodesLocal.length} active {activeCodesLocal.length === 1 ? "code" : "codes"}
                  </span>
                );
              }
            })()}
          </span>
        </DialogTitle>

        {isPending ? (
          <div className="flex flex-col items-center justify-center">
            <BeatLoader color="#4b59f0" />
          </div>
        ) : !activeCodes || activeCodes.length === 0 ? (
          <div>🫀No active codes🫀</div>
        ) : activeCodes[0].providerEmail ? (
          <Table className="text-xs sm:text-sm">
            <TableHeader>
              <TableRow className="border-b border-primary/10">
                <TableHead>Provider Email</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeCodes.map((code, i) => {
                return (
                  <TableRow key={i} className={cn(!code.isValid && "text-amber-500")}>
                    <TableCell className="flex flex-row items-center gap-x-2">
                      {code.isValid && code.id !== loadingCodeId && !isLoading && (
                        <InvalidateCodeButton codeId={code.id} codeType={codeType} onInvalidate={onInvalidateCode}>
                          <div role="button" title="Invalidate Code">
                            <Ban className="w-3 h-3 text-amber-500 hover:text-amber-600" />
                          </div>
                        </InvalidateCodeButton>
                      )}
                      {isLoading && loadingCodeId === code.id && <Spinner size="sm" loaderType={"loader2"} />}

                      {code.providerEmail}
                    </TableCell>
                    <TableCell>
                      {"< "}
                      {getTimeUntil(code.expires)}
                    </TableCell>
                    <TableCell>{code.createdAt.toISOString().split("T")[0]}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Table className="text-xs sm:text-sm">
            <TableHeader>
              <TableRow className="border-b border-primary/10">
                <TableHead>Code</TableHead>
                <TableHead>Access Type</TableHead>
                <TableHead>Expires</TableHead>
                {!isMobile && <TableHead>Created</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeCodes.map((code, i) => {
                return (
                  <TableRow key={i} className={cn(!code.isValid && "text-amber-500")}>
                    <TableCell className="flex flex-row items-center gap-x-2">
                      {code.isValid && code.id !== loadingCodeId && !isLoading && (
                        <InvalidateCodeButton codeId={code.id} codeType={codeType} onInvalidate={onInvalidateCode}>
                          <div role="button" title="Invalidate Code">
                            <Ban className="w-3 h-3 text-amber-500 hover:text-amber-600" />
                          </div>
                        </InvalidateCodeButton>
                      )}
                      {isLoading && loadingCodeId === code.id && <Spinner size="sm" loaderType={"loader2"} />}
                      {code.token}
                    </TableCell>

                    <TableCell>
                      {accessTypesText.find((obj) => obj.value === code.accessType)?.label ?? "oh oh"}
                    </TableCell>
                    <TableCell>
                      {"< "}
                      {getTimeUntil(code.expires)}
                    </TableCell>
                    {!isMobile && <TableCell>{code.createdAt.toISOString().split("T")[0]}</TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};
