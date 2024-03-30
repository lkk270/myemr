import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useOrganizationMembersStore } from "../../hooks/use-members";
import { useOrganizationStore } from "@/app/(platform)/(provider)/(organization)/_components/hooks/use-organizations";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirstLetter } from "@/lib/utils";
import { organizationMemberPermissionTypes } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React, { useState, useTransition } from "react";
import { changeRole } from "@/app/(platform)/(provider)/(organization)/actions/organization";
import { ChangeOrganizationMemberRoleSchema } from "@/app/(platform)/(provider)/(organization)/schema/organization";
import { z } from "zod";
import { toast } from "sonner";
import { logout } from "@/auth/actions/logout";
import { OrganizationMemberRole } from "@prisma/client";
import { DeleteMemberButton } from "./delete-member-button";
interface PermissionsDropdownProps {
  memberId: string;
}
const PermissionsDropdownComponent = ({ memberId }: PermissionsDropdownProps) => {
  const currentUser = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const { organizationMembers, patchOrganizationMember, getOrganizationMemberById, getOrganizationMemberByUserId } =
    useOrganizationMembersStore();
  // const { getOrganizationById } = useOrganizationStore();
  const organizationMember = getOrganizationMemberById(memberId);
  const { isLoading, setIsLoading } = useIsLoading();

  if (!organizationMember || !currentUser) {
    return null;
  }
  const currentUserMember = getOrganizationMemberByUserId(currentUser.id);
  const [permissionType, setPermissionType] = useState(organizationMember.role);
  // console.log(currentUserMember);
  if (currentUser.id === organizationMember.user.id) {
    return (
      <Badge
        variant="secondary"
        className="text-black text-sm border-none rounded-sm w-28 h-7 justify-center font-semibold bg-gradient-to-r from-violet-400 to-[#4f5eff]"
      >
        Me - {capitalizeFirstLetter(organizationMember.role)}
      </Badge>
    );
  }

  const onRoleChange = (values: z.infer<typeof ChangeOrganizationMemberRoleSchema>) => {
    setPermissionType(values.role);
    setIsLoading(true);
    startTransition(() => {
      // console.log(values);
      changeRole(values)
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
          console.log(e);
          toast.error("Something went wrong");
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  const hasEditPermissions =
    !!currentUserMember && (currentUserMember.role === "ADMIN" || currentUserMember.role === "OWNER");
  return (
    <div className="flex flex-row gap-x-2 items-center">
      <Select
        onValueChange={(role) => {
          console.log(role);
          onRoleChange({
            organizationId: organizationMember.organizationId,
            memberId,
            role: role as OrganizationMemberRole,
          });
        }}
        disabled={isLoading || isPending || !hasEditPermissions || organizationMember?.role === "OWNER"}
        //   onValueChange={field.onChange}
        value={permissionType}
        defaultValue={organizationMember?.role}
      >
        <SelectTrigger className="w-[110px] bg-background hover:bg-[#f0f0f0] dark:hover:bg-[#2b2b2b]">
          <SelectValue defaultValue={organizationMember?.role} placeholder="Organization type" />
        </SelectTrigger>
        <SelectContent>
          {organizationMemberPermissionTypes.map((permissionType) => {
            if (
              permissionType.value !== "OWNER" ||
              currentUserMember?.role === "OWNER" ||
              organizationMember?.role === "OWNER"
            ) {
              return (
                <SelectItem key={permissionType.value} value={permissionType.value}>
                  {permissionType.label}
                </SelectItem>
              );
            }
          })}
        </SelectContent>
      </Select>
      {hasEditPermissions && organizationMember?.role !== "OWNER" && (
        <DeleteMemberButton
          asChild
          member={{ id: memberId, email: organizationMember.email, organizationId: organizationMember.organizationId }}
        >
          <Button
            disabled={isLoading}
            className="w-10 h-10 text-sm bg-secondary hover:bg-[#fdf0ef] dark:hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
          >
            <Trash2 className="w-5 h-5 shrink-0" />
          </Button>
        </DeleteMemberButton>
      )}
    </div>
  );
};
export const PermissionsDropdown = React.memo(PermissionsDropdownComponent);
