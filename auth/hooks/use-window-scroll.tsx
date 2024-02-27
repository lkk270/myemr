import { useState, useEffect } from "react";

export const useWindowScroll = (ref: React.RefObject<HTMLElement>, sectionIds: string[]) => {
  const [activeSection, setActiveSection] = useState<string | null>("account");

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      let currentActiveSection = null;
      const currentScroll = ref.current.scrollTop;

      // Loop through each section to find which is currently active
      for (const sectionId of sectionIds) {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
          const sectionTop = sectionElement.offsetTop - 500;
          const sectionBottom = sectionTop + sectionElement.offsetHeight;

          // Check if currentScroll is within the bounds of this section
          if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
            currentActiveSection = sectionId;
            break; // Stop the loop once the active section is found
          }
        }
      }

      setActiveSection(currentActiveSection);
    };

    const element = ref.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, [ref, sectionIds]); // Depend on ref and sectionIds to re-attach event listener if they change

  return activeSection;
};
