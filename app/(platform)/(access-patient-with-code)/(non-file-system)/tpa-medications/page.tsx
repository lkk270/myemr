import { auth } from "@/auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";
import { CustomDataTable } from "@/app/(platform)/(patient)/(non-file-system)/medications/_components/table/custom-data-table";

const PatientMedications = async () => {
  // const { userId } = auth();

  // if (!userId) {
  //   return redirectToSignIn;
  // }
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;

  const patientMedications = await prismadb.patientProfile.findUnique({
    where: {
      userId: user?.id,
    },
    select: {
      medications: {
        include: {
          dosageHistory: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      symmetricKey: true,
    },
  });

  if (!patientMedications) {
    return <div>something went wrong</div>;
  }
  let decryptedPatientMedications;

  try {
    const decryptedSymmetricKey = decryptKey(patientMedications.symmetricKey, "patientSymmetricKey");
    decryptedPatientMedications = decryptMultiplePatientFields(patientMedications.medications, decryptedSymmetricKey);
  } catch (e) {
    console.log(e);
    return <div>something went wrong</div>;
  }

  return (
    <div className="flex-1 sm:px-10 h-full justify-center">
      <div className="h-full flex-1 flex-col space-y-8 p-3 sm:p-8 flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight pt-2">Medications</h2>
          </div>
        </div>
        <CustomDataTable data={decryptedPatientMedications} />
      </div>
    </div>
  );
};

export default PatientMedications;
