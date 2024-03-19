"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useIsLoading } from "@/hooks/use-is-loading";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";

export const NodePageHeader = () => {
  const currentUserPermissions = useCurrentUserPermissions();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { isLoading } = useIsLoading();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div></div>
    </div>
  );
};
