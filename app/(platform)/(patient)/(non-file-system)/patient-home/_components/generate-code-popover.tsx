import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { accessTypeTextObjForPatient } from "@/lib/constants";
import { Info } from "lucide-react";

export const GenerateCodePopover = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <Info />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <strong className="leading-none mb-4">Access Types</strong>
        <div className="grid gap-4 px-4 pt-4 text-left text-sm">
          <ul className="list-disc space-y-2">
            {Object.entries(accessTypeTextObjForPatient).map(([key, { title, description }]) => (
              <li key={key}>
                <strong>{title}:</strong> {description}.
              </li>
            ))}
          </ul>
          <span className="text-xs gap-y-0 text-left">
            Regardless of the access level granted, temporary-access users will be unable to delete any of your records
            and will be unable to make modifications to your{" "}
            <a href="/about" className="italic underline">
              about
            </a>{" "}
            page.
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
};
