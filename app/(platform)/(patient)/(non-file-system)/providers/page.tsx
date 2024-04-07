import { auth } from "@/auth";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { AddOrganizationButton } from "./_components/add-organization-button";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { OrganizationsTable } from "./_components/table/organizations-table";

const Providers = async () => {
  const session = await auth();
  const user = session?.user;
  if (!session || !user) {
    return redirect("/");
  }

  const organizations = await prismadb.patientMember.findMany({
    where: {
      patientUserId: user.id,
    },
    // include: {
    //   organization: {
    //     select: {
    //       profileImageUrl: true,
    //     },
    //   },
    // },
  });
  // console.log(session);
  return (
    <div className="pt-8 px-4 flex flex-col gap-y-3">
      <AddOrganizationButton asChild>
        <Button className="w-[150px] h-10 flex flex-row gap-x-2 border border-primary/5 text-sm" variant="secondary">
          <PackagePlus className="w-5 h-5" />
          <span>Add</span>
        </Button>
      </AddOrganizationButton>
      <OrganizationsTable data={organizations} />
    </div>
  );
};
export default Providers;
