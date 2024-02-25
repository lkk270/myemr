import { UploadFilesForm } from "@/app/(platform)/(access-patient-with-code)/(non-file-system)/tpa-upload/_components/upload-files-form";
import { UploadRecordsNavbar } from "./_components/upload-records-navbar";

const UploadRecordsPage = () => {
  return (
    <div className="flex overflow-auto h-screen">
      <UploadRecordsNavbar />
      <main className="pt-16 flex-1 overflow-y-auto">
        <div className="flex p-1 xs:p-8 min-h-[calc(100vh-64px)] justify-center">
          <UploadFilesForm />
        </div>
      </main>
    </div>
  );
};

export default UploadRecordsPage;
