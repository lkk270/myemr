"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "usehooks-ts";
import { GenerateCode } from "./generate-code";
import { RequestRecord } from "./request-records";

export const PatientHome = () => {
  const isMobile = useMediaQuery("(max-width:640px)");
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[728px]">
      <div className="grid grid-rows-2 w-full py-4 px-1 sm:px-4 gap-y-4 bg-primary/1">
        <GenerateCode />
        <div
          className={cn(
            isMobile && "min-w-[90vw]",
            "shadow-lg container grid items-center gap-4 px-4 text-center md:px-6 lg:gap-10 bg-primary/5  dark:bg-[#161616]  rounded-lg",
          )}
        >
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Add a provider</h2>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed dark:text-gray-400">
              Did a provider share a connect code with you? Enter it here so they can be connected to your account. You
              can always modify their access in{" "}
              <a className="underline" href="/providers">
                providers
              </a>
              .
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-4">
            <Input placeholder="code" />
          </div>
        </div>
      </div>
      <div className="grid grid-rows-1 w-full py-4 px-1 sm:px-4 gap-y-4 bg-primary/1">
        <RequestRecord />
      </div>
    </div>
  );
};
