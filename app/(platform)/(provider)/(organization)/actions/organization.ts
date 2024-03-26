"use server";

import { z } from "zod";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { v4 as uuidv4 } from "uuid";
import prismadb from "@/lib/prismadb";
import {
  OrganizationSchema,
  InviteMemberSchema,
  JoinOrganizationSchema,
  ChangeOrganizationMemberRoleSchema,
  DeleteOrganizationMemberSchema,
} from "../schema/organization";
import { auth } from "@/auth";
import {
  getInviteMemberCodeByEmail,
  getOrganizationMemberByEmail,
  getOrganizationMemberByUserId,
  getInviteMemberCodeByToken,
} from "../data/organization";
import { getUserByEmail } from "@/auth/data";
import {
  sendInvitedToOrganizationEmailNoAccount,
  sendInvitedToOrganizationEmailHasAccount,
} from "@/auth/lib/mail/mail";
import { OrganizationMemberRole } from "@prisma/client";
import { createOrganizationActivityLog } from "@/lib/actions/organization-activity-log";

export const createOrganization = async (values: z.infer<typeof OrganizationSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    if (!session || !userId || !user || !user.email || user.userType !== "PROVIDER") {
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
          create: { role: "OWNER", userId, email: user.email },
        },
      },
    });

    return {
      success: "Organization created!",
      organizationId: organization.id,
    };
  } catch (e) {
    // console.log("TRUE ERROR");
    // console.log(e);
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

    const organizationMember = await getOrganizationMemberByUserId(organizationId);
    if (!organizationMember || (organizationMember.role !== "OWNER" && organizationMember.role !== "ADMIN")) {
      return { error: "Unauthorized" };
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
    // console.log("TRUE ERROR");
    // console.log(e);
    return { error: "something went wrong" };
  }
};

export const generateInviteMemberToken = async (
  email: string,
  role: OrganizationMemberRole,
  organizationId: string,
) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 72 * 60 * 60 * 1000);

  const existingCode = await getInviteMemberCodeByEmail(email, organizationId);

  if (!!existingCode) {
    await prismadb.organizationInviteCode.delete({
      where: {
        id: existingCode.id,
      },
    });
  }

  const inviteCode = await prismadb.organizationInviteCode.create({
    data: {
      role,
      email: email.toLowerCase(),
      organizationId,
      token,
      expires,
    },
  });
  return inviteCode;
};

export const inviteMember = async (values: z.infer<typeof InviteMemberSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    if (!session || !userId || !user || user.userType !== "PROVIDER") {
      return { error: "Unauthorized" };
    }

    const validatedFields = InviteMemberSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { organizationId, email, role } = values;
    const organizationMember = await getOrganizationMemberByUserId(organizationId);
    if (!organizationMember || (organizationMember.role !== "OWNER" && organizationMember.role !== "ADMIN")) {
      return { error: "Unauthorized" };
    }
    const memberExists = await getOrganizationMemberByEmail(organizationId, email);
    if (!!memberExists) {
      return { error: "Member already exists" };
    }
    const organizationTitle = organizationMember.organization.title;
    const inviteeHasProviderAccount = await getUserByEmail(email, "PROVIDER");
    if (!!inviteeHasProviderAccount) {
      await prismadb.organizationMember.create({
        data: {
          role: role,
          userId: inviteeHasProviderAccount.id,
          email,
          organizationId,
        },
      });
      await sendInvitedToOrganizationEmailHasAccount(email, organizationId, organizationTitle);

      await prismadb.notification.create({
        data: {
          userId: inviteeHasProviderAccount.id,
          notificationType: "ADDED_TO_ORGANIZATION",
          dynamicData: {
            organizationName: organizationTitle,
            role: role,
          },
        },
      });

      await createOrganizationActivityLog(
        {
          organizationId,
          type: "PROVIDER_ADDED",
          dynamicData: {
            email,
            role,
          },
        },
        true,
      );

      revalidatePath(`/organization/${organizationId}/members`);
      return {
        success:
          "Member has been successfully added. Since this member already has a MyEmr provider account with the provided email, they have already been added to the organization.",
      };
      //create a member and send them an email and notification
    } else {
      const inviteCode = await generateInviteMemberToken(email, role, organizationId);
      await sendInvitedToOrganizationEmailNoAccount(email, inviteCode.token, organizationTitle);
      return {
        success:
          "Member has been successfully invited. Since they do not yet have a MyEmr provider account, they will only be added to the organization upon successfully creating an account.",
      };
      //otherwise create an OrganizationInviteCode send them an email
    }
  } catch (e) {
    // console.log("TRUE ERROR");
    // console.log(e);
    return { error: "something went wrong" };
  }
};

export const joinOrganization = async (values: z.infer<typeof JoinOrganizationSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    if (!session || !userId || !user || !user.email || user.userType !== "PROVIDER") {
      return { error: "Unauthorized" };
    }

    const validatedFields = JoinOrganizationSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { inviteToken } = values;

    const existingCode = await getInviteMemberCodeByToken(user.email, inviteToken);

    if (!existingCode) {
      return { error: "Invalid code!" };
    }

    if (existingCode.token !== inviteToken) {
      return { error: "Invalid code!" };
    }

    const hasExpired = new Date(existingCode.expires) < new Date();

    if (hasExpired) {
      return { error: "Code expired!" };
    }

    await prismadb.organizationMember.create({
      data: {
        role: existingCode.role,
        userId,
        email: user.email,
        organizationId: existingCode.organizationId,
      },
    });

    await prismadb.organizationInviteCode.delete({
      where: { id: existingCode.id },
    });

    await createOrganizationActivityLog({
      organizationId: existingCode.organizationId,
      type: "INVITE_ACCEPTED",
      dynamicData: {
        email: user.email,
        role: existingCode.role,
      },
    });

    revalidatePath(`/organization/${existingCode.organizationId}/settings`);

    return {
      success: "You have successfully joined the organization.",
      organizationId: existingCode.organizationId,
    };
  } catch (err) {
    // console.log(err);
    return { error: "Something went wrong" };
  }
};

export const changeRole = async (values: z.infer<typeof ChangeOrganizationMemberRoleSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    if (!session || !userId || !user || !user.email || user.userType !== "PROVIDER") {
      return { error: "Unauthorized" };
    }

    const validatedFields = ChangeOrganizationMemberRoleSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { organizationId, memberId, role } = values;
    const organizationMember = await getOrganizationMemberByUserId(organizationId);
    if (!organizationMember || (organizationMember.role !== "OWNER" && organizationMember.role !== "ADMIN")) {
      return { error: "Unauthorized" };
    }

    await prismadb.organizationMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
    });

    return {
      success: "Role successfully changed",
    };
  } catch (err) {
    // console.log(err);
    return { error: "Something went wrong" };
  }
};

export const deleteMember = async (values: z.infer<typeof DeleteOrganizationMemberSchema>) => {
  try {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id;
    if (!session || !userId || !user || !user.email || user.userType !== "PROVIDER") {
      return { error: "Unauthorized" };
    }

    const validatedFields = DeleteOrganizationMemberSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }
    const { organizationId, memberId } = values;
    const organizationMember = await getOrganizationMemberByUserId(organizationId);
    if (!organizationMember || (organizationMember.role !== "OWNER" && organizationMember.role !== "ADMIN")) {
      return { error: "Unauthorized" };
    }

    await prismadb.organizationMember.delete({
      where: {
        id: memberId,
        role: { not: "OWNER" },
      },
    });

    return {
      success: "Member successfully removed!",
    };
  } catch (err) {
    // console.log(err);
    return { error: "Something went wrong" };
  }
};
