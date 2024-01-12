import { DeleteModal } from "./_components/file-tree/_components/modals/delete-file-modal";
import { DownloadModal } from "./_components/file-tree/_components/modals/download-modal";
import { RenameModal } from "./_components/file-tree/_components/modals/rename-modal";
import { MoveModal } from "./_components/file-tree/_components/modals/move-modal";

import { Sidebar } from "./_components/sidebar";

import { SearchCommand } from "@/app/(platform)/(patient)/(file-system)/_components/modals/search-command";
// import { useUser } from "@clerk/nextjs";
// import { auth, redirectToSignIn } from "@clerk/nextjs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SingleLayerNodesType, SingleLayerNodesType2 } from "@/app/types/file-types";
import prismadb from "@/lib/prismadb";

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
        files: true,
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

  function addLastViewedAtAndSort(array: SingleLayerNodesType[]): SingleLayerNodesType2[] {
    // Extract lastViewedAt and remove recordViewActivity
    const updatedArray = array.map((item) => {
      const lastViewedAt = item.recordViewActivity.length > 0 ? item.recordViewActivity[0].lastViewedAt : undefined;

      const { recordViewActivity, ...rest } = item;
      return { ...rest, lastViewedAt };
    });

    // Separate items with and without a lastViewedAt
    const itemsWithDate = updatedArray.filter((item) => item.lastViewedAt != null);
    const itemsWithoutDate = updatedArray.filter((item) => item.lastViewedAt == null);

    // Sort items with a lastViewedAt and then concatenate the rest
    const sortedItems = itemsWithDate
      .sort((a, b) => {
        const dateA = a.lastViewedAt as Date;
        const dateB = b.lastViewedAt as Date;
        return dateB.getTime() - dateA.getTime();
      })
      .concat(itemsWithoutDate);

    return sortedItems;
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

  const singleLayerFolders = await prismadb.folder.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      path: true,
      parentId: true,
      namePath: true,
      isFile: true,
      recordViewActivity: {
        where: {
          userId: user.id,
        },
        select: {
          lastViewedAt: true,
        },
      },
    },
  });

  const singleLayerFiles = await prismadb.file.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      name: true,
      parentId: true,
      path: true,
      namePath: true,
      isFile: true,
      recordViewActivity: {
        where: {
          userId: user.id,
        },
        select: {
          lastViewedAt: true,
        },
      },
    },
  });

  const singleLayerNodes = addLastViewedAtAndSort(singleLayerFolders.concat(singleLayerFiles));

  if (!allFolders || !singleLayerNodes) {
    return <div>something went wrong</div>;
  }

  return (
    <main className="h-screen flex overflow-y-auto">
      <Sidebar data={allFolders} singleLayerNodes={singleLayerNodes} />
      <DeleteModal />
      <DownloadModal />
      <RenameModal />
      <MoveModal />
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
      <div className="flex h-screen pt-16">
        <SearchCommand />
      </div>
    </main>
  );
};

export default MainLayout;
