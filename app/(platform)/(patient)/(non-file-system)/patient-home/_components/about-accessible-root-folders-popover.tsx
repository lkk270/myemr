import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface AboutAccessibleRootFoldersPopoverProps {
  infoClassName?: string;
  showHeader?: boolean;
  which?: "generateCode" | "addOrganization";
}
export const AboutAccessibleRootFoldersPopover = ({
  showHeader = true,
  infoClassName = "w-5 h-5",
  which = "generateCode",
}: AboutAccessibleRootFoldersPopoverProps) => {
  const description =
    which === "generateCode"
      ? `You can choose which root folders you'd like access to be limited to. For example, you may want a dentist to be limited to only the "Dentist" root
    folder. *Note* It is defaulted to all root folders, so please adjust to your preference.`
      : "";
  return (
    <Popover>
      <PopoverTrigger>
        <Info className={infoClassName} />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col w-80 justify-center items-center">
        <strong className="leading-none mb-2">Accessible Root Folders</strong>
        <div className="grid gap-4 px-4 pt-4 text-left text-sm">
          {showHeader && (
            <p>{`This is only relevant for "Read Only", "Read & Add", and "Full Access" access types.`}</p>
          )}
          <p>{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
