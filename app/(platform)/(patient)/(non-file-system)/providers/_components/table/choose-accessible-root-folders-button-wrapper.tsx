import { useOrganizationsStore } from "../../hooks/use-organizations";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { ChooseAccessibleRootFoldersButton } from "../../../patient-home/_components/chose-accessible-root-folders-button";

interface ChooseAccessibleRootFoldersButtonWrapperComponentProps {
  patientMemberId: string;
}
const ChooseAccessibleRootFoldersButtonWrapperComponent = ({
  patientMemberId,
}: ChooseAccessibleRootFoldersButtonWrapperComponentProps) => {
  const { patchOrganization, getOrganizationById } = useOrganizationsStore();
  const currentOrganization = getOrganizationById(patientMemberId);
  // const [accessibleRootFolders, setAccessibleRootFolders] = useState(currentOrganization?.accessibleRootFolders);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !currentOrganization) {
    return null;
  }
  const numOfRootFolders = currentOrganization.accessibleRootFolders.split(",").length;
  const foldersText = numOfRootFolders === 1 ? "Folder" : "Folders";
  const crfButtonLabel =
    currentOrganization.accessibleRootFolders === "ALL_EXTERNAL"
      ? "All Root Folders"
      : `${numOfRootFolders.toString()} Root ${foldersText}`;

  const handleAccessibleRootFoldersChange = (accessibleRootFolders: string) => {
    patchOrganization(patientMemberId, { accessibleRootFolders: accessibleRootFolders });
    // setAccessibleRootFolders(accessibleRootFolders);
    // setValue("accessibleRootFolderIds", accessibleRootFolderIds);
  };
  return (
    <div className="flex flex-row gap-x-2">
      <ChooseAccessibleRootFoldersButton
        patientMemberId={patientMemberId}
        initialDefaultRootFolders={currentOrganization.accessibleRootFolders}
        initialCsrfButtonLabel={crfButtonLabel}
        asChild
        handleAccessibleRootFoldersChange={handleAccessibleRootFoldersChange}
      >
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          variant={"outline"}
          className="text-xs lg:text-sm w-[130px] lg:w-[140px]"
        >
          {crfButtonLabel}
        </Button>
      </ChooseAccessibleRootFoldersButton>
    </div>
  );
};

export const ChooseAccessibleRootFoldersButtonWrapper = React.memo(ChooseAccessibleRootFoldersButtonWrapperComponent);
