import { ExtendedUser } from "@/next-auth";
import { useSession } from "next-auth/react";

export const useCurrentUserPermissions = () => {
  const session = useSession();
  const user = session.data?.user;
  return extractCurrentUserPermissions(user);
};

export const extractCurrentUserPermissions = (user: ExtendedUser | undefined) => {
  const userRole = user?.role;
  const userType = user?.userType;
  const isPatient = userRole === "ADMIN" && userType === "PATIENT";
  const isProvider = userType === "PROVIDER";
  let ret = {
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canUploadFiles: false,
    showActions: false,
    isPatient: isPatient,
    isProvider: isProvider,
    hasAccount: userRole === "ADMIN" || userRole === "USER",
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
  ret["showActions"] = ret["canAdd"] || ret["canEdit"] || ret["canDelete"] || isPatient;
  return ret;
};
