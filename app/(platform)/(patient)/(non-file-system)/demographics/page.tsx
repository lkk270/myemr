import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { Demographics } from "../../_components/demographics";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";

const PatientDemographics = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn;
  }
  const patientDemographics = await prismadb.patientProfile.findUnique({
    where: {
      userId: userId,
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
    },
  });

  if (!patientDemographics) {
    return <div>something went wrong</div>;
  }
  console.log(patientDemographics);
  let decryptedPatientDemographics;
  try {
    const decryptedSymmetricKey = decryptKey(patientDemographics.symmetricKey, "patientSymmetricKey");
    console.log(decryptedSymmetricKey);
    decryptedPatientDemographics = decryptMultiplePatientFields(patientDemographics, decryptedSymmetricKey);
    console.log(decryptedPatientDemographics);
  } catch (e) {
    return <div>something went wrong</div>;
  }
  return (
    <div className="flex pt-10 px-10 h-full justify-center">
      <Demographics patientDemographics={decryptedPatientDemographics} />
    </div>
  );
};

export default PatientDemographics;
