import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface AboutAccessibleRootFoldersPopoverProps {
  infoClassName?: string;
  which?: "generateCode" | "addOrganization";
}
export const AboutAccessibleRootFoldersPopover = ({
  infoClassName = "w-5 h-5",
  which = "generateCode",
}: AboutAccessibleRootFoldersPopoverProps) => {
  const description =
    which === "generateCode"
      ? `You can choose which root folders you'd like the access code to be limited to. For example, you may want an
    access code you are generating for a dentist to limit its visible root folders to just the "Dentist" root
    folder. *Note* It is defaulted to all root folders, so please adjust to your preference.`
      : "";
  return (
    <Popover>
      <PopoverTrigger>
        <Info className={infoClassName} />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <strong className="leading-none mb-4">Accessible Root Folders</strong>
        <div className="grid gap-4 px-4 pt-4 text-left text-sm">
          <p>This is only relevant for "Read Only", "Read & Add", and "Full Access" access types.</p>
          <p>{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
