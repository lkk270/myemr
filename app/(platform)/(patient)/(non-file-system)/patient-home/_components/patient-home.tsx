"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { GenerateCode } from "./generate-code";

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
      <div className="grid grid-rows-1 w-full py-4 px-4 lg:pr-4 lg:pl-0 gap-y-4 bg-primary/1">
        <div
          className={cn(
            isMobile && "min-w-[90vw]",
            "shadow-lg container grid items-center gap-4 px-4 text-center md:px-6 lg:gap-10 bg-primary/5 dark:bg-[#161616]  rounded-lg",
          )}
        >
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Request Your Records</h2>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Enter your information below to request your records.
            </p>
          </div>
          <div className="mx-auto w-full max-w-[400px] space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" placeholder="Enter your last name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Enter your email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
              </div>
              <Button className="w-full" size="lg">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
