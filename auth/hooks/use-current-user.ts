import { Session } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useCurrentUser = () => {
  const [session, setSession] = useState<null | Session>(null);
  const [loading, setLoading] = useState(true);

  const { data: currentSession, status } = useSession(); // Using useSession to track session changes

  useEffect(() => {
    if (currentSession) {
      setSession(currentSession);
      setLoading(false);
    } else if (status !== "loading") {
      const fetchSession = async () => {
        const session = await getSession();
        setSession(session);
        setLoading(false);
        // console.log(session);
      };
      fetchSession();
    }
  }, [currentSession, status]); // Dependency on the session data and status

  return session?.user;
};
