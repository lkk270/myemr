"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CardHeaderComponentProps {
  title: string;
  isEditing: boolean;
  isLoading: boolean;
  handleSave: () => void;
  handleEditToggle: () => void;
  handleCancel: () => void;
  showButtons?: boolean;
}

export const CardHeaderComponent = ({
  title,
  isEditing,
  isLoading,
  handleSave,
  handleEditToggle,
  handleCancel,
  showButtons = true,
}: CardHeaderComponentProps) => (
  <div className="px-8">
    <CardHeader className="px-4 flex flex-row justify-between items-center bg-transparent text-primary/70 rounded-t-xl">
      <CardTitle className="px-0 text-md sm:text-xl">{title}</CardTitle>
      {showButtons && (
        <div className="flex gap-x-4">
          <Button size="xs" disabled={isLoading} onClick={isEditing ? handleSave : handleEditToggle}>
            {isEditing ? (isLoading ? "Saving..." : "Save") : "Edit"}
          </Button>
          {isEditing && !isLoading && (
            <Button size="xs" variant={"destructive"} disabled={isLoading} onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </CardHeader>
    <Separator orientation="horizontal" className="flex mt-2 w-full" />
  </div>
);
