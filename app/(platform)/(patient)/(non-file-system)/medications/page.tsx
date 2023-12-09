import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";

import Image from "next/image";

import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

const PatientMedications = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn;
  }
  const patientMedications = await prismadb.patientProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      medications: true,
      symmetricKey: true,
    },
  });

  if (!patientMedications) {
    return <div>something went wrong</div>;
  }
  let decryptedPatientMedications;
  try {
    const decryptedSymmetricKey = decryptKey(patientMedications.symmetricKey, "patientSymmetricKey");
    decryptedPatientMedications = decryptMultiplePatientFields(patientMedications, decryptedSymmetricKey);
  } catch (e) {
    return <div>something went wrong</div>;
  }
  console.log(decryptedPatientMedications);
  const temp = [
    {
      id: "testicles",
      name: "Ibuprofen",
      physician: "Jeff Bander",
      category: "Cardiology",
      dosage: "1/3 mg, bod",
      status: "active",
    },
  ];
  return (
    <div className="flex pt-10 sm:px-10 h-full justify-center">
      <div className="h-full flex-1 flex-col space-y-8 p-2 sm:p-8 flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Medications</h2>
          </div>
        </div>
        <DataTable data={temp} columns={columns} />
      </div>
    </div>
  );
};

export default PatientMedications;
