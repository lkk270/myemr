"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { Navbar } from "./_components/navbar";
import { useRef } from "react";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef(null);
  const scrolled = useScrollTop(scrollRef);

  return (
    <div className="overflow-auto h-screen">
      <Navbar scrolled={scrolled} />
      <main ref={scrollRef} className="overflow-auto h-screen pt-40">
        {children}
      </main>
    </div>
  );
};

export default MarketingLayout;
