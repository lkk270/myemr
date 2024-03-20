import { cn } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import { AddressSchema } from "../schema/organization";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

interface AddressAccordionProps {
  address: z.infer<typeof AddressSchema>;
}
export const AddressAccordion = ({ address }: AddressAccordionProps) => {
  return (
    <div>
      <div className="flex flex-col gap-y-1.5" key={address.id}>
        <div className="flex flex-row justify-between gap-2 items-center">
          <Accordion type="multiple" className="space-y-2 w-full">
            <AccordionItem className="border-none flex" value={address.id}>
              <AccordionTrigger
                className={cn(
                  "flex-1 items-center gap-x-2 p-1.5 rounded-md hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
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
          {/* {editingAllowed && (
          <>
            <OpenAddressButton
              numOfCurrentAddresses={watchedAddresses.length}
              initialData={address}
              asChild
              addOrUpdateFunction={updateAddress}
            >
              <Button disabled={isPending || !isEditing} className="w-12 xs:w-20 h-9 items-center" variant={"outline"}>
                <PencilLine className="w-4 h-4 xs:mr-2" />
                <span className="hidden xs:flex">Edit</span>
              </Button>
            </OpenAddressButton>
            <Button
              disabled={isPending || !isEditing}
              onClick={() => removeAddress(address.id)}
              className="w-12 xs:w-20 h-9 text-sm bg-secondary hover:bg-[#3f3132] text-red-500 dark:border-[#463839] border-primary/20 border-[0.5px]"
            >
              <Trash className="w-4 h-4 xs:mr-2 flex xs:hidden" />
              <span className="hidden xs:flex">Delete</span>
            </Button>
          </>
        )} */}
        </div>
        <Separator className="bg-primary/10" />
      </div>
    </div>
  );
};
