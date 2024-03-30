"use client";

import { cn } from "@/lib/utils";
import { Building2, User } from "lucide-react";
import Image from "next/image";
interface OrganizationAvatarProps {
  profileImageUrl?: string | null;
  buildingClassName: string;
  buildingParentDivPadding?: string;
  imageSize: number;
  roundedClassName?: string;
  imageClassName?: string;
  forUser?: boolean;
}
export const OrganizationAvatar = ({
  profileImageUrl,
  buildingClassName,
  imageSize,
  roundedClassName = "rounded-sm",
  imageClassName = "rounded-sm",
  buildingParentDivPadding = "p-[6px]",
  forUser = false,
}: OrganizationAvatarProps) => {
  return (
    <>
      {profileImageUrl ? (
        <Image
          draggable={false}
          className={cn(imageClassName, roundedClassName)}
          width={imageSize}
          height={imageSize}
          src={profileImageUrl}
          alt="image"
        />
      ) : (
        <div
          className={cn(
            "bg-gradient-to-r text-white",
            forUser ? "from-sky-400 via-sky-700 to-indigo-500" : "from-indigo-400 via-violet-500 to-violet-600",
            buildingParentDivPadding,
            roundedClassName,
          )}
        >
          {forUser ? <User className={buildingClassName} /> : <Building2 className={buildingClassName} />}
        </div>
      )}
    </>
  );
};
