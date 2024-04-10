"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Heading } from "@/app/(landing)/_components/heading";
import { Navbar } from "@/app/(landing)/_components/navbar";
import { Footer } from "@/app/(landing)/_components/footer";

import { JoinDropdown } from "@/app/(landing)/_components/join-dropdown";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    bullets?: { title: string; content: string }[];
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
      <div className="pb-24">
        <Navbar scrolled={false} />
      </div>
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6">
        <Heading />
      </div>
      <div className="mt-20 px-3 flex justify-center relative space-x-4 lg:space-x-8 bg-transparent">
        <div className="div relative flex items-start px-4">
          <div className="max-w-md">
            {content.map((item, index) => (
              <div key={item.title + index} className={cn(index === 0 ? "my-0" : "my-20")}>
                <motion.h2
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                  }}
                  className="break-words whitespace-normal text-lg lg:text-2xl font-bold"
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
                  className="text-xs lg:text-sm max-w-md mt-4"
                >
                  {item.description}
                  {item.bullets && (
                    <ul className="mt-2 list-disc list-inside space-y-2 pl-2">
                      {item.bullets.map((bullet, index) => {
                        return (
                          <li key={index}>
                            <strong>{bullet.title} </strong>
                            {bullet.content}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </motion.p>
              </div>
            ))}
            <div className={cn(activeCard === 0 ? "h-[1800px]" : "h-[160px]")} />
          </div>
        </div>
        <motion.div
          // animate={{
          //   background: linearGradients[activeCard % linearGradients.length],
          // }}
          className={cn(
            // activeCard === 2 && "mb-96",
            "shadow-lg shadow-primary/20 text-primary bg-transparent hidden md:block h-fit min-w-[65%] w-full sticky top-[20%] overflow-hidden justify-center flex-1",
            contentClassName,
          )}
        >
          {content[activeCard].content ?? null}
        </motion.div>
      </div>
      <div className="px-4 items-center mb-16 flex flex-row gap-x-5">
        {/* <div className="h-fit min-w-[45%] w-full">
          <Image
            draggable={false}
            src="visit.svg"
            layout="responsive"
            className="rounded-lg"
            width={400}
            height={400}
            alt="Files"
          />
        </div> */}
        {/* <div className="flex flex-col gap-y-2">
          <h1 className="text-xl sm:text-xl font-bold">The healthcare industry should put patients first...</h1>
          <p className="text-md">
            But it doesn't. Instead, patients don't have direct democratized access to their medical records and are
            left paralyzed when it comes to their care.
          </p>
          <p className="text-md">
            If you've ever switched doctors, found a new one, or been referred, you know firsthand the chaos of a new
            doctor navigating disorganized and incomplete records. It's all too familiar—the frustration of being asked
            to undergo tests you've already done. MyEMR changes that, keeping all your records in one easily shareable
            place, streamlining your healthcare experience.
          </p>
        </div> */}
        <div className="flex flex-col items-center">
          <JoinDropdown />
        </div>
      </div>

      <Footer />
    </motion.div>
  );
};
