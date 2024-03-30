import { Sidebar } from "../../_components/sidebar";
import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OrganizationWithRoleType } from "@/app/types";
import { getNumberOfUnreadNotifications } from "@/lib/data/notifications";
import { ProviderManageAccountModal } from "@/components/modals/manage-account/provider-manage-account/provider-manage-account-modal";

const OrganizationLayout = async ({ children }: { children: React.ReactNode }) => {
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
    <main className="h-screen flex overflow-y-auto">
      <ProviderManageAccountModal />
      <Sidebar initialOrganizations={organizations} numOfUnreadNotifications={numOfUnreadNotifications} />
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
    </main>
  );
};

export default OrganizationLayout;
