import { auth } from "@/auth";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";

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

  return (
    <div className="pt-20 px-4 flex flex-col gap-y-3">
      <div>hello</div>
    </div>
  );
};

export default MembersPage;
