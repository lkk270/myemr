import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "../../_components/sidebar";

import prismadb from "@/lib/prismadb";
import { Folder } from "@prisma/client";
interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
}

async function fetchAllFoldersForPatient(patientProfileId: string, parentId = null) {
  // Fetch folders and their files
  const folders = (await prismadb.folder.findMany({
    where: {
      AND: [{ patientProfileId: patientProfileId }, { parentId: parentId }],
    },
    include: {
      files: true,
    },
  })) as any[];

  for (const folder of folders) {
    // Recursively fetch subfolders
    const subFolders = await fetchAllFoldersForPatient(patientProfileId, folder.id);

    // Combine files and subfolders into the children array
    folder.children = [...folder.files, ...subFolders];

    // Optionally, remove the original files array if you want all children in one array
    delete folder.files;
  }

  return folders;
}

const FileSystem = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;

  const allFolders = await fetchAllFoldersForPatient("clqy00gdg000q60yoc8kuxpf2", null);

  console.log(allFolders);
  if (!allFolders) {
    return <div>something went wrong</div>;
  }

  return <Sidebar data={allFolders} />;
};

export default FileSystem;
