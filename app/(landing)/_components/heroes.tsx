import Image from "next/image";

export const Heroes = () => {
  return (
    // Change flex direction to column-reverse on small screens, default is row
    <div className="flex flex-col gap-y-7">
      <div className="md:gap-x-2 gap-y-4 flex flex-col md:flex-row w-full px-5 items-center justify-between">
        <div className="flex-1 max-w-full md:max-w-[35%] mt-5 md:mt-0">
          Let's talk about it. Here's some text that you want to align to the left of the hero section on larger
          screens, and below the image on smaller screens.
        </div>
        <div className="flex-1 max-w-full md:max-w-[65%] relative">
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
      <div className="md:gap-x-2 gap-y-4 flex flex-col md:flex-row w-full px-5 items-center justify-between">
        <div className="md:hidden flex-1 max-w-full md:max-w-[35%] mt-5 md:mt-0">
          Let's talk about it. Here's some text that you want to align to the left of the hero section on larger
          screens, and below the image on smaller screens.
        </div>
        <div className="flex-1 max-w-full md:max-w-[65%] relative">
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
        <div className="hidden md:flex flex-1 max-w-full md:max-w-[35%] mt-5 md:mt-0">
          Let's talk about it. Here's some text that you want to align to the left of the hero section on larger
          screens, and below the image on smaller screens.
        </div>
      </div>
      <div className="md:gap-x-2 gap-y-4 flex flex-col md:flex-row w-full px-5 items-center justify-between">
        <div className="flex-1 max-w-full md:max-w-[35%] mt-5 md:mt-0">
          Let's talk about it. Here's some text that you want to align to the left of the hero section on larger
          screens, and below the image on smaller screens.
        </div>
        <div className="flex-1 max-w-full md:max-w-[65%] relative">
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
            src="/light-home.png"
            layout="responsive"
            className="dark:hidden rounded-lg shadow-md shadow-secondary"
            width={400}
            height={400}
            alt="Files"
          />
        </div>
      </div>
    </div>
  );
};
