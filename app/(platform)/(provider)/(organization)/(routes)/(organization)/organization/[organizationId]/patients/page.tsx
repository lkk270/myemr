import { PatientMemberType1, PatientMemberType2 } from "@/app/types";
import { auth } from "@/auth";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { getOrganizationMemberByUserIdBase } from "../../../../../data/organization";
import { SomethingNotFound } from "@/app/(public-routes)/upload-records/[token]/_components/something-not-found";
import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";
import { PatientsTable } from "./_components/table/patients-table";

interface MembersPageProps {
  params: {
    organizationId: string;
  };
}

const MembersPage = async ({ params }: MembersPageProps) => {
  const organizationId = params.organizationId;

  const session = await auth();
  const user = session?.user;

  if (!session || !user || user.userType !== "PROVIDER") {
    return redirect("/");
  }

  const organizationMember = await getOrganizationMemberByUserIdBase(organizationId);
  if (!organizationMember) {
    return <SomethingNotFound title="404 No organization found" href="provider-home" />;
  }

  const patients: PatientMemberType1[] = await prismadb.patientMember.findMany({
    where: {
      organizationId,
    },
    include: {
      patientProfile: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          imageUrl: true,
          symmetricKey: true,
        },
      },
    },
  });

  const decryptPatients = () => {
    const formattedPatients = patients.map((member) => {
      // Assuming decryptKey is synchronous for this example. If it's not, use await.
      const decryptedSymmetricKey = decryptKey(member.patientProfile.symmetricKey, "patientSymmetricKey");
      const decryptedPatientProfile = decryptMultiplePatientFields(
        {
          firstName: member.patientProfile.firstName,
          lastName: member.patientProfile.lastName,
          email: member.patientProfile.email,
          dateOfBirth: member.patientProfile.dateOfBirth,
        },
        decryptedSymmetricKey,
      );

      return {
        ...member,
        patientProfile: {
          id: member.patientProfile.id,
          name: `${decryptedPatientProfile.firstName} ${decryptedPatientProfile.lastName}`,
          email: decryptedPatientProfile.email,
          dateOfBirth: decryptedPatientProfile.dateOfBirth,
          imageUrl: member.patientProfile.imageUrl,
        },
      };
    });
    return formattedPatients;
  };
  let formattedPatients: PatientMemberType2[] = [];
  try {
    formattedPatients = decryptPatients();
  } catch {
    return <SomethingNotFound title="Something went wrong" href="provider-home" />;
  }

  return (
    <div className="pt-20 px-4 flex flex-col gap-y-3">
      <PatientsTable data={formattedPatients} />
    </div>
  );
};

export default MembersPage;
