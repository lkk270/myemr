import { UploadFilesForm } from "@/app/(platform)/(access-patient-with-code)/(non-file-system)/tpa-upload/_components/upload-files-form";
import { UploadRecordsNavbar } from "./_components/upload-records-navbar";
import { getCodeByToken } from "./data/token";
import { redirect } from "next/navigation";

interface UploadRecordsPageProps {
  params: {
    token: string;
  };
}

const UploadRecordsPage = async ({ params }: UploadRecordsPageProps) => {
  const requestRecordsCode = await getCodeByToken(params.token);
  if (!requestRecordsCode) {
    return redirect("/");
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
