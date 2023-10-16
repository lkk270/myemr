import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { Demographics } from "../../_components/demographics";

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
      firstName: true,
      lastName: true,
      gender: true,
      dateOfBirth: true,
      maritalStatus: true,
      race: true,
      mobilePhone: true,
      homePhone: true,
      insuranceProvider: true,
      policyNumber: true,
      groupNumber: true,
      addresses: true,
    },
  });

  if (!patientDemographics) {
    return <div>something went wrong</div>;
  }

  return (
    <div className="flex pt-10 px-10 h-full justify-center">
      <Demographics patientDemographics={patientDemographics} />
    </div>
  );
};

export default PatientDemographics;
