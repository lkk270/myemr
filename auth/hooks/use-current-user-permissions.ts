import { useSession } from "next-auth/react";

export const useCurrentUserPermissions = () => {
  const session = useSession();
  const user = session.data?.user;
  const userRole = user?.role;
  const userType = user?.userType;
  const isPatient = userRole === "ADMIN" && userType === "PATIENT";
  let ret = { canAdd: false, canEdit: false, canDelete: false, showActions: false, isPatient: isPatient };
  if (userRole === "FULL_ACCESS" || userRole === "READ_AND_ADD" || isPatient) {
    ret["canAdd"] = true;
  }
  if (userRole === "FULL_ACCESS" || isPatient) {
    ret["canEdit"] = true;
  }
  if (isPatient) {
    ret["canDelete"] = true;
  }
  ret["showActions"] = ret["canAdd"] || ret["canEdit"] || ret["canDelete"] || isPatient;
  return ret;
};
