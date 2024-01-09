import { DeleteModal } from "./_components/file-tree/_components/modals/delete-file-modal";
import { DownloadModal } from "./_components/file-tree/_components/modals/download-modal";
import { RenameModal } from "./_components/file-tree/_components/modals/rename-modal";
import { Sidebar } from "./_components/sidebar";
import { SearchCommand } from "@/app/(platform)/(patient)/(file-system)/_components/modals/search-command";
// import { useUser } from "@clerk/nextjs";
// import { auth, redirectToSignIn } from "@clerk/nextjs";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  // const { userId } = auth();

  // if (!userId) {
  //   return redirectToSignIn;
  // }

  return (
    <>
      {/* <Sidebar /> */}
      <DeleteModal />
      <DownloadModal />
      <RenameModal />
      <main className="h-screen flex overflow-y-auto">{children}</main>
      <div className="flex h-screen pt-16">
        <SearchCommand />
      </div>
    </>
  );
};

export default MainLayout;
