"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogOverlay, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";
import { MedicationForm } from "../edit-medication-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { truncateSync } from "fs";
// import { DialogOverlay } from "@radix-ui/react-dialog";

export const ViewMedicationModal = () => {
  const viewMedicationModal = useViewMedicationModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !viewMedicationModal.medication) {
    return null;
  }
  return (
    <Dialog open={viewMedicationModal.isOpen} onOpenChange={viewMedicationModal.onClose}>
      <DialogContent className="overflow-y-scroll h-5/6 max-w-[850px] w-full xs:h-[75%] max-h-[550px]">
        <MedicationForm medicationParam={viewMedicationModal.medication} />
      </DialogContent>
    </Dialog>
  );
};
