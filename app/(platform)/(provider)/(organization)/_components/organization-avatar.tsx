"use client";

import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import Image from "next/image";
interface OrganizationAvatarProps {
  profileImageUrl?: string | null;
  buildingClassName: string;
  buildingParentDivPadding?: string;
  imageSize: number;
  imageClassName?: string;
}
export const OrganizationAvatar = ({
  profileImageUrl,
  buildingClassName,
  imageSize,
  imageClassName = "rounded-sm",
  buildingParentDivPadding = "p-[6px]",
}: OrganizationAvatarProps) => {
  return (
    <>
      {profileImageUrl ? (
        <Image
          draggable={false}
          className={imageClassName}
          width={imageSize}
          height={imageSize}
          src={profileImageUrl}
          alt="image"
        />
      ) : (
        <div
          className={cn(
            "rounded-md bg-gradient-to-r from-indigo-400 via-violet-500 to-violet-600 text-white",
            buildingParentDivPadding,
          )}
        >
          <Building2 className={buildingClassName} />
        </div>
      )}
    </>
  );
};
