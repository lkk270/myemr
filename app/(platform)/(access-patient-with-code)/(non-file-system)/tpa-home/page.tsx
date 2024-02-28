import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { UserRole } from "@prisma/client";
import { accessTypeTextObjForTemp } from "@/lib/constants";
import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";
import { CountdownTimer } from "./_components/countdown-timer";

const AccessHome = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;

  const patient = await prismadb.patientProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      firstName: true,
      lastName: true,
      symmetricKey: true,
    },
  });

  if (!patient) {
    return <div>something went wrong</div>;
  }
  let decryptedPatient;
  try {
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");
    decryptedPatient = decryptMultiplePatientFields(patient, decryptedSymmetricKey);
  } catch (e) {
    return <div>something went wrong decryption</div>;
  }
  const { symmetricKey, ...safeObject } = decryptedPatient;

  const accessTypeTitle = accessTypeTextObjForTemp[user.role].title;
  const accessTypeDescription = accessTypeTextObjForTemp[user.role].description;

  return (
    <div className="flex flex-col mx-auto max-w-3xl px-4 pt-2 xs:pt-12 sm:pt-20">
      <div className="space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl pb-8">Welcome!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-left">
            {`You have temporary access to ${safeObject.firstName} ${safeObject.lastName}'s medical records. Your access type is `}
            <span className="font-bold italic">{accessTypeTitle}</span>.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-left">{`This means that you ${accessTypeDescription}.`}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold tracking-tight">Your access expires in:</h2>
          <CountdownTimer expiredDateTime={new Date(session.expires)} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Next Steps</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Navigate to different pages through the navbar on the top of the page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessHome;
