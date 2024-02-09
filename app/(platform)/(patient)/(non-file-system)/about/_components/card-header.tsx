"use client";

import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUploadInsuranceModal } from "../hooks/use-upload-insurance-modal";
import { useIsLoading } from "@/hooks/use-is-loading";
interface CardHeaderComponentProps {
  title: string;
  isEditing: boolean;
  handleSave: () => void;
  handleEditToggle: () => void;
  handleCancel: () => void;
  forInsurance?: boolean;
}

export const CardHeaderComponent = ({
  title,
  isEditing,
  handleSave,
  handleEditToggle,
  handleCancel,
  forInsurance = false,
}: CardHeaderComponentProps) => {
  const { isLoading } = useIsLoading();
  const { onOpen } = useUploadInsuranceModal();
  return (
    <div className="px-8">
      <CardHeader className="px-4  pt-5 pb-3 flex flex-row justify-between items-center bg-transparent text-primary/70 rounded-t-xl">
        <CardTitle className="px-0 text-md sm:text-xl">{title}</CardTitle>
        {forInsurance ? (
          <Button disabled={isLoading} size="sm" onClick={onOpen}>
            Upload
          </Button>
        ) : (
          <div className="flex gap-x-4">
            <Button size="xs" disabled={isLoading} onClick={isEditing ? handleSave : handleEditToggle}>
              {isEditing ? (isLoading ? "Saving..." : "Save") : "Edit"}
            </Button>
            {isEditing && !isLoading && (
              <Button size="xs" variant={"destructive"} disabled={isLoading} onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <Separator orientation="horizontal" className="flex mt-2 w-full" />
    </div>
  );
};
