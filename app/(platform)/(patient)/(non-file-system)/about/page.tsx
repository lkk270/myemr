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
  //     id: "clr71tl9c0010neauwv20y7kc",
  //   },
  // });
  // await createFolder("Root", "/", "/Root", null, "clqy00gdg000q60yoc8kuxpf2", "clqvdl88c0003cah8li8dt7fy", 3);
  async function createFolder(
    name: string,
    path: string,
    namePath: string,
    parentId: string | null,
    patientProfileId: string,
    userId: string,
    depth: number,
  ) {
    if (depth === 0) return null;

    // Create folder
    const folder = await prismadb.folder.create({
      data: {
        name,
        path,
        namePath,
        parentId,
        patientProfileId,
        userId,
        files: {
          create: [
            {
              name: `File1_in_${name}`,
              path: `${path}${name}/`,
              namePath: `${namePath}/File1`,
              patientProfileId,
              userId,
            },
            {
              name: `File2_in_${name}`,
              path: `${path}${name}/`,
              namePath: `${namePath}/File2`,
              patientProfileId,
              userId,
            },
          ],
        },
      },
    });

    // Create subfolders
    await createFolder(
      `Subfolder1_of_${name}`,
      `${path}${name}/`,
      `${namePath}/Subfolder1`,
      folder.id,
      patientProfileId,
      userId,
      depth - 1,
    );
    await createFolder(
      `Subfolder2_of_${name}`,
      `${path}${name}/`,
      `${namePath}/Subfolder2`,
      folder.id,
      patientProfileId,
      userId,
      depth - 1,
    );

    return folder;
  }

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
