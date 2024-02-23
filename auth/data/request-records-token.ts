import prismadb from "@/lib/prismadb";

export const getRequestRecordsTokenByToken = async (token: string) => {
  try {
    const requestRecordsToken = await prismadb.requestRecordsToken.findUnique({
      where: { token, expires: { gt: new Date() } },
    });

    return requestRecordsToken;
  } catch {
    return null;
  }
};

export const getRequestRecordsTokenByEmail = async (providerEmail: string, userId: string) => {
  try {
    const requestRecordsToken = await prismadb.requestRecordsToken.findFirst({
      where: { providerEmail, userId, expires: { gt: new Date() } },
    });

    return requestRecordsToken;
  } catch {
    return null;
  }
};
