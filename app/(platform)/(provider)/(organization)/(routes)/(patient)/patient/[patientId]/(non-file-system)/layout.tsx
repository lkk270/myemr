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
  params: {
    patientId: string;
  };
  children: React.ReactNode;
}

const PatientLayout = async ({ children, params }: PatientLayoutProps) => {
  const session = await auth();
  const user = session?.user;

  if (!session || !user || user.userType !== "PROVIDER") {
    return redirect("/");
  }

  const patientMember = await prismadb.patientMember.findUnique({
    where: {
      id: params.patientId,
    },
  });

  if (!patientMember) {
    return <SomethingNotFound title="404 No patient found" href="provider-home" />;
  }

  const organizationsMembersOf = await prismadb.organizationMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
  });

  const validProviderAccess = organizationsMembersOf.some(
    (object) => object.organization.id === patientMember.organizationId,
  );

  if (!validProviderAccess) {
    return <SomethingNotFound title="No patient found" href="provider-home" />;
  }

  // const organizationsWithUnreadCount = await Promise.all(
  //   organizationsMembersOf.map(async (orgMember) => {
  //     const unreadCount = await prismadb.organizationActivity.count({
  //       where: {
  //         organizationId: orgMember.organization.id,
  //         read: false,
  //       },
  //     });
  //     return {
  //       ...orgMember,
  //       numOfUnreadActivities: unreadCount,
  //     };
  //   }),
  // );

  const organizations: OrganizationWithRoleType[] = organizationsMembersOf.map((member) => ({
    ...member.organization,
    role: member.role,
    numOfUnreadActivities: 0,
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
      <Navbar
        initialPatientMember={patientMember}
        initialOrganizations={organizations}
        numOfUnreadNotifications={numOfUnreadNotifications}
      />
      <main className="pt-16 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default PatientLayout;
