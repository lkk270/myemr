import { DownloadModal } from "@/app/(platform)/(patient)/(file-system)/_components/file-tree/_components/modals/download-modal";
import { RenameModal } from "@/app/(platform)/(patient)/(file-system)/_components/file-tree/_components/modals/rename-modal";
import { MoveModal } from "@/app/(platform)/(patient)/(file-system)/_components/file-tree/_components/modals/move-modal";
import { AddFolderModal } from "@/app/(platform)/(patient)/(file-system)/_components/file-tree/_components/modals/add-folder-modal";
import { UploadFilesModal } from "@/app/(platform)/(patient)/(file-system)/_components/file-tree/_components/modals/upload-files-modal";
import { Sidebar } from "@/app/(platform)/(patient)/(file-system)/_components/sidebar";

import { SearchCommand } from "@/app/(platform)/(patient)/(file-system)/_components/modals/search-command";
import { NewRootFolder } from "@/app/(platform)/(patient)/(file-system)/_components/modals/new-root-folder-modal";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { sortFolderChildren, sortRootNodes, extractNodes, addLastViewedAtAndSort } from "@/lib/utils";
import { fetchAllFoldersForPatient } from "@/lib/actions/files";
import { SomethingNotFound } from "@/app/(public-routes)/upload-records/[token]/_components/something-not-found";
import { OrganizationWithRoleType } from "@/app/types";
import { getNumberOfUnreadNotifications } from "@/lib/data/notifications";
import { getPatientMember } from "@/auth/actions/patient-member";
import { extractRootFolderIds } from "@/lib/actions/files";
import { ProviderManageAccountModal } from "@/components/modals/manage-account/provider-manage-account/provider-manage-account-modal";
import { SidebarWrapper } from "./_components/sidebar-wrapper";
interface FileSystemLayoutProps {
  params: {
    patientMemberId: string;
  };
  children: React.ReactNode;
}

const FileSystemLayout = async ({ children, params }: FileSystemLayoutProps) => {
  const session = await auth();
  const user = session?.user;

  if (!session || !user || user.userType !== "PROVIDER") {
    return redirect("/");
  }

  const patientMember = await getPatientMember(params.patientMemberId, "canRead", {
    user,
    currentUserPermissions: extractCurrentUserPermissions(user),
  });

  if (!patientMember) {
    return <SomethingNotFound title="404 No patient found" href="provider-home" />;
  }

  const accessibleRootFolderIds = await extractRootFolderIds(patientMember.accessibleRootFolders);

  const organizationsMembersOf = await prismadb.organizationMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
  });

  const validProviderAccess = organizationsMembersOf.some(
    (object) => object.organization.id === patientMember.organizationId,
  );

  if (!validProviderAccess) {
    return <SomethingNotFound title="No patient found" href="provider-home" />;
  }

  const organizations: OrganizationWithRoleType[] = organizationsMembersOf.map((member) => ({
    ...member.organization,
    role: member.role,
    numOfUnreadActivities: 0,
  }));

  let numOfUnreadNotifications = 0;
  try {
    numOfUnreadNotifications = await getNumberOfUnreadNotifications();
  } catch {
    numOfUnreadNotifications = 0;
  }

  let allFolders: any[] | "Unauthorized" = [];

  try {
    allFolders = await fetchAllFoldersForPatient(null, patientMember.patientUserId, accessibleRootFolderIds);
    if (allFolders === "Unauthorized") {
      return <SomethingNotFound title={"Unauthorized"} href="tpa-home" />;
    }
  } catch (e: any) {
    const title = e.message === "Unauthorized" ? "Unauthorized" : "Something went wrong";
    return <SomethingNotFound title={title} href="tpa-home" />;
  }

  const sortedFoldersTemp = allFolders.map((folder) => sortFolderChildren(folder));
  const sortedFolders = sortRootNodes(sortedFoldersTemp);
  // const patient = await prismadb.patientProfile.findUnique({
  //   where: { userId: user.id },
  //   select: { id: true },
  // });

  if (!sortedFolders) {
    return <div>something went wrong92</div>;
  }

  let rawAllNodes = extractNodes(allFolders);
  const allNodesMap = new Map(rawAllNodes.map((node) => [node.id, { ...node, children: undefined }]));
  const allNodesArray = Array.from(allNodesMap.values());
  const singleLayerNodes = addLastViewedAtAndSort(allNodesArray);

  // console.log(singleLayerNodes);

  const sumOfAllSuccessFilesSizes = singleLayerNodes.reduce((accumulator, file) => {
    if (!!file.size && file.isFile === true) {
      return accumulator + file.size;
    }
    return accumulator;
  }, 0n);
  // const allotedStorageInGb = allotedStoragesInGb[user.plan];
  return (
    <main className="h-screen flex overflow-y-auto">
      <SidebarWrapper
        initialOrganizations={organizations}
        initialPatientMember={patientMember}
        sumOfAllSuccessFilesSizes={sumOfAllSuccessFilesSizes}
        numOfUnreadNotifications={numOfUnreadNotifications}
        data={sortedFolders}
        singleLayerNodes={singleLayerNodes}
      />
      <DownloadModal />
      <RenameModal />
      <MoveModal />
      <AddFolderModal />
      <UploadFilesModal />
      <ProviderManageAccountModal />
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
      <div className="flex h-screen pt-16">
        <SearchCommand />
        <NewRootFolder />
      </div>
    </main>
  );
};

export default FileSystemLayout;
