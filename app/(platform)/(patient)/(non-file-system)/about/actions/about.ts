"use server";

import { z } from "zod";
import prismadb from "@/lib/prismadb";
import { AboutSchema } from "../schemas/about";
import { extractCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { decryptMultiplePatientFields, buildUpdatePayload, decryptKey, findChangesBetweenObjects } from "@/lib/utils";
import { auth } from "@/auth";
// import { getAccessPatientCodeByToken } from "@/auth/data";

// export const editPersonalInformation = async (values: z.infer<typeof PersonalInformationSchema>) => {
//   try {
//     const session = await auth();
//     const user = session?.user;
//     const userId = user?.id;
//     const currentUserPermissions = extractCurrentUserPermissions(user);

//     if (!session || !userId || !user || !currentUserPermissions.canAdd) {
//       return { error: "Unauthorized" };
//     }
//     if (!currentUserPermissions.isPatient) {
//       const code = await getAccessPatientCodeByToken(session.tempToken);
//       if (!code) {
//         return { error: "Unauthorized" };
//       }
//     }

//     const patient = await prismadb.patientProfile.findUnique({
//       where: {
//         userId: userId,
//       },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         dateOfBirth: true,
//         gender: true,
//         race: true,
//         maritalStatus: true,
//         weight: true,
//         height: true,
//         symmetricKey: true,
//       },
//     });
//     if (!patient || !patient.symmetricKey) {
//       return { error: "Decryption key not found!" };
//     }
//     const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");

//     const validatedFields = PersonalInformationSchema.safeParse(values);
//     // const session = await auth();
//     if (!validatedFields.success) {
//       return { error: "Invalid fields!" };
//     }

//     const decryptedPersonalInformation = decryptMultiplePatientFields(patient, decryptedSymmetricKey);

//     const changesObject = findChangesBetweenObjects(decryptedPersonalInformation, validatedFields.data);
//     if (Object.keys(changesObject).length === 0) {
//       return { error: "No changes made!" };
//     }
//     const updatePayload = buildUpdatePayload(changesObject, decryptedSymmetricKey);

//     if (Object.keys(updatePayload).length > 0) {
//       await prismadb.patientProfile.update({
//         where: { id: patient.id },
//         data: updatePayload,
//       });
//     }

//     return {
//       success: "Personal Information updated!",
//     };
//   } catch {
//     return { error: "something went wrong" };
//   }
// };

// export const editContactInformation = async (values: z.infer<typeof ContactInformationSchema>) => {
//   try {
//     const session = await auth();
//     const user = session?.user;
//     const userId = user?.id;
//     const currentUserPermissions = extractCurrentUserPermissions(user);

//     if (!session || !userId || !user || !currentUserPermissions.canAdd) {
//       return { error: "Unauthorized" };
//     }
//     if (!currentUserPermissions.isPatient) {
//       const code = await getAccessPatientCodeByToken(session.tempToken);
//       if (!code) {
//         return { error: "Unauthorized" };
//       }
//     }

//     const patient = await prismadb.patientProfile.findUnique({
//       where: {
//         userId: userId,
//       },
//       select: {
//         id: true,
//         mobilePhone: true,
//         homePhone: true,
//         addresses: true,
//         symmetricKey: true,
//       },
//     });
//     if (!patient || !patient.symmetricKey) {
//       return { error: "Decryption key not found!" };
//     }
//     const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");

//     const validatedFields = ContactInformationSchema.safeParse(values);
//     // const session = await auth();
//     if (!validatedFields.success) {
//       return { error: "Invalid fields!" };
//     }

//     const { mobilePhone, homePhone, address } = validatedFields.data;

//     const decryptedPhoneNumbers = decryptMultiplePatientFields(
//       { mobilePhone: patient.mobilePhone, homePhone: patient.homePhone },
//       decryptedSymmetricKey,
//     );
//     const decryptedAddress =
//       patient.addresses.length === 0 ? null : decryptMultiplePatientFields(patient.addresses[0], decryptedSymmetricKey);

//     const changesOfPhoneNumbers = findChangesBetweenObjects(decryptedPhoneNumbers, {
//       mobilePhone,
//       homePhone,
//     });

//     let changesOfAddress: any = !decryptedAddress && !!address.address ? address : {};
//     if (!!changesOfAddress && Object.keys(changesOfAddress).length === 0) {
//       changesOfAddress = findChangesBetweenObjects(decryptedAddress, address);
//     }
//     const changesOfPhoneNumbersLength = Object.keys(changesOfPhoneNumbers).length;
//     const changesOfAddressLength = Object.keys(changesOfAddress).length;

//     if (changesOfPhoneNumbersLength === 0 && changesOfAddressLength === 0) {
//       return { error: "No changes made!" };
//     }
//     const phoneNumbersPayload = buildUpdatePayload(changesOfPhoneNumbers, decryptedSymmetricKey);
//     const addressPayload = buildUpdatePayload(changesOfAddress, decryptedSymmetricKey);

//     await prismadb.$transaction(
//       async (prisma) => {
//         if (changesOfPhoneNumbersLength > 0) {
//           await prisma.patientProfile.update({
//             where: { id: patient.id },
//             data: phoneNumbersPayload,
//           });
//         }
//         if (changesOfAddressLength > 1) {
//           if (patient.addresses.length === 0 && !!address) {
//             await prismadb.patientAddress.create({
//               data: { ...addressPayload, patientProfileId: patient.id },
//             });
//           } else if (patient.addresses.length === 1 && !!validatedFields.data.address) {
//             await prismadb.patientAddress.update({
//               where: {
//                 patientProfileId: patient.id,
//                 id: patient.addresses[0].id,
//               },
//               data: { ...addressPayload },
//             });
//           }
//         }
//       },

//       { timeout: 20000 },
//     );

//     return {
//       success: "Contact Information updated!",
//     };
//   } catch (e) {
//     return { error: "something went wrong" };
//   }
// };

export const editAbout = async (values: z.infer<typeof AboutSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    const currentUserPermissions = extractCurrentUserPermissions(user);

    if (!session || !userId || !user || !currentUserPermissions.isPatient) {
      return { error: "Unauthorized" };
    }
    // if (!currentUserPermissions.isPatient) {
    //   const code = await getAccessPatientCodeByToken(session.tempToken);
    //   if (!code) {
    //     return { error: "Unauthorized" };
    //   }
    // }

    const patient = await prismadb.patientProfile.findUnique({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        race: true,
        maritalStatus: true,
        weight: true,
        height: true,
        mobilePhone: true,
        homePhone: true,
        addresses: true,
        symmetricKey: true,
      },
    });
    if (!patient || !patient.symmetricKey) {
      return { error: "Decryption key not found!" };
    }
    const decryptedSymmetricKey = decryptKey(patient.symmetricKey, "patientSymmetricKey");

    const validatedFields = AboutSchema.safeParse(values);
    // const session = await auth();
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const decryptedPersonalInformation = decryptMultiplePatientFields(patient, decryptedSymmetricKey);

    let nonAddressChanges: any = {};

    const { addresses: initialDataAddresses, ...initialDataNonAddressesObj } = decryptedPersonalInformation;
    const { address, ...nonAddressesObj } = values;

    nonAddressChanges = findChangesBetweenObjects(initialDataNonAddressesObj, nonAddressesObj);
    const nonAddressChangesLength = Object.keys(nonAddressChanges).length;

    const addressChanges =
      !!address && initialDataAddresses.length > 0 ? findChangesBetweenObjects(initialDataAddresses[0], address) : {};
    const addressChangesLength = Object.keys(addressChanges).length;
    const addressChanged =
      (!address && initialDataAddresses.length > 0) ||
      (!!address && initialDataAddresses.length === 0) ||
      addressChangesLength > 0
        ? true
        : false;

    if (nonAddressChangesLength === 0 && !addressChanged) {
      return { error: "No changes made!" };
    }
    let newAddressPayload: any = null;
    if (!!address && initialDataAddresses.length === 0) {
      newAddressPayload = buildUpdatePayload(address, decryptedSymmetricKey);
    }
    let addressUpdatePayload: any = null;
    if (addressChangesLength > 0) {
      addressUpdatePayload = buildUpdatePayload(addressChanges, decryptedSymmetricKey);
    }

    const nonAddressUpdatePayload = buildUpdatePayload(nonAddressChanges, decryptedSymmetricKey);
    await prismadb.$transaction(
      async (prisma) => {
        if (Object.keys(nonAddressUpdatePayload).length > 0) {
          await prisma.patientProfile.update({
            where: { id: patient.id },
            data: nonAddressUpdatePayload,
          });
        }
        if (!address && initialDataAddresses.length > 0) {
          //delete address
          await prisma.patientAddress.delete({
            where: {
              id: initialDataAddresses[0].id,
            },
          });
        } else if (!!newAddressPayload) {
          //add address
          await prisma.patientAddress.create({
            data: { ...newAddressPayload, patientProfileId: patient.id },
          });
        } else if (!!addressUpdatePayload) {
          //update address
          await prisma.patientAddress.update({
            where: {
              id: initialDataAddresses[0].id,
            },
            data: addressUpdatePayload,
          });
        }
      },

      { timeout: 20000 },
    );

    return {
      success: "Personal Information updated!",
    };
  } catch (e) {
    return { error: "something went wrong" };
  }
};
