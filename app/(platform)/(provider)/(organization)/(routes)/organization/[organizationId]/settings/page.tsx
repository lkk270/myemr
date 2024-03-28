import { OrganizationForm } from "@/app/(platform)/(provider)/(organization)/_components/forms/organization-form";
import { SomethingNotFound } from "@/app/(public-routes)/upload-records/[token]/_components/something-not-found";
import { OrganizationWithRoleType } from "@/app/types";
import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
interface OrganizationSettingsPageProps {
  params: {
    organizationId: string;
  };
}

const OrganizationSettingsPage = async ({ params }: OrganizationSettingsPageProps) => {
  const organizationId = params.organizationId;

  const session = await auth();
  const user = session?.user;

  if (!session || !user || user.userType !== "PROVIDER") {
    return redirect("/");
  }

  const organizationMemberOf = await prismadb.organizationMember.findFirst({
    where: {
      userId: user.id,
      organizationId: organizationId,
    },
    include: {
      organization: {
        include: {
          addresses: true,
        },
      },
    },
  });

  if (!organizationMemberOf) {
    return <SomethingNotFound title="404 No organization found" href="provider-home" />;
  }

  const organization: OrganizationWithRoleType = {
    ...organizationMemberOf.organization,
    role: organizationMemberOf.role,
    numOfUnreadActivities: 0,
  };

  // console.log(organization);

  return (
    <div className="pt-20 flex flex-col justify-center items-center">
      <OrganizationForm initialData={organization} />
    </div>
  );
};

export default OrganizationSettingsPage;
