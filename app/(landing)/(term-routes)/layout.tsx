"use client";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { Navbar } from "../_components/navbar";
import { useRef } from "react";
import dynamic from "next/dynamic";
const Footer = dynamic(() => import("@/app/(landing)/_components/footer"), { ssr: false });

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = useRef(null);
  const scrolled = useScrollTop(scrollRef);

  return (
    <div className="overflow-auto h-[95vh] xs:h-screen py-10 xs:py-0">
      <Navbar scrolled={scrolled} />
      <main ref={scrollRef} className="pt-16">
        {children}
        <Footer />
      </main>
    </div>
  );
};

export default MarketingLayout;
