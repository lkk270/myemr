import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface AboutConnectCodePopoverProps {
  infoClassName?: string;
}
export const AboutConnectCodePopover = ({ infoClassName = "w-5 h-5" }: AboutConnectCodePopoverProps) => {
  const description = `Provide this code to any patient you wish to have access to, or to a patient who wishes for your organization to access their profile.`;

  return (
    <Popover>
      <PopoverTrigger>
        <Info className={infoClassName} />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <strong className="leading-none">Patient Connect Code</strong>
        <div className="grid gap-4 px-4 pt-2 text-left text-sm">
          <p>{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
