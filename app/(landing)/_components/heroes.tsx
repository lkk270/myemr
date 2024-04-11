"use client";
import React from "react";
import { StickyScroll } from "@/components/ui/framer-motion/sticky-scroll-reveal";
import Image from "next/image";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { Heading } from "./heading";

// export const Heroes = () => {
//   return (
//     // Change flex direction to column-reverse on small screens, default is row
//     <div className="flex flex-col gap-y-7">
//       <div className="md:gap-x-2 gap-y-4 flex flex-col md:flex-row w-full px-5 items-center justify-between">
//         <div className="flex-1 max-w-full md:max-w-[35%] mt-5 md:mt-0">
//           Let's talk about it. Here's some text that you want to align to the left of the hero section on larger
//           screens, and below the image on smaller screens.
//         </div>
//         <div className="flex-1 max-w-full md:max-w-[65%] relative">
//           <Image
//             draggable={false}
//             src="/dark-home.png"
//             layout="responsive"
//             className="rounded-lg shadow-md shadow-secondary hidden dark:block"
//             width={400}
//             height={400}
//             alt="Files"
//           />
//           <Image
//             draggable={false}
//             src="/light-home.png"
//             layout="responsive"
//             className="dark:hidden rounded-lg shadow-md shadow-secondary"
//             width={400}
//             height={400}
//             alt="Files"
//           />
//         </div>
//       </div>
//       <div className="md:gap-x-2 gap-y-4 flex flex-col md:flex-row w-full px-5 items-center justify-between">
//         <div className="md:hidden flex-1 max-w-full md:max-w-[35%] mt-5 md:mt-0">
//           Let's talk about it. Here's some text that you want to align to the left of the hero section on larger
//           screens, and below the image on smaller screens.
//         </div>
//         <div className="flex-1 max-w-full md:max-w-[65%] relative">
//           <Image
//             draggable={false}
//             src="/dark-files.png"
//             layout="responsive"
//             className="rounded-lg shadow-md shadow-secondary hidden dark:block"
//             width={400}
//             height={400}
//             alt="Files"
//           />
//           <Image
//             draggable={false}
//             src="/light-files.png"
//             layout="responsive"
//             className="dark:hidden rounded-lg shadow-md shadow-secondary"
//             width={400}
//             height={400}
//             alt="Files"
//           />
//         </div>
//         <div className="hidden md:flex flex-1 max-w-full md:max-w-[35%] mt-5 md:mt-0">
//           Let's talk about it. Here's some text that you want to align to the left of the hero section on larger
//           screens, and below the image on smaller screens.
//         </div>
//       </div>
//       <div className="md:gap-x-2 gap-y-4 flex flex-col md:flex-row w-full px-5 items-center justify-between">
//         <div className="flex-1 max-w-full md:max-w-[35%] mt-5 md:mt-0">
//           Let's talk about it. Here's some text that you want to align to the left of the hero section on larger
//           screens, and below the image on smaller screens.
//         </div>
//         <div className="flex-1 max-w-full md:max-w-[65%] relative">
//           <Image
//             draggable={false}
//             src="/dark-meds.png"
//             layout="responsive"
//             className="rounded-lg shadow-md shadow-secondary hidden dark:block"
//             width={400}
//             height={400}
//             alt="Files"
//           />
//           <Image
//             draggable={false}
//             src="/light-meds.png"
//             layout="responsive"
//             className="dark:hidden rounded-lg shadow-md shadow-secondary"
//             width={400}
//             height={400}
//             alt="Files"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

const content = [
  // {
  //   title: "The healthcare industry should put patients first...",
  //   description:
  //     "But it doesn't. Instead, patients don't have direct democratized access to their medical records and are left paralyzed when it comes to their care. If you've ever switched doctors, found a new one, or been referred, you know firsthand the chaos of a new doctor navigating disorganized and incomplete records. It's all too familiar—the frustration of being asked to undergo tests you've already done. MyEMR changes that, keeping all your records in one easily shareable place, streamlining your healthcare experience.",
  //   content: (
  //     <>
  //       <Image
  //         draggable={false}
  //         src="/waiting_room.jpeg"
  //         layout="responsive"
  //         className="block rounded-lg shadow-md shadow-secondary"
  //         width={400}
  //         height={400}
  //         alt="Files"
  //       />
  //     </>
  //   ),
  // },
  {
    title: "Grant access and/or request your records",
    description:
      "Enhance your healthcare management by precisely controlling access to your medical records and seamlessly requesting them from providers. Our platform enables you to:",
    bullets: [
      {
        title: "Grant Temporary Access:",
        content:
          "Specify the duration, type, and folders of access for healthcare providers to view and/or edit your medical records.",
      },
      {
        title: "Request Records:",
        content:
          "Securely request your records from any provider with a legally notarized document, ensuring prompt compliance.",
      },
      {
        title: "Customize Provider Access:",
        content:
          "For providers with a MyEMR account, effortlessly tailor their access for direct and easy integration with your profile.",
      },
    ],
    content: (
      <>
        <Image
          draggable={false}
          src="/dark-home.png"
          layout="responsive"
          className="rounded-lg shadow-md shadow-secondary hidden dark:block"
          width={400}
          height={400}
          alt="Files"
        />
        <Image
          draggable={false}
          src="/light-home.png"
          layout="responsive"
          className="rounded-lg shadow-md shadow-secondary dark:hidden"
          width={400}
          height={400}
          alt="Files"
        />
      </>
    ),
  },
  {
    title: "Securely store files",
    description:
      "Securely store files with MyEMR’s comprehensive file system, designed to keep your medical records organized, private, and accessible.",
    content: (
      <>
        <Image
          draggable={false}
          src="/dark-files.png"
          layout="responsive"
          className="rounded-lg shadow-md shadow-secondary hidden dark:block"
          width={400}
          height={400}
          alt="Files"
        />
        <Image
          draggable={false}
          src="/light-files.png"
          layout="responsive"
          className="rounded-lg shadow-md shadow-secondary dark:hidden"
          width={400}
          height={400}
          alt="Files"
        />
      </>
    ),
  },
  {
    title: "Medications",

    description:
      "Keep a clear record of your medications and dosages through MyEMR, ensuring your medical history is up-to-date and in one place.",
    content: (
      //div className="flex-1 max-w-full md:max-w-[65%] relative"
      <>
        <Image
          draggable={false}
          src="/dark-meds.png"
          layout="responsive"
          className="rounded-lg shadow-md shadow-secondary hidden dark:block"
          width={400}
          height={400}
          alt="Files"
        />
        <Image
          draggable={false}
          src="/light-meds.png"
          layout="responsive"
          className="dark:hidden rounded-lg shadow-md shadow-secondary"
          width={400}
          height={400}
          alt="Files"
        />
      </>
    ),
  },
  // {
  //   title: "Running out of content",
  //   description:
  //     "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
  //   content: (
  //     <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
  //       Running out of content
  //     </div>
  //   ),
  // },
];
export function StickyScrollRevealDemo() {
  return (
    <>
      <div className="md:flex hidden">
        <StickyScroll content={content} />
      </div>
      <div className="overflow-auto h-screen">
        <Navbar scrolled={true} />
        <main className="overflow-auto h-screen pt-16">
          <div className="min-h-full flex flex-col pt-4 xs:pt-8 sm:pt-12">
            <div className="flex flex-col items-center justify-center md:justify-start text-center flex-1 px-0 xxs:px-2 pb-3 sm:pb-6">
              <div className="bg-[#fbe2e3] absolute top-[-6rem] -z-10 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#1F1F1F]"></div>
              <div className="bg-[#dbd7fb] absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#25284a]"></div>
              <Heading />
              {/* <Heroes /> */}
              <div className="overflow-auto flex md:hidden flex-col gap-y-7">
                <div className="gap-y-4 flex flex-col w-full px-5 items-center justify-between">
                  <div className="font-bold flex-1 max-w-full">{content[0].title}</div>
                  <div className="flex-1 max-w-full relative">
                    <Image
                      draggable={false}
                      src="/dark-home.png"
                      layout="responsive"
                      className="rounded-lg shadow-md shadow-secondary hidden dark:block"
                      width={400}
                      height={400}
                      alt="Files"
                    />
                    <Image
                      draggable={false}
                      src="/light-home.png"
                      layout="responsive"
                      className="dark:hidden rounded-lg shadow-md shadow-secondary"
                      width={400}
                      height={400}
                      alt="Files"
                    />
                  </div>
                </div>
                <div className="gap-y-4 flex flex-col w-full px-5 items-center justify-between">
                  <div className="font-bold flex-1 max-w-full mt-3">{content[1].title}</div>
                  <div className="flex-1 max-w-full relative">
                    <Image
                      draggable={false}
                      src="/dark-files.png"
                      layout="responsive"
                      className="rounded-lg shadow-md shadow-secondary hidden dark:block"
                      width={400}
                      height={400}
                      alt="Files"
                    />
                    <Image
                      draggable={false}
                      src="/light-files.png"
                      layout="responsive"
                      className="dark:hidden rounded-lg shadow-md shadow-secondary"
                      width={400}
                      height={400}
                      alt="Files"
                    />
                  </div>
                </div>
                <div className="gap-y-4 flex flex-col w-full px-5 items-center justify-between">
                  <div className="font-bold flex-1 max-w-full mt-3">{content[2].title}</div>
                  <div className="flex-1 max-w-full relative">
                    <Image
                      draggable={false}
                      src="/dark-meds.png"
                      layout="responsive"
                      className="rounded-lg shadow-md shadow-secondary hidden dark:block"
                      width={400}
                      height={400}
                      alt="Files"
                    />
                    <Image
                      draggable={false}
                      src="/light-meds.png"
                      layout="responsive"
                      className="dark:hidden rounded-lg shadow-md shadow-secondary"
                      width={400}
                      height={400}
                      alt="Files"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </>
  );
}

// import { Footer } from "./_components/footer";
// import { Heading } from "./_components/heading";
// import { Heroes } from "./_components/heroes";

// const MarketingPage = () => {
//   return (
//     <div className="min-h-full flex flex-col xs:pt-8 sm:pt-12">
//       <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-6 pb-10">
//         <div className="bg-[#fbe2e3] absolute top-[-6rem] -z-10 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[10rem] sm:w-[68.75rem] dark:bg-[#1F1F1F]"></div>
//         <div className="bg-[#dbd7fb] absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[10rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#25284a]"></div>
//         <Heading />
//         <Heroes />
//       </div>
//       {/* <Footer /> */}
//     </div>
//   );
// };

// export default MarketingPage;
