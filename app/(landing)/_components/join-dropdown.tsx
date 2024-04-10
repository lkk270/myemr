"use client";

import { ArrowRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { RegisterButton } from "@/auth/components/auth/register-button";

export const JoinDropdown = ({ triggerVariant }: { triggerVariant?: "gooeyLeftGhostSecondary" }) => {
  const session = useSession();
  const sessionData = session.data;
  const user = sessionData?.user || null;
  return (
    !user && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={triggerVariant ? triggerVariant : "gooeyLeft"}>
            Join MyEMR
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="flex flex-col">
          <RegisterButton mode="modal" asChild userType="PATIENT">
            <Button variant="ghost" size="sm">
              Patient
            </Button>
          </RegisterButton>
          <RegisterButton mode="modal" asChild userType="PROVIDER">
            <Button variant="ghost" size="sm">
              Provider
            </Button>
          </RegisterButton>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  );
};
