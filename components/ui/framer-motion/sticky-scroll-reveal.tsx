"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Heading } from "@/app/(landing)/_components/heading";
import { Navbar } from "@/app/(landing)/_components/navbar";
import { Footer } from "@/app/(landing)/_components/footer";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    // uncomment line 22 and comment line 23 if you DONT want the overflow container and want to have it change on the entire page scroll
    // target: ref
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce((acc, breakpoint, index) => {
      const distance = Math.abs(latest - breakpoint);
      if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
        return index;
      }
      return acc;
    }, 0);
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = ["var(--slate-900)", "var(--black)", "var(--neutral-900)"];
  // const linearGradients = [
  //   "linear-gradient(to bottom right, var(--cyan-500), var(--emerald-500))",
  //   "linear-gradient(to bottom right, var(--pink-500), var(--indigo-500))",
  //   "linear-gradient(to bottom right, var(--orange-500), var(--yellow-500))",
  // ];
  return (
    <motion.div
      // animate={{
      //   backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      // }}
      className="h-[100vh] justify-between flex flex-col overflow-y-auto rounded-md relative"
      ref={ref}
    >
      <div className="bg-[#fbe2e3] absolute top-[-6rem] -z-10 right-[11rem] h-[200vh] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#1F1F1F]"></div>
      <div className="bg-[#dbd7fb] absolute top-[-1rem] -z-10 left-[-35rem] h-[200vh] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#25284a]"></div>
      <div className="pb-28">
        <Navbar scrolled={false} />
      </div>
      <div className="h-[60vh] flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6">
        <Heading />
      </div>
      <div className="px-3 flex justify-center relative space-x-10 bg-transparent">
        <div className="div relative flex items-start px-4">
          <div className="max-w-2xl">
            {content.map((item, index) => (
              <div key={item.title + index} className="my-20">
                <motion.h2
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                  }}
                  className="text-2xl font-bold"
                >
                  {item.title}
                </motion.h2>
                <motion.p
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                  }}
                  className="max-w-sm mt-10"
                >
                  {item.description}
                </motion.p>
              </div>
            ))}
            <div className="h-[240px]" />
          </div>
        </div>
        <motion.div
          // animate={{
          //   background: linearGradients[activeCard % linearGradients.length],
          // }}
          className={cn(
            "shadow-lg shadow-primary/20 text-primary bg-transparent mt-[5%] hidden lg:block h-fit w-[65%] rounded-md sticky top-[20%] overflow-hidden justify-center flex-1",
            contentClassName,
          )}
        >
          {content[activeCard].content ?? null}
        </motion.div>
      </div>
      <Footer />
    </motion.div>
  );
};
