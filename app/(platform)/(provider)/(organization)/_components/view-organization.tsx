"use client";

import { OrganizationWithRoleType } from "@/app/types";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhoneNumber } from "@/lib/utils";
import { OrganizationAvatar } from "./organization-avatar";
import { useOrganizationStore } from "./hooks/use-organizations";
import { useEffect, useState } from "react";
import { DeleteOrganizationButton } from "./buttons/delete-organization-button";
import { Card } from "@/components/ui/card";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { AboutConnectCodePopover } from "./about-connect-code-popover";
interface ViewOrganizationProps {
  handleEditToggle?: (e: any) => void;
  initialData: OrganizationWithRoleType;
}
export const ViewOrganization = ({ initialData, handleEditToggle }: ViewOrganizationProps) => {
  const currentUserPermissions = useCurrentUserPermissions();
  const { organizations, getOrganizationById } = useOrganizationStore();
  const [profilePicture, setProfilePicture] = useState(getOrganizationById(initialData.id)?.profileImageUrl);
  const editingAllowed =
    (!!initialData &&
      currentUserPermissions.isProvider &&
      (initialData.role === "OWNER" || initialData.role === "ADMIN")) ||
    (!initialData && currentUserPermissions.isProvider);

  useEffect(() => {
    setProfilePicture(getOrganizationById(initialData.id)?.profileImageUrl);
  }, [organizations]);

  return (
    <div className="flex flex-col w-full">
      {currentUserPermissions.isPatient && (
        <Link href="/providers" className="justify-start py-4 px-2 xs:px-8">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs xxs:text-sm">Back</span>
          </Button>
        </Link>
      )}

      <div className="px-2 xs:px-8 flex justify-center w-full max-w-[1500px] pb-28 xs:pb-8">
        <Card className="min-h-full flex-grow transition border border-primary/10 rounded-xl">
          <div className="h-full p-4 w-full max-w-3xl mx-auto">
            <div className="space-y-4">
              <div className="flex flex-row justify-between items-center gap-x-2">
                <div className="flex flex-col gap-y-2">
                  <h3 className="text-lg font-medium">General Information</h3>
                  <p className="hidden xs:flex text-sm text-muted-foreground">
                    General information about your organization
                  </p>
                  {currentUserPermissions.isProvider && (
                    <div className="p-2 flex border border-secondary rounded-lg text-center items-center justify-center h-12 gap-x-2">
                      <span>
                        Patient connect code: <strong>{initialData.connectCode}</strong>
                      </span>

                      <AboutConnectCodePopover />
                    </div>
                  )}
                </div>
                <div className="flex flex-row gap-x-2">
                  {editingAllowed && (
                    <Button
                      className="w-10 xs:w-24 h-9 items-center"
                      variant={"outline"}
                      onClick={(e) => {
                        if (handleEditToggle) {
                          handleEditToggle(e);
                        }
                      }}
                    >
                      <PencilLine className="shrink-0 w-4 h-4 xs:mr-2" />
                      <span className="hidden xs:flex">Edit</span>
                    </Button>
                  )}
                  {initialData.role === "OWNER" && (
                    <DeleteOrganizationButton asChild organizationId={initialData.id}>
                      <Button className="w-10 xs:w-24 h-9 text-sm bg-secondary hover:bg-[#fdf0ef] dark:hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]">
                        <Trash2 className="shrink-0 w-4 h-4 xs:mr-2 flex" />
                        <span className="hidden xs:flex">Delete</span>
                      </Button>
                    </DeleteOrganizationButton>
                  )}
                </div>
              </div>
              <Separator className="bg-primary/10" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="justify-center sm:justify-start flex flex-row gap-x-2 items-center flex-grow min-w-0">
                  <div className="flex flex-col items-center justify-center border-2 border-primary/20 rounded-lg shadow-md w-[150px] h-[150px]">
                    <OrganizationAvatar
                      roundedClassName="rounded-lg"
                      imageClassName="max-h-[136px] max-w-[136px] w-auto"
                      buildingClassName="w-[124px] h-[124px]"
                      profileImageUrl={profilePicture}
                      imageSize={130}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-y-2">
                  <strong>Title:</strong>
                  <p>{initialData.title}</p>
                </div>
                <div className="flex flex-col gap-y-2">
                  <strong>Organization Type:</strong>
                  <p>{initialData.organizationType}</p>
                </div>
                <div className="flex flex-col gap-y-2">
                  <strong>Category:</strong>
                  <p>{initialData.category}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-y-2">
                  <strong>Subtitle:</strong>
                  <p className="break-all whitespace-normal">{initialData.subTitle || "N/A"}</p>
                </div>
                <div className="flex flex-col gap-y-2">
                  <strong>Description:</strong>
                  <p className="break-all whitespace-normal">{initialData.description || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <Separator className="bg-primary/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-2">
                  <strong>Main Email:</strong>
                  <p>{initialData.mainEmail || "N/A"}</p>
                </div>
                <div className="flex flex-col gap-y-2">
                  <strong>Main Phone:</strong>
                  <p>{!!initialData.mainPhone ? formatPhoneNumber(initialData.mainPhone) : "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <h3 className="text-lg font-medium">Addresses</h3>
                <Separator className="bg-primary/10" />
              </div>
              <div>
                {initialData?.addresses?.map((address) => (
                  <div className="flex flex-col gap-y-1.5" key={address.id}>
                    <div className="flex flex-row justify-between gap-2 items-center">
                      <Accordion type="multiple" className="space-y-2 w-full">
                        <AccordionItem className="border-none" value={address.id}>
                          <AccordionTrigger
                            className={cn(
                              "flex items-center gap-x-2 p-1.5 rounded-md hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
                            )}
                          >
                            {address.name}
                          </AccordionTrigger>
                          <AccordionContent className="pt-1 text-primary/70 text-md">
                            <div className="p-4 rounded border border-secondary flex items-center gap-4">
                              <div className="grid gap-2.5">
                                <p className="font-semibold leading-none">
                                  {address.name} {!!address.phone && `| ${formatPhoneNumber(address.phone)}`}
                                </p>
                                <address className="not-italic leading-none space-y-1.5">
                                  <p>{address.address}</p>
                                  <p>{address.address2}</p>
                                  <p>
                                    {address.city}, {address.state}, {address.zipcode}
                                  </p>
                                </address>
                              </div>
                              {/* <Button size="sm">Edit</Button> */}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                    <Separator className="bg-primary/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
