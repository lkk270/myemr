import { auth } from "@/auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";
import { CustomDataTable } from "./_components/table/custom-data-table";

const PatientMedications = async () => {
  // const { userId } = auth();

  // if (!userId) {
  //   return redirectToSignIn;
  // }
  const session = await auth();
  const user = session?.user;
  if (!session || !user) {
    return redirect("/");
  }

  const patientMedications = await prismadb.patientProfile.findUnique({
    where: {
      userId: user.id,
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

  const sortedMedications = patientMedications.medications.map(medication => ({
    ...medication,
    dosageHistory: [...medication.dosageHistory].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }));

  let decryptedPatientMedications;

  try {
    const decryptedSymmetricKey = decryptKey(patientMedications.symmetricKey, "patientSymmetricKey");
    decryptedPatientMedications = decryptMultiplePatientFields(sortedMedications, decryptedSymmetricKey);
  } catch (e) {
    console.error("Decryption error:", e);
    return <div className="p-4 text-red-500">Error decrypting medications data</div>;
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
