"use client";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";

import { CardWrapper } from "./card-wrapper";

export const ErrorCard = () => {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email is already being used through Google Sign in!"
      : searchParams.get("error") === "AuthorizedCallbackError"
      ? "Email is already being used through email & password sign in!"
      : "Oops! Something went wrong!";
  return (
    <CardWrapper headerLabel={urlError} backButtonHref="/auth/base-login" backButtonLabel="Back to login">
      <div className="w-full flex justify-center items-center">
        <ExclamationTriangleIcon className="text-destructive" />
      </div>
    </CardWrapper>
  );
};
