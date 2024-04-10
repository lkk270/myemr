// import Image from "next/image";

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

"use client";
import React from "react";
import { StickyScroll } from "@/components/ui/framer-motion/sticky-scroll-reveal";
import Image from "next/image";

const content = [
  {
    title: "Grant access and/or request your records",
    description:
      "Empower your healthcare journey with unparalleled control over your medical records. Our platform allows you to temporarily grant healthcare providers access to your records. You have the power to specify the duration and type of access, and even select the exact folders they can view. Need your records from a provider? Simply request them through our service, and we'll send a legally notarized document compelling the provider to upload any records they hold on you. Moreover, for providers with a MyEMR account, effortlessly integrate them into your circle by customizing their access, ensuring they have seamless entry to your profile when needed.",
    content: (
      <>
        <Image
          draggable={false}
          src="/dark-home.png"
          layout="responsive"
          className="hidden dark:block"
          width={400}
          height={400}
          alt="Files"
        />
        <Image
          draggable={false}
          src="/light-home.png"
          layout="responsive"
          className="dark:hidden"
          width={400}
          height={400}
          alt="Files"
        />
      </>
    ),
  },
  {
    title: "Real time changes",
    description:
      "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
    content: (
      <>
        <Image
          draggable={false}
          src="/dark-files.png"
          layout="responsive"
          className="hidden dark:block"
          width={400}
          height={400}
          alt="Files"
        />
        <Image
          draggable={false}
          src="/light-files.png"
          layout="responsive"
          className="dark:hidden"
          width={400}
          height={400}
          alt="Files"
        />
      </>
    ),
  },
  {
    title: "Version control",
    description:
      "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
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
  return <StickyScroll content={content} />;
}
