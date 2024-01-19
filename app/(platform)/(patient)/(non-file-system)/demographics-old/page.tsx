// import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { Demographics } from "../../_components/demographics";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const PatientDemographics = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;
  // const { userId } = auth();

  // if (!userId) {
  //   return redirectToSignIn;
  // }

  const patientDemographics = await prismadb.patientProfile.findUnique({
    where: {
      userId: user.id,
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
  let decryptedPatientDemographics;
  try {
    const decryptedSymmetricKey = decryptKey(patientDemographics.symmetricKey, "patientSymmetricKey");
    decryptedPatientDemographics = decryptMultiplePatientFields(patientDemographics, decryptedSymmetricKey);
  } catch (e) {
    return <div>something went wrong decryption</div>;
  }
  return (
    <div className="flex pt-10 px-10 h-full justify-center">
      <Demographics patientDemographics={decryptedPatientDemographics} />
    </div>
  );
};

export default PatientDemographics;
