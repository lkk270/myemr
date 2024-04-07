"use client";

import { PatientMember } from "@prisma/client";
import { usePatientMemberStore } from "../../../../../hooks/use-patient-member-store";
import { CustomDataTable } from "@/app/(platform)/(patient)/(non-file-system)/medications/_components/table/custom-data-table";
import { useEffect } from "react";
import { MedicationType } from "@/app/types";

interface MedicationsWrapperProps {
  patientMember: PatientMember;
  initialData: MedicationType[];
}

export const MedicationsWrapper = ({ initialData, patientMember }: MedicationsWrapperProps) => {
  const { setPatientMember } = usePatientMemberStore();
  useEffect(() => {
    setPatientMember(patientMember);
  }, []);

  return <CustomDataTable data={initialData} />;
};
