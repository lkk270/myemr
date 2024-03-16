import { OrganizationForm } from "@/app/(platform)/(provider)/_components/forms/organization-form";
import { OrganizationWithRoleType } from "@/app/types";
import { auth } from "@/auth";
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
  console.log(user);
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
    return <div>Something went wrong</div>;
  }

  const organization: OrganizationWithRoleType = {
    ...organizationMemberOf.organization,
    role: organizationMemberOf.role,
  };

  console.log(organization);

  return (
    <div className="pt-20 flex flex-col justify-center items-center">
      <OrganizationForm initialData={organization} />
    </div>
  );
};

export default OrganizationSettingsPage;
