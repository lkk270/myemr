import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DosageHistory } from "@prisma/client";

interface DosageHistoryPopoverProps {
  dosageHistory: DosageHistory[];
}

export const DosageHistoryPopover = ({ dosageHistory }: DosageHistoryPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-[4px] text-xs" variant="outline">
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dosage History</h4>
            <p className="text-sm text-muted-foreground">Ordered from most to least recent</p>
          </div>
          <div className="grid gap-2">
            {dosageHistory.map((history, index) => {
              return (
                <div className="grid grid-cols-3 items-center gap-4 text-sm" key={index}>
                  <span>{history.createdAt.toISOString().split("T")[0]}</span>
                  <span>{`${history.dosage} ${history.dosageUnits}/${history.frequency}`}</span>
                </div>
              );
            })}
            {dosageHistory.length === 0 && <div className="grid items-center gap-4 text-sm">No dosage history.</div>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
