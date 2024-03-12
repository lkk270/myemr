import { useState, useEffect } from "react";
import { usePatientManageAccountModal } from "./use-patient-manage-account-modal";
// Debounce function to limit the rate at which a function is executed
// A generic type that allows us to specify the function's argument and return types dynamically
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export const useWindowScroll = (ref: React.RefObject<HTMLElement>, sectionIds: string[]) => {
  const [activeSection, setActiveSection] = useState<string | null>("account");
  const { isOpen, defaultScrollTo } = usePatientManageAccountModal();

  useEffect(() => {
    if (!isOpen) {
      setActiveSection(null);
    }
  }, [isOpen]);
  useEffect(() => {
    const handleScroll = debounce(() => {
      // console.log("IN 30");
      if (!ref.current) {
        console.log("Ref not available");
        return;
      }
      if (!isOpen) {
        return;
      }

      let currentActiveSection = null;
      const currentScroll = ref.current.scrollTop;
      console.log("Scrolling, current scroll:", currentScroll);

      for (const sectionId of sectionIds) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
          const sectionTop = sectionElement.offsetTop - 250;
          const sectionBottom = sectionTop + sectionElement.offsetHeight;

          if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
            currentActiveSection = sectionId;
            // console.log("Active section:", currentActiveSection);
            break;
          }
        }
      }

      setActiveSection(currentActiveSection);
    }, 200); // Debounce scroll events by 100ms

    const element = ref.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
    // Ensure the effect runs only when ref or sectionIds change
  }, [ref, sectionIds, isOpen, defaultScrollTo]);

  return activeSection;
};
