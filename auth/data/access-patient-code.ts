import prismadb from "@/lib/prismadb";
import { getUserById } from ".";

export const getUserFromAccessPatientCode = async (token: string) => {
  try {
    console.log(token);
    const currentDate = new Date();

    const code = await prismadb.patientProfileAccessCode.findUnique({
      where: {
        token,
        expires: {
          gt: currentDate,
        },
      },
    });
    if (code) {
      const user = await getUserById(code.userId);
      if (!user) return null;
      user.role = code.accessType;
      user.id += "_" + code.id;
      return user;
    } else {
      return null;
    }
  } catch (error) {
    // console.log("28");
    // console.error(error);
    return null;
  }
};

export const getAccessPatientCodeById = async (id: string) => {
  try {
    const currentDate = new Date();
    const code = await prismadb.patientProfileAccessCode.findUnique({
      where: {
        id,
        expires: {
          gt: currentDate,
        },
      },
    });
    // console.log(code);
    return code;
    // return { accessType: "READ_ONLY" };
  } catch (error) {
    // console.log("47");
    // console.error(error);
    return null;
  }
};
