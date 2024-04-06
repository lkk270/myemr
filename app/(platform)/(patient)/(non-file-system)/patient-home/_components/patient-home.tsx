"use client";

import { GenerateCode } from "./generate-code";
import { RequestRecord } from "./request-records";
import { AddProvider } from "./add-provider";

export const PatientHome = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[728px] xs:pb-0 pb-28">
      <div className="grid grid-rows-2 w-full py-4 px-1 sm:px-4 gap-y-4 bg-primary/1">
        <GenerateCode />
        <AddProvider />
      </div>
      <div className="w-full h-full flex flex-col justify-center pb-4 lg:py-4 px-1 sm:px-4 gap-y-4 bg-primary/1">
        <RequestRecord />
      </div>
    </div>
  );
};
