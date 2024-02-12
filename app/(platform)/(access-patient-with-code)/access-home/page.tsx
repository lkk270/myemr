import { auth } from "@/auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";

const AccessHome = async () => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }
  const user = session?.user;
  console.log(user);

  return <p className="text-indigo-700 text-3xl">Hello ACCESS CODE</p>;
};

export default AccessHome;
