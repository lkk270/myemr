import { OrganizationMemberType } from "@/app/types";
import { auth } from "@/auth";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { MembersTable } from "./_components/table/members-table";
import { UserPlus } from "lucide-react";
import { InviteMemberButton } from "./_components/invite-member-button";
import { Button } from "@/components/ui/button";
interface MembersPageProps {
  params: {
    organizationId: string;
  };
}

const MembersPage = async ({ params }: MembersPageProps) => {
  const organizationId = params.organizationId;

  const session = await auth();
  const user = session?.user;

  if (!session || !user || user.userType !== "PROVIDER") {
    return redirect("/");
  }

  const organizationMembers: OrganizationMemberType[] = await prismadb.organizationMember.findMany({
    where: {
      organizationId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return (
    <div className="pt-20 px-4 flex flex-col gap-y-3">
      <InviteMemberButton asChild>
        <Button className="w-[150px] h-14 flex flex-row gap-x-2 border border-primary/5" variant="secondary">
          <UserPlus className="w-5 h-5" />
          <span>Add member</span>
        </Button>
      </InviteMemberButton>
      <MembersTable data={organizationMembers} />
    </div>
  );
};

export default MembersPage;
