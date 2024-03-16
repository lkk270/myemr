"use server";

import { z } from "zod";
import prismadb from "@/lib/prismadb";
import { OrganizationSchema } from "../schema/organization";
import { auth } from "@/auth";

export const createOrganization = async (values: z.infer<typeof OrganizationSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    if (!session || !userId || !user || user.userType !== "PROVIDER") {
      return { error: "Unauthorized" };
    }

    const validatedFields = OrganizationSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { addresses, ...nonAddressesObj } = values;
    const addressesWithoutId = addresses.map(({ id, ...restOfAddress }) => restOfAddress);

    const organization = await prismadb.organization.create({
      data: {
        ...nonAddressesObj,
        addresses: {
          createMany: { data: addressesWithoutId },
        },
        organizationMembers: {
          create: { role: "OWNER", userId },
        },
      },
    });

    return {
      success: "Organization created!",
      organizationId: organization.id,
    };
  } catch (e) {
    console.log("TRUE ERROR");
    console.log(e);
    return { error: "something went wrong" };
  }
};

export const editOrganization = async (values: z.infer<typeof OrganizationSchema>, organizationId: string) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    if (!session || !userId || !user || user.userType !== "PROVIDER") {
      return { error: "Unauthorized" };
    }

    const validatedFields = OrganizationSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const currentAddresses = await prismadb.organizationAddress.findMany({
      where: { organizationId },
    });

    const { addresses, ...nonAddressesObj } = values;

    const newAddresses = addresses
      .filter((address) => address.id.includes("new-address-"))
      .map(({ id, ...rest }) => ({ ...rest, organizationId }));

    const addressIdsToDelete = currentAddresses
      .filter((obj1) => !addresses.some((obj2) => obj2.id === obj1.id))
      .map((obj) => obj.id);

    await prismadb.$transaction(
      async (prisma) => {
        await prisma.organization.update({
          where: { id: organizationId },
          data: nonAddressesObj,
        });
        if (newAddresses.length > 0) {
          await prisma.organizationAddress.createMany({
            data: newAddresses,
          });
        }
        if (addressIdsToDelete.length > 0) {
          await prisma.organizationAddress.deleteMany({
            where: { id: { in: addressIdsToDelete } },
          });
        }
        for (const address of addresses) {
          if (!address.id.includes("new-address-")) {
            await prisma.organizationAddress.update({
              where: { id: address.id },
              data: address,
            });
          }
        }
      },

      { timeout: 20000 },
    );

    return {
      success: "Organization updated!",
    };
  } catch (e) {
    console.log("TRUE ERROR");
    console.log(e);
    return { error: "something went wrong" };
  }
};
