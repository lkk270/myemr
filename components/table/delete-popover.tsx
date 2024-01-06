import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface DeletePopoverProps {
  onConfirmFunc: () => void;
}

export const DeletePopover = ({ onConfirmFunc }: DeletePopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePopover = (e: any) => {
    preventDefaultBehavior(e);
    setIsOpen(!isOpen);
  };
  const closePopover = async (e: any) => {
    // preventDefaultBehavior(e);
    setIsLoading(true);
    onConfirmFunc();
    setIsLoading(false);
    setIsOpen(!isOpen);
  };

  const onConfirmClick = (e: any) => {
    preventDefaultBehavior(e);
  };

  const preventDefaultBehavior = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <div
          role={"menuitem"}
          onClick={togglePopover}
          className="w-full text-sm px-2 py-1.5 rounded-md hover:bg-[#f1f5f9] hover:dark:bg-secondary hover:cursor-pointer"
        >
          Delete
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        onClick={(e: any) => {
          preventDefaultBehavior(e);
        }}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Are you sure?</h4>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 items-center gap-4 text-sm">
              <Button disabled={isLoading} variant="default" onClick={closePopover}>
                Confirm
              </Button>
              <Button disabled={isLoading} variant="outline" onClick={togglePopover}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
