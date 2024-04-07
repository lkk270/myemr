import { currentUserPermissionsType } from "@/app/types";
import { ExtendedUser } from "@/next-auth";
import { PatientMember, PatientMemberRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { usePatientMemberStore } from "@/app/(platform)/(provider)/(organization)/(routes)/(patient)/hooks/use-patient-member-store";

export const useCurrentUserPermissions = () => {
  const session = useSession();
  const user = session.data?.user;
  const { patientMember } = usePatientMemberStore();
  const effectiveUser = !!user && !!patientMember ? { ...user, role: patientMember.role } : user;
  return extractCurrentUserPermissions(effectiveUser);
};

export const extractCurrentUserPermissions = (user: ExtendedUser | undefined | null): currentUserPermissionsType => {
  const userRole = user?.role;
  const userType = user?.userType;
  const isPatient = userRole === "ADMIN" && userType === "PATIENT";
  const isProvider = userType === "PROVIDER";
  let ret = {
    canRead: false,
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canUploadFiles: false,
    showActions: false,
    isPatient: isPatient,
    isProvider: isProvider,
    hasAccount: isPatient || isProvider,
  };
  if (userRole === "FULL_ACCESS" || userRole === "READ_AND_ADD" || isPatient) {
    ret["canAdd"] = true;
    ret["canUploadFiles"] = true;
  }
  if (userRole === "FULL_ACCESS" || isPatient) {
    ret["canEdit"] = true;
    ret["canUploadFiles"] = true;
  }
  if (userRole === "UPLOAD_FILES_ONLY") {
    ret["canUploadFiles"] = true;
  }
  if (isPatient) {
    ret["canDelete"] = true;
  }
  if (userRole === "FULL_ACCESS" || userRole === "READ_AND_ADD" || userRole === "READ_ONLY" || isPatient) {
    ret["canRead"] = true;
  }
  ret["showActions"] = ret["canRead"] || ret["canAdd"] || ret["canEdit"] || ret["canDelete"] || isPatient;
  return ret;
};
