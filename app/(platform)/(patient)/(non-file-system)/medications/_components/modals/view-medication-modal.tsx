"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";
import { MedicationForm } from "../medication-form";

export const ViewMedicationModal = () => {
  const viewMedicationModal = useViewMedicationModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <Dialog open={viewMedicationModal.isOpen} onOpenChange={viewMedicationModal.onClose}>
      <DialogContent className="overflow-y-scroll h-4/7 max-w-[720px] w-full">
        {/* <DialogTitle className="text-center text-sky-500">Some News</DialogTitle> */}
        <MedicationForm medicationParam={viewMedicationModal.medication} />
      </DialogContent>
    </Dialog>
  );
};
