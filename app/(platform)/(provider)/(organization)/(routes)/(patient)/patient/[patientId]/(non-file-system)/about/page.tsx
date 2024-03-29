// import { auth, redirectToSignIn } from "@clerk/nextjs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { About } from "@/app/(platform)/(patient)/(non-file-system)/about/_components/about-form";
import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";

interface PatientDemographicsProps {
  params: {
    patientId: string;
  };
}

const PatientDemographics = async ({ params }: PatientDemographicsProps) => {
  // const { userId } = auth();

  // if (!userId) {
  //   return redirectToSignIn;
  // }

  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;

  const patientMember = await prismadb.patientMember.findUnique({
    where: {
      id: params.patientId,
    },
  });

  if (!patientMember) {
    return <div>something went wrong 58</div>;
  }

  const patientDemographics = await prismadb.patientProfile.findUnique({
    where: {
      id: patientMember.patientProfileId,
    },
    select: {
      imageUrl: true,
      email: true,
      firstName: true,
      lastName: true,
      gender: true,
      dateOfBirth: true,
      maritalStatus: true,
      race: true,
      mobilePhone: true,
      homePhone: true,
      height: true,
      weight: true,
      unit: true,
      insuranceProvider: true,
      policyNumber: true,
      groupNumber: true,
      addresses: true,
      symmetricKey: true,
      insuranceImagesSet: true,
    },
  });

  if (!patientDemographics) {
    return <div>something went wrong 58</div>;
  }
  let decryptedPatientDemographics;
  try {
    const decryptedSymmetricKey = decryptKey(patientDemographics.symmetricKey, "patientSymmetricKey");
    decryptedPatientDemographics = decryptMultiplePatientFields(patientDemographics, decryptedSymmetricKey);
  } catch (e) {
    return <div>something went wrong decryption</div>;
  }

  const { symmetricKey, ...safeObject } = decryptedPatientDemographics;

  return (
    <div className="flex pt-4 px-2 xs:px-10 h-full justify-center">
      <About initialData={safeObject} />
    </div>
  );
};

export default PatientDemographics;
