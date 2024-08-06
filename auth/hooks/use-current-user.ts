import { getSession } from "next-auth/react";
import { Session } from "next-auth/types";
import { useState, useEffect } from "react";

export const useCurrentUser = () => {
  const [session, setSession] = useState<null | Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.log(session);
    if (!!session) return;

    const fetchSession = async () => {
      const session = await getSession();
      setSession(session);
      setLoading(false);
      // console.log(session);
    };
    fetchSession();
  }, []);
  return session?.user;
  // const session = useSession();
  // console.log(session);
  // return session.data?.user;
};
