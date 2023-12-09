"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNewMedicationModal } from "../hooks/use-new-medication-modal";

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
      <DialogContent className="overflow-y-scroll h-4/7">
        <div className="text-left text-md text-primary/50 gap-y-3">
          <DialogTitle className="text-center text-sky-500">Some News</DialogTitle>
          <div className="justify-center mt-6">
            <p>Hello</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
