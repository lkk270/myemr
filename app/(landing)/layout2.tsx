"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { Navbar } from "./_components/navbar";
import { useRef } from "react";
import { Footer } from "./_components/footer";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef(null);
  const scrolled = useScrollTop(scrollRef);

  return (
    <div className="overflow-auto h-screen">
      <Navbar scrolled={scrolled} />
      <main ref={scrollRef} className="overflow-auto h-screen pt-16">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default MarketingLayout;
