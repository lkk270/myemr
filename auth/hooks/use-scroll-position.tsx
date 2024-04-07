import { useState, useEffect } from "react";
import { usePatientManageAccountModal } from "./use-patient-manage-account-modal";

export const useScrollPosition = (ref: React.RefObject<HTMLElement>) => {
  const { defaultScrollTo } = usePatientManageAccountModal();
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      if (!ref || !ref.current) {
        return 0;
      }
      setScrollPosition(ref.current.scrollTop);
    };
    window.addEventListener("scroll", updatePosition);
    updatePosition();
    return () => window.removeEventListener("scroll", updatePosition);
  }, [ref.current, defaultScrollTo]);
  return scrollPosition;
};
