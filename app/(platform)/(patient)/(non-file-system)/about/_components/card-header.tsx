"use client";

import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUploadInsuranceModal } from "../hooks/use-upload-insurance-modal";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { useTransition } from "react";

interface CardHeaderComponentProps {
  title: string;
  isEditing: boolean;
  children?: React.ReactNode;
  handleEditToggle: () => void;
  handleCancel: () => void;
  forInsurance?: boolean;
}

export const CardHeaderComponent = ({
  title,
  isEditing,
  children,
  handleEditToggle,
  handleCancel,
  forInsurance = false,
}: CardHeaderComponentProps) => {
  const currentUserPermissions = useCurrentUserPermissions();
  const { isLoading } = useIsLoading();
  const [isPending] = useTransition();
  const { onOpen } = useUploadInsuranceModal();

  return (
    <div>
      <CardHeader className="px-4  pt-5 pb-3 flex flex-row justify-between items-center bg-transparent text-primary/70 rounded-t-xl">
        <CardTitle className="px-0 text-md sm:text-xl">{title}</CardTitle>
        {currentUserPermissions.isPatient && (
          <>
            {forInsurance ? (
              <Button disabled={isLoading} size="sm" onClick={onOpen}>
                Upload
              </Button>
            ) : (
              currentUserPermissions.isPatient && (
                <div className="flex gap-x-4">
                  {!isEditing && (
                    <Button variant="outline" size="sm" className="h-8" disabled={isLoading} onClick={handleEditToggle}>
                      Edit
                    </Button>
                  )}
                  {currentUserPermissions.isPatient && isEditing && (
                    <>
                      {children}
                      <Button size="xs" variant={"destructive"} disabled={isLoading} onClick={handleCancel}>
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              )
            )}
          </>
        )}
      </CardHeader>
      <Separator orientation="horizontal" className="flex mt-2 w-full" />
    </div>
  );
};
