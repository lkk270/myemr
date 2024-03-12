import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { CountdownTimer } from "@/app/(platform)/(access-patient-with-code)/(non-file-system)/tpa-home/_components/countdown-timer";

interface UploadRecordsNavbarProps {
  expires: Date;
}

export const UploadRecordsNavbar = ({ expires }: UploadRecordsNavbarProps) => {
  return (
    <div className="dark:bg-[#1f1f1f] bg-[#f8f7f7] fixed z-[50] flex items-center justify-between w-full h-16 px-4 py-2 border-b border-primary/10">
      <div className="flex items-center">
        <Logo />
      </div>
      <div className="flex items-center">
        <CountdownTimer expiredDateTime={expires} />
        <div className="flex items-center sm:flex gap-x-4 justify-center">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};
