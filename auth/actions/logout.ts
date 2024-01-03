"use server";

import { signOut } from "@/auth";
// import router from "next/navigation";

export const logout = async () => {
  await signOut({ redirect: true, redirectTo: "/" });
};
