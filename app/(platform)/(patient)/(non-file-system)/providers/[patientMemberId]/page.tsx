import { ViewOrganization } from "@/app/(platform)/(provider)/(organization)/_components/view-organization";
import { SomethingNotFound } from "@/app/(public-routes)/upload-records/[token]/_components/something-not-found";
import { OrganizationWithRoleType } from "@/app/types";
import { auth } from "@/auth";
import prismadb from "@/lib/prismadb";
import { OrganizationMemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
interface OrganizationSettingsPageProps {
  params: {
    patientMemberId: string;
  };
}

const OrganizationSettingsPage = async ({ params }: OrganizationSettingsPageProps) => {
  const patientMemberId = params.patientMemberId;

  const session = await auth();
  const user = session?.user;

  if (!session || !user) {
    return redirect("/");
  }

  const patientMember = await prismadb.patientMember.findUnique({
    where: {
      id: patientMemberId,
    },
  });

  if (!patientMember) {
    return <SomethingNotFound title="404 No organization found" href="provider-home" />;
  }

  const organization = await prismadb.organization.findUnique({
    where: {
      id: patientMember.organizationId,
    },
    include: {
      addresses: true,
    },
  });
  if (!organization) {
    return <SomethingNotFound title="404 No organization found" href="provider-home" />;
  }

  const adjustedOrganization: OrganizationWithRoleType = {
    ...organization,
    role: OrganizationMemberRole.USER,
    numOfUnreadActivities: 0,
  };

  // console.log(organization);

  return (
    <div className="pt-8 flex flex-col justify-center items-center">
      <ViewOrganization initialData={adjustedOrganization} />
    </div>
  );
};

export default OrganizationSettingsPage;
