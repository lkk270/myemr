import { RootNodePageHeader } from "../../_components/root-node-page-header";

const RootFileSystemPage = async () => {
  return (
    <div className="pt-16 px-6">
      <div className="text-2xl font-extrabold py-3 underline">Home</div>
      <RootNodePageHeader />
    </div>
  );
};

export default RootFileSystemPage;
