// import { auth, redirectToSignIn } from "@clerk/nextjs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";
import { AboutWrapper } from "./_components/about-wrapper";
import { SomethingNotFound } from "@/app/(public-routes)/upload-records/[token]/_components/something-not-found";

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

  // const patientMember = await prismadb.patientMember.findUnique({
  //   where: {
  //     id: params.patientId,
  //   },
  // });

  // if (!patientMember) {
  //   return <div>something went wrong</div>;
  // }

  const patientMember = await prismadb.patientMember.findUnique({
    where: { id: params.patientId },
    include: {
      patientProfile: {
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
      },
    },
  });

  const patientDemographics = patientMember?.patientProfile;

  // const patientDemographics = await prismadb.patientProfile.findUnique({
  //   where: {
  //     id: patientMember.patientProfileId,
  //   },
  //   select: {
  //     imageUrl: true,
  //     email: true,
  //     firstName: true,
  //     lastName: true,
  //     gender: true,
  //     dateOfBirth: true,
  //     maritalStatus: true,
  //     race: true,
  //     mobilePhone: true,
  //     homePhone: true,
  //     height: true,
  //     weight: true,
  //     unit: true,
  //     insuranceProvider: true,
  //     policyNumber: true,
  //     groupNumber: true,
  //     addresses: true,
  //     symmetricKey: true,
  //     insuranceImagesSet: true,
  //   },
  // });

  if (!patientDemographics) {
    return <SomethingNotFound title="No patient found" href="provider-home" />;
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
    <div className="flex pt-4 pb-6 px-2 xs:px-10 min-h-[calc(100vh-64px)] justify-center">
      <AboutWrapper patientMember={patientMember} initialData={safeObject} />
    </div>
  );
};

export default PatientDemographics;
