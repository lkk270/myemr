"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@radix-ui/react-separator";

export const PatientHome = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="bg-primary/1 grid grid-rows-2 w-full py-12 lg:h-[calc(100vh-64px)]">
        <div className="container grid items-center gap-4 px-4 text-center md:px-6 lg:gap-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Generate a Code</h2>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Click the button below to generate a unique code for access.
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-4">
            <Button size="lg">Generate Code</Button>
          </div>
        </div>
        <div className="container grid items-center gap-4 px-4 text-center md:px-6 lg:gap-10">
          <Separator className="h-[1px] bg-primary/20" />

          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Add a provider</h2>
            <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed dark:text-gray-400">
              Did a provider share a connect code with you? Enter it here so they can be connected to your account. You can
              always modify their access in{" "}
              <a className="underline" href="/providers">
                providers
              </a>
            </p>
          </div>
          <div className="mx-auto w-full max-w-sm space-y-4">
            <Input placeholder="code" />
          </div>
        </div>
      </div>
      <div className="bg-primary/5 w-full py-12 lg:h-[calc(100vh-64px)]">
        <div className="container grid items-center gap-4 px-4 text-center md:px-6 lg:gap-10">
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
