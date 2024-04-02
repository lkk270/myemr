"use client";

import { PatientMember } from "@prisma/client";
import { useOrganizationStore } from "@/app/(platform)/(provider)/(organization)/_components/hooks/use-organizations";
import { usePatientMemberStore } from "../../../../../hooks/use-patient-member-store";
import { useEffect } from "react";
import { SingleLayerNodesType2 } from "@/app/types/file-types";
import { Sidebar } from "@/app/(platform)/(patient)/(file-system)/_components/sidebar";
import { OrganizationWithRoleType } from "@/app/types";

interface SidebarWrapperProps {
  initialPatientMember: PatientMember;
  initialOrganizations: OrganizationWithRoleType[];
  data: any[];
  singleLayerNodes: SingleLayerNodesType2[];
  sumOfAllSuccessFilesSizes: bigint;
  numOfUnreadNotifications: number;
}

export const SidebarWrapper = ({
  initialOrganizations,
  initialPatientMember,
  data,
  singleLayerNodes,
  sumOfAllSuccessFilesSizes,
  numOfUnreadNotifications,
}: SidebarWrapperProps) => {
  const { setOrganizations } = useOrganizationStore();
  const { setPatientMember } = usePatientMemberStore();

  useEffect(() => {
    setOrganizations(initialOrganizations);
    setPatientMember(initialPatientMember);
  }, []);

  return (
    <Sidebar
      sumOfAllSuccessFilesSizes={sumOfAllSuccessFilesSizes}
      numOfUnreadNotifications={numOfUnreadNotifications}
      data={data}
      singleLayerNodes={singleLayerNodes}
    />
  );
};
