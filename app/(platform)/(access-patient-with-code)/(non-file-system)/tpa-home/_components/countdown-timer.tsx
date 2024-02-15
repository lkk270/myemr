"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  expiredDateTime: Date;
  textSize?: string;
}

export const CountdownTimer = ({ expiredDateTime, textSize = "text-sm" }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentCountdown, setCurrentCountdown] = useState("start");

  const expires = expiredDateTime;

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now(); // Move this inside the updateTimer function.

      let targetDateTime;
      if (now < expires.getTime()) {
        targetDateTime = expires;
        setCurrentCountdown("end");
      } else {
        setIsInitialized(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return; // Both times are in the past, so just exit without setting an interval.
      }

      const distance = targetDateTime.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsInitialized(true);
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Call it once immediately before the interval starts.

    return () => clearInterval(interval);
  }, [expires]);

  if (!isInitialized) {
    return null; // Render nothing until initialized.
  }

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return <div className={`font-bold ${textSize}`}>Session ended</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-1 font-mono text-xl rounded ">
      <div className="flex space-x-4">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className={`font-bold ${textSize}`}>{timeLeft.days}</div>
            <div className={`${textSize}`}>D</div>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className={`font-bold ${textSize}`}>{timeLeft.hours.toString().padStart(2, "0")}</div>
          <div className={`${textSize}`}>H</div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`font-bold ${textSize}`}>{timeLeft.minutes.toString().padStart(2, "0")}</div>
          <div className={`${textSize}`}>M</div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`font-bold ${textSize}`}>{timeLeft.seconds.toString().padStart(2, "0")}</div>
          <div className={`${textSize}`}>S</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
