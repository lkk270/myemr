import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import { accessTypeTextObjForTemp, AllowedRoles } from "@/lib/constants";

interface AccessTypePopoverProps {
  accessType: AllowedRoles;
}

export const AccessTypePopover = ({ accessType }: AccessTypePopoverProps) => {
  const accessTypeObj = accessTypeTextObjForTemp[accessType];
  return (
    <Popover>
      <PopoverTrigger>
        <Info className="w-4 h-4" />
      </PopoverTrigger>
      <PopoverContent className="px-2 w-72 flex flex-col items-center">
        <strong className="items-center leading-none mb-2">{accessTypeObj.title}</strong>
        <div className="text-sm">All organization members, irrespective of their role {accessTypeObj.description}.</div>
      </PopoverContent>
    </Popover>
  );
};
