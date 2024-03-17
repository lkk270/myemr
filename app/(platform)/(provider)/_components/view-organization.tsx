import { OrganizationWithRoleType } from "@/app/types";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// import { AddressAccordion } from "./address-accordion";
import { cn } from "@/lib/utils";
interface ViewOrganizationProps {
  initialData: OrganizationWithRoleType;
}
export const ViewOrganization = ({ initialData }: ViewOrganizationProps) => {
  return (
    <div className="h-full p-4 w-full max-w-3xl mx-auto">
      <div className="space-y-4">
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-medium">General Information</h3>
          <p className="text-sm text-muted-foreground">General information about your organization</p>
          <Separator className="bg-primary/10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <strong>Title:</strong>
            <p>{initialData.title}</p>
          </div>
          <div>
            <strong>Organization Type:</strong>
            <p>{initialData.organizationType}</p>
          </div>
          <div>
            <strong>Category:</strong>
            <p>{initialData.category}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <strong>Subtitle:</strong>
            <p>{initialData.subTitle}</p>
          </div>
          <div>
            <strong>Description:</strong>
            <p>{initialData.description}</p>
          </div>
        </div>

        <div className="space-y-2 w-full">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <Separator className="bg-primary/10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <strong>Main Email:</strong>
            <p>{initialData.mainEmail}</p>
          </div>
          <div>
            <strong>Main Phone:</strong>
            <p>{initialData.mainPhone}</p>
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
                          <p className="font-semibold leading-none">{address.name}</p>
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
  );
};
