import { useState, useEffect } from "react";

export const useScrollTop = (ref: any, threshold = 10) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current && ref.current.scrollTop > threshold) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
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
  }, [ref, threshold]);

  return scrolled;
};
