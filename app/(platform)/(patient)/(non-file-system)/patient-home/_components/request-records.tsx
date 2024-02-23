"use client";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "usehooks-ts";
import SignaturePad from "react-signature-canvas";

export const RequestRecord = () => {
  const [imageURL, setImageURL] = useState(null);

  const sigCanvas = useRef<any>({});
  const isMobile = useMediaQuery("(max-width:640px)");

  const onSignatureClear = () => sigCanvas.current.clear();

  /* a function that uses the canvas ref to trim the canvas 
  from white spaces via a method given by react-signature-canvas
  then saves it in our state */
  const onSignatureSave = () => setImageURL(sigCanvas.current.getTrimmedCanvas().toDataURL("image/png"));

  return (
    <div
      className={cn(
        isMobile && "min-w-[90vw]",
        "shadow-lg px-4 text-center md:px-6 bg-primary/5 dark:bg-[#161616] rounded-lg",
      )}
    >
      <div className="space-y-3 pt-10">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Request Your Records</h2>
        <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Enter your information below to request your records.
        </p>
      </div>
      <div className="space-y-4 pt-10">
        <div className="grid grid-cols-1">
          <div className="space-y-2">
            <Label htmlFor="provider-email">Provider's email</Label>
            <Input id="provider-email" placeholder="Provider's email" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signature">Signature</Label>
          <div className="border-primary/50 border rounded-md">
            <SignaturePad
              penColor="#4f5eff"
              onEnd={onSignatureSave}
              ref={sigCanvas}
              canvasProps={{ className: "sigCanvas" }}
            />
          </div>
        </div>
        <Button className="w-full" size="lg">
          Submit
        </Button>
      </div>
    </div>
  );
};
