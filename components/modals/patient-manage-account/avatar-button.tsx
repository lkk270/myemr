"use client";

import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { AvatarComponent } from "@/components/avatar-component";

export const AvatarButton = () => {
  const user = useCurrentUser();
  return (
    <div>
      <AvatarComponent avatarClassName="w-16 h-16" />
    </div>
  );
};
