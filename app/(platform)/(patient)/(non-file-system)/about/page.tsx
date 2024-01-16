// import { auth, redirectToSignIn } from "@clerk/nextjs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { Demographics } from "./_components/demographics";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";

const PatientDemographics = async () => {
  // const { userId } = auth();

  // if (!userId) {
  //   return redirectToSignIn;
  // }

  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;

  // await prismadb.folder.delete({
  //   where: {
  //     id: "clrgj4tlw000183bpfkmnhjrb",
  //   },
  // });
  // await prismadb.recordViewActivity.deleteMany({
  //   where: {
  //     userId: "clqvdl88c0003cah8li8dt7fy",
  //   },
  // });
  // await prismadb.file.deleteMany({
  //   where: {
  //     userId: "clqvdl88c0003cah8li8dt7fy",
  //   },
  // });

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
    <div className="flex pt-4 px-2 xs:px-10 h-full justify-center">
      <Demographics patientDemographics={decryptedPatientDemographics} />
    </div>
  );
};

export default PatientDemographics;
