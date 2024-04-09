"use client";

import { About } from "@/app/(platform)/(patient)/(non-file-system)/about/_components/about-form";
import { PatientDemographicsType } from "@/app/types";
import { PatientMember } from "@prisma/client";
import { usePatientMemberStore } from "../../../../../hooks/use-patient-member-store";
import { useEffect } from "react";

interface AboutProps {
  patientMember: PatientMember;
  initialData: PatientDemographicsType;
}

export const AboutWrapper = ({ initialData, patientMember }: AboutProps) => {
  const { setPatientMember } = usePatientMemberStore();
  
  useEffect(() => {
    setPatientMember(patientMember);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <About initialData={initialData} />;
};
