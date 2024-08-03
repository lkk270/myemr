"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAccessPatientCodeByToken } from "@/auth/data";
import { Navbar } from "../../(patient)/_components/navbar";
import { logout } from "@/auth/actions/logout";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);
  const sessionObj = useSession();
  const session = sessionObj.data;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only check session status if the component is mounted to prevent server-side checks
    if (isMounted) {
      if (!session) {
        if (!shouldReload) {
          setShouldReload(true); // Set the reload flag on first check
        } else {
          window.location.reload(); // Reload only if flag is already set, preventing continuous loop
        }
      } else {
        setShouldReload(false); // Reset reload flag if session exists
      }

      // Check if session is expired and log out if it is
      const now = new Date();
      if (session && new Date(session.expires) < now) {
        logout();
      }
    }
  }, [session, isMounted]);

  useEffect(() => {
    if (isMounted && session?.tempToken) {
      const checkValidCode = async () => {
        const data = await getAccessPatientCodeByToken(session.tempToken);
        if (!data) {
          logout();
        }
      };

      checkValidCode();
    }
  }, [session?.tempToken, isMounted]);

  if (!isMounted || shouldReload) {
    return null; // Prevent rendering while waiting for reload or session check
  }

  return (
    <div className="flex overflow-auto h-[95vh] xs:h-screen">
      <Navbar tempAccess={true} />
      <main className="pt-16 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default MainLayout;
