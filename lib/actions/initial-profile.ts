// // import { useCurrentUser } from "@/auth/hooks/use-current-user";

// import { redirect } from "next/navigation";
// import prismadb from "@/lib/prismadb";

// import { generateAsymmetricKeyPairs, generateSymmetricKey, encryptKey, encryptPatientRecord } from "./encryption";

// export const createInitialPatientProfile = async (userId: string) => {
//   // const user = await currentUser();
//   // const user = useCurrentUser();

//   // if (!user || !user.email || !user.firstName || !user.lastName) {
//   //   return redirect("/auth/login");
//   // }

//   // if (Date.now() - new Date(user.createdAt).getTime() > 5 * 60 * 1000) {
//   //   return;
//   // }

//   // const profile = await prismadb.patientProfile.findUnique({
//   //   where: {
//   //     userId: userId,
//   //   },
//   // });

//   // if (profile) {
//   //   return;
//   // }

//   const { publicKey, privateKey } = generateAsymmetricKeyPairs();
//   const symmetricKey = generateSymmetricKey();

//   await prismadb.patientProfile.create({
//     data: {
      
//       userId: userId,
//       publicKey: encryptKey(publicKey, "patientPublicKey"),
//       privateKey: encryptKey(privateKey, "patientPrivateKey"),
//       symmetricKey: encryptKey(symmetricKey, "patientSymmetricKey"),
//     },
//   });

//   return;
// };

// export const createInitialProviderProfile = async (userId: string) => {
//   // const user = useCurrentUser();

//   // if (!user || !user.email || !user.firstName || !user.lastName) {
//   //   return redirect("/auth/login");
//   // }

//   // const profile = await prismadb.providerProfile.findUnique({
//   //   where: {
//   //     userId: userId,
//   //   },
//   // });

//   // if (profile) {
//   //   return;
//   // }

//   const { publicKey, privateKey } = generateAsymmetricKeyPairs();

//   await prismadb.providerProfile.create({
//     data: {
//       userId: userId,
//       publicKey: encryptKey(publicKey, "providerPublicKey"),
//       privateKey: encryptKey(privateKey, "providerPrivateKey"),
//     },
//   });
//   return;
// };
