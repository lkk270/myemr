"use client";

import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import Image from "next/image";
interface OrganizationAvatarProps {
  profileImageUrl?: string | null;
  buildingClassName: string;
  buildingParentDivPadding?: string;
  imageSize: number;
  roundedClassName?: string;
  imageClassName?: string;
}
export const OrganizationAvatar = ({
  profileImageUrl,
  buildingClassName,
  imageSize,
  roundedClassName = "rounded-sm",
  imageClassName = "rounded-sm",
  buildingParentDivPadding = "p-[6px]",
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
            "bg-gradient-to-r from-indigo-400 via-violet-500 to-violet-600 text-white",
            buildingParentDivPadding,
            roundedClassName,
          )}
        >
          <Building2 className={buildingClassName} />
        </div>
      )}
    </>
  );
};
