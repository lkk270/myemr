import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useOrganizationsStore } from "../../hooks/use-organizations";
import { useOrganizationStore } from "@/app/(platform)/(provider)/(organization)/_components/hooks/use-organizations";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { patientMemberPermissionTypes } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React, { useState, useTransition } from "react";
import { changeRole } from "@/app/(platform)/(provider)/(organization)/actions/organization";
import { ChangeOrganizationRoleSchema } from "../../schemas";
import { z } from "zod";
import { toast } from "sonner";
import { logout } from "@/auth/actions/logout";
import { RemoveOrganizationButton } from "./remove-organization-button";
import { PatientMemberRole } from "@prisma/client";
import { changeOrganizationPermissions } from "../../actions/organizations";

interface PermissionsDropdownProps {
  memberId: string;
}
const PermissionsDropdownComponent = ({ memberId }: PermissionsDropdownProps) => {
  const currentUser = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const { organizations, patchOrganization, getOrganizationById } = useOrganizationsStore();
  // const { getOrganizationById } = useOrganizationStore();
  const organizationMember = getOrganizationById(memberId);
  const { isLoading, setIsLoading } = useIsLoading();

  if (!organizationMember || !currentUser) {
    return null;
  }
  const [permissionType, setPermissionType] = useState(organizationMember.role);
  // console.log(currentUserMember);

  const onRoleChange = (values: z.infer<typeof ChangeOrganizationRoleSchema>) => {
    setPermissionType(values.role);
    setIsLoading(true);
    startTransition(() => {
      // console.log(values);
      changeOrganizationPermissions(values)
        .then((data) => {
          if (!!data.error) {
            setPermissionType(organizationMember.role);
            toast.error(data.error);
            if (data.error === "Unauthorized") {
              logout();
            }
          }
          if (!!data.success) {
            toast.success(data.success);
          }
        })
        .catch((e) => {
          toast.error("Something went wrong");
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  return (
    <div className="flex flex-row gap-x-2 items-center">
      <Select
        onValueChange={(role) => {
          onRoleChange({
            memberId,
            role: role as PatientMemberRole,
          });
        }}
        disabled={isLoading || isPending}
        //   onValueChange={field.onChange}
        value={permissionType}
        defaultValue={organizationMember?.role}
      >
        <SelectTrigger className="text-xs w-[110px] xs:w-[130px] xs:text-sm sm:w-[140px] bg-background hover:bg-[#f0f0f0] dark:hover:bg-[#2b2b2b]">
          <SelectValue defaultValue={organizationMember?.role} placeholder="Organization type" />
        </SelectTrigger>
        <SelectContent>
          {patientMemberPermissionTypes.map((permissionType) => {
            return (
              <SelectItem key={permissionType.value} value={permissionType.value}>
                {permissionType.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <RemoveOrganizationButton
        asChild
        organization={{ memberId, organizationName: organizationMember.organizationName }}
      >
        <Button
          disabled={isLoading}
          className="w-7 h-7 xs:w-10 xs:h-10 text-sm bg-secondary hover:bg-[#fdf0ef] dark:hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
        >
          <Trash2 className="w-3 h-3 xs:w-5 xs:h-5 shrink-0" />
        </Button>
      </RemoveOrganizationButton>
    </div>
  );
};
export const PermissionsDropdown = React.memo(PermissionsDropdownComponent);
