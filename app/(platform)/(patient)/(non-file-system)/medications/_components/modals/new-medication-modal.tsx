"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNewMedicationModal } from "../hooks/use-new-medication-modal";
import { NewMedicationForm } from "../new-medication-form";

export const NewMedicationModal = () => {
  const newMedicationModal = useNewMedicationModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={newMedicationModal.isOpen} onOpenChange={newMedicationModal.onClose}>
      <DialogContent className="overflow-y-scroll h-5/6 xs:h-3/5 max-w-[850px] w-full">
        <DialogTitle className="text-center text-[#414cc6]">New Medication</DialogTitle>
        <NewMedicationForm />
      </DialogContent>
    </Dialog>
  );
};
