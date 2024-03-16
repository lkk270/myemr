import { Sidebar } from "../_components/sidebar";
import prismadb from "@/lib/prismadb";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OrganizationWithRoleType } from "@/app/types";
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

  const organizations: OrganizationWithRoleType[] = organizationsMembersOf.map((member) => ({
    ...member.organization,
    role: member.role,
  }));

  return (
    <main className="h-screen flex overflow-y-auto">
      <Sidebar initialOrganizations={organizations} />
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
    </main>
  );
};

export default OrganizationLayout;
