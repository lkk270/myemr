"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizationStore } from "./hooks/use-organizations";
import { Building2, ArrowRight } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { CreateNewOrganizationButton } from "./create-new-organization-button";
import Link from "next/link";

export const OrganizationStart = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { organizations } = useOrganizationStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return null;
  }
  return (
    <Card className="w-[calc(100vw-20px)] sm:w-[465px] lg:w-[550px] shadow-lg shadow-secondary">
      <CardHeader>
        <CardTitle>Get started</CardTitle>
        <CardDescription>Select, join, or create an organization.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-3">
        <div>
          <Label>My organizations</Label>
          {organizations.map((organization, index) => (
            <Link href={`/organization/${organization.id}/patients`} key={index}>
              <Button
                variant="outline"
                className="h-[50px] w-full flex flex-row justify-between items-center px-3 border-none"
              >
                <div className="flex flex-row gap-x-2 items-center flex-grow min-w-0">
                  <div className="rounded-md p-[6px] bg-gradient-to-r from-indigo-400 via-violet-500 to-violet-600 text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-left truncate text-sm flex-grow min-w-0">{organization.title}</span>
                </div>
                <div className="flex-shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex items-center w-full">
          <span className="flex-grow border-t border-primary/20"></span>
          <span className="mx-2 text-sm text-muted-foreground">or</span>
          <span className="flex-grow border-t border-primary/20"></span>
        </div>
        <div className="flex flex-col gap-y-3">
          <Label>Join a organization</Label>
          <Button variant={"outline"}>Enter invite code</Button>
        </div>
        <div className="flex items-center w-full">
          <span className="flex-grow border-t border-primary/20"></span>
          <span className="mx-2 text-sm text-muted-foreground">or</span>
          <span className="flex-grow border-t border-primary/20"></span>
        </div>
        <div className="flex flex-col gap-y-3">
          <Label>Create an organization</Label>
          <CreateNewOrganizationButton asChild>
            <Button variant={"outline"}>Get started</Button>
          </CreateNewOrganizationButton>
        </div>
      </CardContent>
    </Card>
  );
};
