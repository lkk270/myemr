import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { Demographics } from "../../_components/demographics";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";

const PatientMedications = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn;
  }
  // const patientDemographics = await prismadb.patientProfile.findUnique({
  //   where: {
  //     userId: userId,
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
  //   },
  // });

  return <div className="flex pt-10 px-10 h-full justify-center">Hello</div>;
};

export default PatientMedications;
