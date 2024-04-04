import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NodePageHeader } from "@/app/(platform)/(patient)/(file-system)/_components/node-page-header";
import { Viewer } from "@/app/(platform)/(patient)/(file-system)/_components/file-viewers/file-viewer";
import { getPresignedUrl } from "@/app/(platform)/(patient)/(file-system)/actions/get-file-psu";
import { updateRecordViewActivity } from "@/lib/actions/files";
import { getFileName } from "@/app/(platform)/(patient)/(file-system)/actions/get-file-psu";
import { isViewableFile } from "@/lib/utils";
import { File } from "@prisma/client";
import { SomethingNotFound } from "@/app/(public-routes)/upload-records/[token]/_components/something-not-found";
import prismadb from "@/lib/prismadb";

interface FilePagePageProps {
  params: {
    patientMemberId: string;
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
  if (!user || !userId || user.userType !== "PROVIDER") {
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

  const redirectUrl = `/patient/${params.patientMemberId}/files`;
  const file = await prismadb.file.findUnique({
    where: {
      id: fileId,
      status: "SUCCESS",
      restricted: false,
      namePath: {
        not: {
          startsWith: "/Trash",
        },
      },
    },
  });

  if (!file) {
    return redirect(redirectUrl);
  }

  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const fileName = getFileName(file.name, file.type as string);
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${file.patientProfileId}/${fileId}`,
    ResponseContentDisposition: !isViewableFile(file.type || "")
      ? `attachment; filename="${fileName}"`
      : `filename="${fileName}"`, // Sets the filename for the download
  });
  let presignedUrl = null;
  try {
    presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  } catch {
    return <SomethingNotFound title={"Something went wrong"} href={redirectUrl} />;
  }

  try {
    updateRecordViewActivity(user.id, fileId, true);
  } catch (error) {
    return <SomethingNotFound title={"Something went wrong"} href={redirectUrl} />;
  }

  if (!presignedUrl || typeof file.type !== "string") {
    return <SomethingNotFound title={"Something went wrong"} href={redirectUrl} />;
  }
  return (
    <div className="pt-16 px-6">
      <NodePageHeader nodeId={fileId} isFile={true} />
      <Viewer fileName={file.name} fileId={fileId} fileType={file.type || ""} initialFileSrc={presignedUrl} />
    </div>
  );
};

export default FilePagePage;
