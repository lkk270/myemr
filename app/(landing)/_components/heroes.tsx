import Image from "next/image";

export const Heroes = () => {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl">
      <div className="flex items-center gap-x-10">
        <div className="relative w-[250px] h-[250px] xxs:w-[300px] xxs:h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
          <Image draggable={false} src="/files2.svg" fill className="object-contain" alt="Files" />
        </div>
        <div className="relative h-[400px] w-[400px] hidden md:flex">
          <Image src="/preparation.svg" fill className="object-contain" draggable={false} alt="Preparation" />
        </div>
      </div>
    </div>
  );
};
