"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
// import { MainNavbar } from "@/components/headers/main-navbar";
import { Navbar } from "../(patient)/_components/navbar";
import { Sidebar } from "../(patient)/_components/sidebar";
import { logout } from "@/auth/actions/logout";

import { useEffect } from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const sessionObj = useSession();
  const session = sessionObj.data;

  useEffect(() => {
    const now = new Date();
    if (session && new Date(session.expires) < now) {
      logout();
    }
  }, [session]);

  if (!session) {
    return redirect("/");
  }

  return (
    <div className="flex overflow-auto h-screen">
      <Navbar tempAccess={true} />
      <main className="border-primary/10 pt-16 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default MainLayout;
