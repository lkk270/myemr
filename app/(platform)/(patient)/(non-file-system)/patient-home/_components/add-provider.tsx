"use client";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "usehooks-ts";
import { AddOrganizationButton } from "../../providers/_components/add-organization-button";
import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";

export const AddProvider = () => {
  const isMobile = useMediaQuery("(max-width:640px)");

  return (
    <div
      className={cn(
        //dark:bg-[#161616]
        isMobile && "min-w-[98vw]",
        "relative min-h-[350px] lg:min-h-[200px] shadow-lg flex flex-col gap-y-5 justify-center items-center px-2 sm:px-4 py-6 text-center md:px-6 bg-primary/5 dark:bg-[#161616] rounded-lg",
      )}
    >
      <div className="flex flex-col gap-y-8">
        <h2 className="text-xl font-bold tracking-tighter sm:text-2xl">Add a Provider</h2>
        <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg/relaxed lg:text-base/relaxed dark:text-gray-400">
          Did a provider share a connect code with you? Enter it here so they can be connected to your account. You can
          always modify their access in{" "}
          <a className="underline" href="/providers">
            providers
          </a>
          .
        </p>
      </div>
      <AddOrganizationButton asChild>
        <div>
          <Button className="w-[150px] flex flex-row gap-x-2 border border-primary/5 text-sm" variant="secondary">
            <PackagePlus className="w-5 h-5" />
            <span>Add</span>
          </Button>
        </div>
      </AddOrganizationButton>
    </div>
  );
};
