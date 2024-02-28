"use client";

import { AvatarComponent } from "@/components/avatar-component";
import { UploadProfilePictureButton } from "./upload-profile-picture-button";
import { Button } from "@/components/ui/button";

export const AvatarButton = () => {
  return (
    <div>
      <AvatarComponent avatarClassName="w-16 h-16" />
      <UploadProfilePictureButton asChild>
        <Button>Upload</Button>
      </UploadProfilePictureButton>
    </div>
  );
};
