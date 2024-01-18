// import { auth, redirectToSignIn } from "@clerk/nextjs";
import { CustomDataTable } from "../../../_components/file-table/custom-data-table";
import prismadb from "@/lib/prismadb";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";
import { FolderHeader } from "../../../_components/folder-header";

interface FolderPagePageProps {
  params: {
    folderId: string;
  };
}

const FolderPage = async ({ params }: FolderPagePageProps) => {
  const folderId = params.folderId;
  // const { userId } = auth();

  // if (!userId) {
  //   return redirectToSignIn;
  // }
  // const patientMedications = await prismadb.patientProfile.findUnique({
  //   where: {
  //     userId: userId,
  //   },
  //   select: {
  //     medications: {
  //       include: {
  //         dosageHistory: true,
  //       },
  //     },
  //     symmetricKey: true,
  //   },
  // });

  // if (!patientMedications) {
  //   return <div>something went wrong</div>;
  // }
  // let decryptedPatientMedications;

  // try {
  //   const decryptedSymmetricKey = decryptKey(patientMedications.symmetricKey, "patientSymmetricKey");
  //   decryptedPatientMedications = decryptMultiplePatientFields(patientMedications.medications, decryptedSymmetricKey);
  // } catch (e) {
  //   console.log(e);
  //   return <div>something went wrong</div>;
  // }

  return (
    <div className="pt-16 px-6">
      <div>{folderId}</div>
      <FolderHeader />
      <CustomDataTable data={[]} />
    </div>
  );
};

export default FolderPage;
