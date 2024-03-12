import { UploadFilesForm } from "@/app/(platform)/(access-patient-with-code)/(non-file-system)/tpa-upload/_components/upload-files-form";
import { UploadRecordsNavbar } from "./_components/upload-records-navbar";
import { getCodeByToken } from "./data/token";
import { redirect } from "next/navigation";
import { CodeNotFound } from "./_components/code-not-found";
import { Logo } from "@/components/logo";
interface UploadRecordsPageProps {
  params: {
    token: string;
  };
}

const UploadRecordsPage = async ({ params }: UploadRecordsPageProps) => {
  const requestRecordsCode = await getCodeByToken(params.token);
  if (!requestRecordsCode) {
    return (
      <div className="flex overflow-auto h-screen bg-[#1A2238]">
        <div className="fixed z-[50] flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10">
          <div className="flex items-center">
            <Logo />
          </div>
        </div>
        <CodeNotFound />
      </div>
    );
  }
  return (
    <div className="flex overflow-auto h-screen">
      <UploadRecordsNavbar expires={requestRecordsCode.expires} />
      <main className="pt-16 flex-1 overflow-y-auto xs:pb-0 pb-16">
        <div className="flex p-1 xs:p-8 min-h-[calc(100vh-64px)] justify-center">
          <UploadFilesForm requestRecordsCode={requestRecordsCode} />
        </div>
      </main>
    </div>
  );
};

export default UploadRecordsPage;
