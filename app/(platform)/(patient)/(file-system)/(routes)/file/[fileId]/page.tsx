import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { NodePageHeader } from "../../../_components/node-page-header";
import prismadb from "@/lib/prismadb";
import { Viewer } from "../../../_components/file-viewers/file-viewer";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPresignedUrl } from "../../../actions/get-file-psu";
import { updateRecordViewActivity } from "@/lib/files";

interface FilePagePageProps {
  params: {
    fileId: string;
  };
}

const FilePagePage = async ({ params }: FilePagePageProps) => {
  const fileId = params.fileId;
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;
  const userId = user?.id;

  if (!user || !userId) {
    return redirect("/");
  }

  // if (!file || !file.type) {
  //   return redirect("/");
  // }

  // const s3Client = new S3Client({ region: process.env.AWS_REGION });
  // const command = new GetObjectCommand({
  //   Bucket: process.env.AWS_BUCKET_NAME,
  //   Key: `${file.patientProfileId}/${file.id}`,
  //   ResponseContentDisposition: `filename="${file.name}"`, // Sets the filename for the download
  // });
  // const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Expires in 1 hour
  const response = await getPresignedUrl(fileId);
  try {
    updateRecordViewActivity(user.id, fileId, true);
  } catch (error) {
    return <div>Something went wrong</div>;
  }

  if (!response.presignedUrl || !response.type) {
    return <div>Something went wrong</div>;
  }
  return (
    <div className="pt-16 px-6">
      <NodePageHeader nodeId={fileId} isFile={true} />
      <Viewer
        fileName={response.fileName}
        fileId={fileId}
        fileType={response.type}
        initialFileSrc={response.presignedUrl}
      />
    </div>
  );
};

export default FilePagePage;
