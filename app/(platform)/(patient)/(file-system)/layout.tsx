import { DeleteModal } from "./_components/file-tree/_components/modals/delete-node-modal";
import { DownloadModal } from "./_components/file-tree/_components/modals/download-modal";
import { RenameModal } from "./_components/file-tree/_components/modals/rename-modal";
import { MoveModal } from "./_components/file-tree/_components/modals/move-modal";
import { TrashModal } from "./_components/file-tree/_components/modals/trash-node-modal";
import { AddFolderModal } from "./_components/file-tree/_components/modals/add-folder-modal";
import { UploadFilesModal } from "./_components/file-tree/_components/modals/upload-files-modal";
import { Sidebar } from "./_components/sidebar";

import { SearchCommand } from "@/app/(platform)/(patient)/(file-system)/_components/modals/search-command";
import { NewRootFolder } from "./_components/modals/new-root-folder-modal";

// import { useUser } from "@clerk/nextjs";
// import { auth, redirectToSignIn } from "@clerk/nextjs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SingleLayerNodesType2 } from "@/app/types/file-types";
import prismadb from "@/lib/prismadb";
import { sortFolderChildren, sortRootNodes, extractNodes, addLastViewedAtAndSort } from "@/lib/utils";
import { allotedPatientStorage } from "@/lib/constants";
import { FileUploadStatus, PatientPlan } from "@prisma/client";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;

  async function fetchAllFoldersForPatient(parentId = null) {
    // Fetch folders and their files
    const folders = (await prismadb.folder.findMany({
      where: {
        AND: [{ userId: user.id }, { parentId: parentId }],
      },
      include: {
        files: {
          where: {
            status: FileUploadStatus.SUCCESS,
          },
          include: {
            recordViewActivity: {
              where: {
                userId: user.id,
              },
              select: {
                lastViewedAt: true,
              },
            },
          },
        },
        recordViewActivity: {
          where: {
            userId: user.id,
          },
          select: {
            lastViewedAt: true,
          },
        },
      },
    })) as any[];

    for (const folder of folders) {
      // Recursively fetch subfolders
      const subFolders = await fetchAllFoldersForPatient(folder.id);

      // Combine files and subfolders into the children array
      folder.children = [...folder.files, ...subFolders];

      // Optionally, remove the original files array if you want all children in one array
      delete folder.files;
    }

    return folders;
  }

  function flattenStructure(data: any[]) {
    let result: any[] = [];

    function flattenItem(item: any) {
      // Add the current item to the result
      result.push({
        id: item.id,
        path: item.path,
        namePath: item.namePath,
        name: item.name,
        isFile: item.isFile,
      });

      // If the item has children, flatten each child
      if (item.children && item.children.length) {
        item.children.forEach((child: any) => flattenItem(child));
      }
    }

    flattenItem(data); // start with the root item
    return result;
  }

  const allFolders = await fetchAllFoldersForPatient(null);
  const sortedFoldersTemp = allFolders.map((folder) => sortFolderChildren(folder));
  const sortedFolders = sortRootNodes(sortedFoldersTemp);
  const patient = await prismadb.patientProfile.findUnique({
    where: { userId: user.id },
    select: { usedFileStorage: true, plan: true },
  });

  // const singleLayerFolders = await prismadb.folder.findMany({
  //   where: {
  //     userId: user.id,
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     path: true,
  //     parentId: true,
  //     namePath: true,
  //     isFile: true,
  //     recordViewActivity: {
  //       where: {
  //         userId: user.id,
  //       },
  //       select: {
  //         lastViewedAt: true,
  //       },
  //     },
  //   },
  // });

  // const singleLayerFiles = await prismadb.file.findMany({
  //   where: {
  //     userId: user.id,
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     parentId: true,
  //     path: true,
  //     namePath: true,
  //     isFile: true,
  //     recordViewActivity: {
  //       where: {
  //         userId: user.id,
  //       },
  //       select: {
  //         lastViewedAt: true,
  //       },
  //     },
  //   },
  // });
  let rawAllNodes = extractNodes(allFolders);
  const allNodesMap = new Map(rawAllNodes.map((node) => [node.id, { ...node, children: undefined }]));
  const allNodesArray = Array.from(allNodesMap.values());

  // const singleLayerNodes = addLastViewedAtAndSort(singleLayerFolders.concat(singleLayerFiles));
  // const singleLayerNodesOld = addLastViewedAtAndSort(singleLayerFolders.concat(singleLayerFiles));
  // console.log(singleLayerNodesOld);
  const singleLayerNodes = addLastViewedAtAndSort(allNodesArray);
  // console.log(singleLayerNodes);
  const trashExists = singleLayerNodes.some((obj: SingleLayerNodesType2) => obj.namePath === "/Trash");
  if (singleLayerNodes && !trashExists && singleLayerNodes.length > 0) {
    const trashFolder = await prismadb.folder.create({
      data: {
        name: "Trash",
        namePath: "/Trash",
        isRoot: true,
        addedByUserId: user.id,
        addedByName: `${user.name}`,
        userId: user.id,
        patientProfileId: singleLayerNodes[0].patientProfileId,
      },
    });
    singleLayerNodes.push(trashFolder);
    sortedFolders.push(trashFolder);
  }

  if (!sortedFolders || !singleLayerNodes || !patient) {
    return <div>something went wrong</div>;
  }

  const usedFileStorage = patient.usedFileStorage;
  const allotedStorageInGb = allotedPatientStorage[patient.plan];
  return (
    <main className="h-screen flex overflow-y-auto">
      <Sidebar
        usedFileStorage={usedFileStorage}
        allotedStorageInGb={allotedStorageInGb}
        data={sortedFolders}
        singleLayerNodes={singleLayerNodes}
      />
      <DeleteModal />
      <TrashModal />
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
