"use client";

import { FaUser } from "react-icons/fa";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/auth/hooks/use-current-user";
import { usePatientForManageAccount } from "@/auth/hooks/use-patient-for-manage-account";
import { useState, useEffect } from "react";
import { profileImageUrlPrefix } from "@/lib/constants";

export const AvatarComponent = ({ avatarClassName = "w-8 h-8" }: { avatarClassName?: string }) => {
  // const [myEmrImageUrl, setMyEmrImageUrl] = useState("");
  const user = useCurrentUser();
  const { patient } = usePatientForManageAccount();
  console.log(user);
  // useEffect(() => {
  //   // Access localStorage here
  //   const storedString = localStorage.getItem(`myEmrImageUrl${user?.id}`);
  //   if (storedString) {
  //     setMyEmrImageUrl(storedString);
  //   }
  // }, []);

  // let imageSrc = patient?.imageUrl || user?.image || myEmrImageUrl;
  // if (imageSrc && myEmrImageUrl && !imageSrc.startsWith(profileImageUrlPrefix)) {
  //   imageSrc = myEmrImageUrl;
  // }

  return (
    <Avatar className={avatarClassName}>
      <AvatarImage src={user?.image || ""} />
      <AvatarFallback className="bg-sky-500">
        <FaUser className="text-white" />
      </AvatarFallback>
    </Avatar>
  );
};
