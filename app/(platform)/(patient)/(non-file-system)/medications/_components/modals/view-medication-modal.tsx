"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useViewMedicationModal } from "../hooks/use-view-medication-modal";

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
      <DialogContent className="overflow-y-scroll h-4/7">
        <div className="text-left text-md text-primary/50 gap-y-3">
          <DialogTitle className="text-center text-sky-500">Some News</DialogTitle>
          <div className="justify-center mt-6">
            <p>Hello VIEW MEDICATION</p>
            <p>{viewMedicationModal.medication?.name}</p>
            <p>EDIT: {viewMedicationModal.isEdit.toString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
