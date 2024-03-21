"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganizationStore } from "./hooks/use-organizations";
import { Building2, ArrowRight } from "lucide-react";
import { CreateNewOrganizationButton } from "./buttons/create-new-organization-button";
import Link from "next/link";
import Image from "next/image";
import { InviteMemberButton } from "./buttons/join-organization-button";
import { OrganizationAvatar } from "./organization-avatar";

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
        <CardDescription>
          {organizations.length === 0 ? "Join or create an organization." : "Select, join, or create an organization."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-3">
        {organizations.length > 0 && (
          <>
            <Label>My organizations</Label>
            <div className="max-h-32 overflow-y-scroll">
              {organizations.map((organization, index) => (
                <>
                  <Link
                    href={`/organization/${organization.id}/patients`}
                    key={index}
                    onDragStart={(e) => e.preventDefault()}
                  >
                    <Button
                      variant="outline"
                      className="h-[50px] w-full flex flex-row justify-between items-center px-3 border-none"
                    >
                      <div className="flex flex-row gap-x-2 items-center flex-grow min-w-0">
                        <OrganizationAvatar
                          buildingClassName="w-5 h-5"
                          profileImageUrl={organization.profileImageUrl}
                          imageSize={32}
                          imageClassName="rounded-sm object-cover"
                        />
                        <span className="text-left truncate text-sm flex-grow min-w-0">{organization.title}</span>
                      </div>
                      <div className="flex-shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Button>
                  </Link>
                </>
              ))}
            </div>
            <div className="flex items-center w-full">
              <span className="flex-grow border-t border-primary/20"></span>
              <span className="mx-2 text-sm text-muted-foreground">or</span>
              <span className="flex-grow border-t border-primary/20"></span>
            </div>
          </>
        )}
        <div className="flex flex-col gap-y-3">
          <Label>Join an organization</Label>
          <InviteMemberButton asChild>
            <Button variant={"outline"}>Enter invite code</Button>
          </InviteMemberButton>
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
