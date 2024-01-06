"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { Navbar } from "./_components/navbar";
import { useRef } from "react";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef(null);
  const scrolled = useScrollTop(scrollRef);

  return (
    <div className="dark:bg-[#1F1F1F] overflow-auto h-screen">
      <Navbar scrolled={scrolled} />
      <main ref={scrollRef} className="overflow-auto h-screen pt-24 sm:pt-36 xs:pt-32">
        {children}
      </main>
    </div>
  );
};

export default MarketingLayout;
