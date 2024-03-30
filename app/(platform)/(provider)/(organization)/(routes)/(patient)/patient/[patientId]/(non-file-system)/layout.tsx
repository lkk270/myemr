import { Sidebar } from "../../../../../_components/sidebar";
import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OrganizationWithRoleType } from "@/app/types";
import { getNumberOfUnreadNotifications } from "@/lib/data/notifications";
import { ProviderManageAccountModal } from "@/components/modals/manage-account/provider-manage-account/provider-manage-account-modal";
import { SomethingNotFound } from "@/app/(public-routes)/upload-records/[token]/_components/something-not-found";
import { getOrganizationMemberByUserIdBase } from "../../../../../data/organization";
import { Navbar } from "../../../_components/navbar";
interface PatientLayoutProps {
  children: React.ReactNode;
}

const PatientLayout = async ({ children }: PatientLayoutProps) => {
  const session = await auth();
  const user = session?.user;

  if (!session || !user || user.userType !== "PROVIDER") {
    return redirect("/");
  }

  const organizationsMembersOf = await prismadb.organizationMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
  });

  const organizationsWithUnreadCount = await Promise.all(
    organizationsMembersOf.map(async (orgMember) => {
      const unreadCount = await prismadb.organizationActivity.count({
        where: {
          organizationId: orgMember.organization.id,
          read: false,
        },
      });
      return {
        ...orgMember,
        numOfUnreadActivities: unreadCount,
      };
    }),
  );

  const organizations: OrganizationWithRoleType[] = organizationsWithUnreadCount.map((member) => ({
    ...member.organization,
    role: member.role,
    numOfUnreadActivities: member.numOfUnreadActivities,
  }));

  let numOfUnreadNotifications = 0;
  try {
    numOfUnreadNotifications = await getNumberOfUnreadNotifications();
  } catch {
    numOfUnreadNotifications = 0;
  }

  // console.log(organizations);
  return (
    <div className="flex overflow-auto h-screen">
      <ProviderManageAccountModal />
      <Navbar initialOrganizations={organizations} numOfUnreadNotifications={numOfUnreadNotifications} />
      <main className="pt-16 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default PatientLayout;
