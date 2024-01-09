import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "../../_components/sidebar";

import prismadb from "@/lib/prismadb";

const FileSystem = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;

  const patientFiles = await prismadb.patientProfile.findUnique({
    where: {
      userId: user?.id,
    },
    select: {
      folders: {
        include: {
          files: true,
          children: true,
        },
      },
      symmetricKey: true,
    },
  });

  console.log(patientFiles);
  if (!patientFiles) {
    return <div>something went wrong</div>;
  }

  return <Sidebar data={patientFiles.folders} />;
};

export default FileSystem;
