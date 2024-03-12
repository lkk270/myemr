import { Sidebar } from "../_components/sidebar";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-screen flex overflow-y-auto">
      <Sidebar />
      <div className="flex-1 h-full overflow-y-auto">{children}</div>
    </main>
  );
};

export default OrganizationLayout;
