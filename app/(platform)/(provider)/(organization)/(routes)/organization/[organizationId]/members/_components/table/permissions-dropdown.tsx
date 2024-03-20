import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useOrganizationMembersStore } from "../../hooks/use-members";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirstLetter } from "@/lib/utils";
import { organizationMemberPermissionTypes } from "@/lib/constants";

export const PermissionsDropdown = ({ memberId }: { memberId: string }) => {
  const currentUser = useCurrentUser();
  const { organizationMembers, patchOrganizationMember, getOrganizationMemberById } = useOrganizationMembersStore();
  const organizationMember = getOrganizationMemberById(memberId);
  const { isLoading, setIsLoading } = useIsLoading();

  if (!organizationMember || !currentUser) {
    return null;
  }
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
  return (
    <Select
      disabled={isLoading}
      //   onValueChange={field.onChange}
      //   value={field.value}
      defaultValue={organizationMember?.role}
    >
      <SelectTrigger className="max-w-[33vw] bg-background hover:bg-[#f0f0f0] dark:hover:bg-[#2b2b2b]">
        <SelectValue defaultValue={organizationMember?.role} placeholder="Organization type" />
      </SelectTrigger>
      <SelectContent>
        {organizationMemberPermissionTypes.map((permissionType) => (
          <SelectItem key={permissionType.value} value={permissionType.value}>
            {permissionType.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
