import { PatientDemographicsType } from "@/app/types";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhoneNumber } from "@/lib/utils";
import { calculateBMI } from "@/lib/utils";
import { useCurrentUserPermissions } from "@/auth/hooks/use-current-user-permissions";
import { OrganizationAvatar } from "@/app/(platform)/(provider)/(organization)/_components/organization-avatar";
interface ViewAboutProps {
  handleEditToggle: (e: any) => void;
  initialData: PatientDemographicsType;
}
export const ViewAbout = ({ initialData, handleEditToggle }: ViewAboutProps) => {
  const currentUserPermissions = useCurrentUserPermissions();
  const address = initialData.addresses.length > 0 ? initialData.addresses[0] : undefined;
  console.log(initialData.imageUrl);
  return (
    <div className="h-full p-4 w-full max-w-3xl mx-auto">
      <div className="space-y-4">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium">About</h3>
          </div>
          <div className="flex flex-col gap-y-1">
            {currentUserPermissions.isPatient && (
              <Button
                className="w-32 h-9 items-center"
                variant={"outline"}
                onClick={(e) => {
                  handleEditToggle(e);
                }}
              >
                <PencilLine className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
        <Separator className="bg-primary/10" />
        <div className="justify-center sm:justify-start flex flex-row gap-x-2 items-center flex-grow min-w-0">
          <div className="flex sm:hidden flex-col items-center justify-center border-2 border-primary/20 rounded-lg shadow-md w-[100px] h-[100px]">
            <OrganizationAvatar
              roundedClassName="rounded-lg"
              imageClassName="max-h-[86px] max-w-[86px] w-auto"
              buildingClassName="w-[74px] h-[74px]"
              profileImageUrl={initialData.imageUrl}
              imageSize={80}
              forUser={true}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="hidden sm:flex flex-col items-center justify-center border-2 border-primary/20 rounded-lg shadow-md w-[100px] h-[100px]">
            <OrganizationAvatar
              roundedClassName="rounded-lg"
              imageClassName="max-h-[86px] max-w-[86px] w-auto"
              buildingClassName="w-[74px] h-[74px]"
              profileImageUrl={initialData.imageUrl}
              imageSize={80}
              forUser={true}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <strong>Name:</strong>
            <p className="break-all whitespace-normal">
              {initialData.firstName} {initialData.lastName}
            </p>
          </div>
          <div className="flex flex-col gap-y-2">
            <strong>Date of Birth:</strong>
            <p>{!!initialData.dateOfBirth ? initialData.dateOfBirth : "N/A"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-y-2">
            <strong>Gender:</strong>
            <p>{!!initialData.gender ? initialData.gender : "N/A"}</p>
          </div>
          <div className="flex flex-col gap-y-2">
            <strong>Race:</strong>
            <p>{!!initialData.race ? initialData.race : "N/A"}</p>
          </div>
          <div className="flex flex-col gap-y-2">
            <strong>Marital Status:</strong>
            <p>{!!initialData.maritalStatus ? initialData.maritalStatus : "N/A"}</p>
          </div>
          <div className="flex flex-col gap-y-2">
            <strong>Height:</strong>
            <p>{!!initialData.height ? initialData.height : "N/A"}</p>
          </div>
          <div className="flex flex-col gap-y-2">
            <strong>Weight:</strong>
            <p>{!!initialData.weight ? initialData.weight : "N/A"}</p>
          </div>
          <div className="flex flex-col gap-y-2">
            <strong>BMI:</strong>
            <p>
              {!!initialData.weight && !!initialData.height
                ? calculateBMI("IMPERIAL", initialData.height, initialData.weight)
                : "N/A"}
            </p>
          </div>
        </div>
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <Separator className="bg-primary/10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-2">
            <strong>Mobile Phone:</strong>
            <p>{!!initialData.mobilePhone ? formatPhoneNumber(initialData.mobilePhone) : "N/A"}</p>
          </div>
          <div className="flex flex-col gap-y-2">
            <strong>Home Phone:</strong>
            <p>{!!initialData.homePhone ? formatPhoneNumber(initialData.homePhone) : "N/A"}</p>
          </div>
          <div className="flex flex-col gap-y-2">
            <strong>Email:</strong>
            <p>{initialData.email}</p>
          </div>
        </div>
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-medium">Address</h3>
          <Separator className="bg-primary/10" />
        </div>
        <div>
          {!!address && (
            <div className="flex flex-col gap-y-1.5" key={address.id}>
              <div className="flex flex-row justify-between gap-2 items-center">
                <Accordion type="multiple" className="space-y-2 w-full">
                  <AccordionItem className="border-none" value={address.id}>
                    <AccordionTrigger
                      className={cn(
                        "flex items-center gap-x-2 p-1.5 rounded-md hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
                      )}
                    >
                      {address.address}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 text-primary/70 text-md">
                      <div className="p-4 rounded border border-secondary flex items-center gap-4">
                        <div className="grid gap-2.5">
                          <address className="not-italic leading-none space-y-1.5">
                            <p>{address.address}</p>
                            <p>{address.address2}</p>
                            <p>
                              {address.city}, {address.state}, {address.zipcode}
                            </p>
                          </address>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
