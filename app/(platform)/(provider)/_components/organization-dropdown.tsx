"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Building2, Mail, MessageSquare, PlusCircle, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

export const OrganizationDropdown = () => {
  const organizations = [
    {
      id: "abc",
      slug: "cde",
      imageUrl: "https://res.cloudinary.com/ddr7l73bu/image/upload/v1708784793/logo_wuhwbw.png",
      name: "FIRST",
    },
  ];
  const [position, setPosition] = useState("bottom");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-48">
        <Button variant="outline" className="flex flex-row justify-between items-center p-1">
          <div className="flex flex-row gap-x-2 items-center flex-grow min-w-0">
            <div className="rounded-md p-[6px] bg-gradient-to-r from-indigo-400 via-violet-500 to-violet-600 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-left truncate text-sm flex-grow min-w-0">{position}</span>
          </div>
          <div className="flex-shrink-0">
            <ChevronsUpDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Organization</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          {/* <DropdownMenuRadioItem value="adsfsadfasdfsdfasdfsadfsdfsadfsdfsdfsdfsdf"> */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="truncate w-full">first</div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Email</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Message</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>More...</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuRadioItem value="top">
            <div className="truncate w-full">adsfsadfasdfsdfasdfsadfsdfsadfsdfsdfsdfsdf</div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">
            <div className="truncate w-full">adsfsadfasdfsdfasdfsadfsdfsadfsdfsdfsdfsdf</div>
          </DropdownMenuRadioItem>
          {/* Repeat for other items */}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
