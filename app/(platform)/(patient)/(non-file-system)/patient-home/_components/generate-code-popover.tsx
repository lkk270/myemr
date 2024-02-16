import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { accessTypeTextObj } from "@/lib/constants";
import { Info } from "lucide-react";

export const GenerateCodePopover = () => {
  return (
    <Popover>
      <PopoverTrigger className="absolute right-0 top-0 mr-2 mt-2">
        <Info />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <strong className="leading-none mb-4">Access Types</strong>
        <div className="grid gap-4 px-4 pt-4 text-left text-sm">
          <ul className="list-disc space-y-2">
            {Object.entries(accessTypeTextObj).map(([key, { title, description }]) => (
              <li key={key}>
                <strong>{title}:</strong> {description}
              </li>
            ))}
          </ul>
          <span className="text-xs gap-y-0 text-left">
            No matter the access type chosen, the temporary user will <strong>not</strong> have the ability to delete
            anything.
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
};
