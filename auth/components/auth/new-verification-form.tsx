"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";

import { newVerification } from "@/auth/actions/new-verification";
import { CardWrapper } from "./card-wrapper";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

interface NewVerificationFormProps {
  userType: "PROVIDER" | "PATIENT";
}

export const NewVerificationForm = ({ userType }: NewVerificationFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const useEffectCalled = useRef(false);
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token, userType)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token, success, error]);

  useEffect(() => {
    if (!useEffectCalled.current) {
      useEffectCalled.current = true;
      onSubmit();
    }
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref={`/auth/${userType.toLowerCase()}-login`}
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader color="#4b59f0" />}
        {success && <FormSuccess message={success} />}
        {!success && error && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};
