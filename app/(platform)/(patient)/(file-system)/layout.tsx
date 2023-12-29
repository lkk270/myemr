import { Sidebar } from "./_components/sidebar";
import { SearchCommand } from "@/components/modals/search-command";
import { useUser } from "@clerk/nextjs";
import { auth, redirectToSignIn } from "@clerk/nextjs";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn;
  }

  return (
    <main className="h-screen flex overflow-y-auto">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
      <div className="flex h-screen pt-16">
        <SearchCommand />
      </div>
    </main>
  );
};

export default MainLayout;
