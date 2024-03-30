import { DownloadModal } from "../../(patient)/(file-system)/_components/file-tree/_components/modals/download-modal";
import { RenameModal } from "../../(patient)/(file-system)/_components/file-tree/_components/modals/rename-modal";
import { MoveModal } from "../../(patient)/(file-system)/_components/file-tree/_components/modals/move-modal";
import { AddFolderModal } from "../../(patient)/(file-system)/_components/file-tree/_components/modals/add-folder-modal";
import { UploadFilesModal } from "../../(patient)/(file-system)/_components/file-tree/_components/modals/upload-files-modal";
import { Sidebar } from "../../(patient)/(file-system)/_components/sidebar";

import { SearchCommand } from "@/app/(platform)/(patient)/(file-system)/_components/modals/search-command";
import { NewRootFolder } from "../../(patient)/(file-system)/_components/modals/new-root-folder-modal";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { sortFolderChildren, sortRootNodes, extractNodes, addLastViewedAtAndSort } from "@/lib/utils";
import { fetchAllFoldersForPatient } from "@/lib/actions/files";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;

  console.log(user);

  const allFolders = await fetchAllFoldersForPatient(null, user.id, user.accessibleRootFolders);
  const sortedFoldersTemp = allFolders.map((folder) => sortFolderChildren(folder));
  const sortedFolders = sortRootNodes(sortedFoldersTemp);
  const patient = await prismadb.patientProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!sortedFolders || !patient) {
    return <div>something went wrong</div>;
  }

  let rawAllNodes = extractNodes(allFolders);
  const allNodesMap = new Map(rawAllNodes.map((node) => [node.id, { ...node, children: undefined }]));
  const allNodesArray = Array.from(allNodesMap.values());
  const singleLayerNodes = addLastViewedAtAndSort(allNodesArray);
  console.log(singleLayerNodes);
  const sumOfAllSuccessFilesSizes = singleLayerNodes.reduce((accumulator, file) => {
    if (!!file.size && file.isFile === true) {
      return accumulator + file.size;
    }
    return accumulator;
  }, 0n);
  // const allotedStorageInGb = allotedStoragesInGb[user.plan];
  return (
    <main className="h-screen flex overflow-y-auto">
      <Sidebar
        sumOfAllSuccessFilesSizes={sumOfAllSuccessFilesSizes}
        // allotedStorageInGb={allotedStorageInGb}
        data={sortedFolders}
        singleLayerNodes={singleLayerNodes}
      />
      <DownloadModal />
      <RenameModal />
      <MoveModal />
      <AddFolderModal />
      <UploadFilesModal />
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
      <div className="flex h-screen pt-16">
        <SearchCommand />
        <NewRootFolder />
      </div>
    </main>
  );
};

export default MainLayout;
