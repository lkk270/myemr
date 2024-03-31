import { auth } from "@/auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";
// import { CustomDataTable } from "./_components/table/custom-data-table";
import { SomethingNotFound } from "@/app/(public-routes)/upload-records/[token]/_components/something-not-found";
import { MedicationsWrapper } from "./_components/medications-wrapper";

interface PatientMedicationsProps {
  params: {
    patientId: string;
  };
}

const PatientMedications = async ({ params }: PatientMedicationsProps) => {

  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const patientMember = await prismadb.patientMember.findUnique({
    where: { id: params.patientId },
    include: {
      patientProfile: {
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
      },
    },
  });

  const patientMedications = patientMember?.patientProfile;

  if (!patientMedications) {
    return <SomethingNotFound title="No patient found" href="provider-home" />;
  }

  patientMedications.medications.forEach((medication) => {
    medication.dosageHistory.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  });

  let decryptedPatientMedications;

  try {
    const decryptedSymmetricKey = decryptKey(patientMedications.symmetricKey, "patientSymmetricKey");
    decryptedPatientMedications = decryptMultiplePatientFields(patientMedications.medications, decryptedSymmetricKey);
  } catch (e) {
    return <SomethingNotFound title="Something went wrong" href="provider-home" />;
  }

  return (
    <div className="flex-1 sm:px-10 h-full justify-center">
      <div className="h-full flex-1 flex-col space-y-8 p-3 sm:p-8 flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight pt-2">Medications</h2>
          </div>
        </div>
        <MedicationsWrapper patientMember={patientMember} initialData={decryptedPatientMedications} />
      </div>
    </div>
  );
};

export default PatientMedications;
