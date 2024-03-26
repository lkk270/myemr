"use client";

import { AvatarComponent } from "@/components/avatar-component";


export const AvatarButton = () => {
  return (
    <div className="flex flex-row justify-center">
      <AvatarComponent avatarClassName="w-16 h-16" />
    </div>
  );
};
