"use client";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { getAccessPatientCodeByToken } from "@/auth/data";
// import { MainNavbar } from "@/components/headers/main-navbar";
import { Navbar } from "../../(patient)/_components/navbar";
import { logout } from "@/auth/actions/logout";

import { startTransition, useEffect, useState } from "react";
// import { NewMedicationModal } from "../../(patient)/(non-file-system)/medications/_components/modals/new-medication-modal";
// import { ViewMedicationModal } from "../../(patient)/(non-file-system)/medications/_components/modals/view-medication-modal";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const sessionObj = useSession();
  const session = sessionObj.data;
  const [isMounted, setIsMounted] = useState(false);

  if (!session) {
    window.location.reload();
  }

  useEffect(() => {
    const now = new Date();
    if (session && new Date(session.expires) < now) {
      logout();
    }
  }, [session]);

  useEffect(() => {
    const checkValidCode = () => {
      startTransition(() => {
        getAccessPatientCodeByToken(session?.tempToken).then((data) => {
          if (!data) {
            logout();
          } else {
            setIsMounted(true);
          }
        });
      });
    };
    checkValidCode();
  }, [session?.tempToken]);

  if (!isMounted) {
    return null;
  }
  return (
    <div className="flex overflow-auto h-[95vh] xs:h-screen">
      <Navbar tempAccess={true} />
      {/* <NewMedicationModal />
      <ViewMedicationModal /> */}
      <main className="pt-16 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default MainLayout;
