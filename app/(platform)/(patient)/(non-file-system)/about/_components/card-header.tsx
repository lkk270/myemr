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
}

export const CardHeaderComponent = ({
  title,
  isEditing,
  isLoading,
  handleSave,
  handleEditToggle,
  handleCancel,
}: CardHeaderComponentProps) => (
  <>
    <CardHeader className="flex flex-row justify-between items-center bg-transparent text-primary/70 rounded-t-xl">
      <CardTitle className="text-md sm:text-xl">{title}</CardTitle>
      <div className="flex gap-x-4">
        <Button size="sm" disabled={isLoading} onClick={isEditing ? handleSave : handleEditToggle}>
          {isEditing ? (isLoading ? "Saving..." : "Save") : "Edit"}
        </Button>
        {isEditing && !isLoading && (
          <Button size="sm" variant={"destructive"} disabled={isLoading} onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>
    </CardHeader>
    <Separator orientation="horizontal" className="flex mt-2 w-full" />
  </>
);