import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";
import { CustomDataTable } from "./_components/table/custom-data-table";
import { Medication } from "@prisma/client";

import { MedicationType } from "@/app/types";

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
      medications: {
        include: {
          dosageHistory: true,
        },
      },
      symmetricKey: true,
    },
  });

  if (!patientMedications) {
    return <div>something went wrong</div>;
  }
  console.log(patientMedications.medications[0].dosageHistory);
  let decryptedPatientMedications;

  try {
    const decryptedSymmetricKey = decryptKey(patientMedications.symmetricKey, "patientSymmetricKey");
    decryptedPatientMedications = decryptMultiplePatientFields(patientMedications.medications, decryptedSymmetricKey);
  } catch (e) {
    return <div>something went wrong</div>;
  }
  console.log(decryptedPatientMedications);
  const temp: MedicationType[] = [
    {
      userId: "user13",
      patientProfileId: "user13",
      createdAt: new Date(),
      updatedAt: new Date(),
      id: "testicles",
      name: "Ibuprofen",
      prescribedByName: "Jeff Bander",
      category: "Cardiology",
      dosage: "5",
      dosageUnits: "mg",
      frequency: "bid",
      status: "active",
      dosageHistory: [
        {
          id: "eeadsfsdf",
          medicationId: "testicles",
          dosage: "10",
          dosageUnits: "mg",
          frequency: "bid",
          createdAt: new Date(),
        },
      ],
    },
  ];
  return (
    <div className="flex sm:px-10 h-full justify-center">
      <div className="h-full flex-1 flex-col space-y-8 p-2 sm:p-8 flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Medications</h2>
          </div>
        </div>
        <CustomDataTable data={temp} />
      </div>
    </div>
  );
};

export default PatientMedications;
