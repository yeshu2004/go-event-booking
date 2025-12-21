import { useEffect, useState } from "react";
import { data } from "react-router";

function Timer({ date }) {
  const eventTime = new Date(date).getTime();

  const getTimeLeft = () => {
    const now = Date.now();
    const diff = eventTime - now;

    if (diff <= 0) return null;

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 60000);

    return () => clearInterval(interval);
  },[data.date]);

  return (
    <div className="flex items-center justify-center">
      {!timeLeft ? (
        <p className="">
          Event has started
        </p>
      ) : (
        <div className="flex">
          <Box label="DAYS" value={timeLeft.days} />
          <Box label="HRS" value={timeLeft.hours} />
          <Box label="MIN" value={timeLeft.minutes} />
        </div>
      )}
    </div>
  )
}

function Box({ label, value }) {
  return (
    <div className="text-white text-center min-w-[55px]">
      <div className="">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] tracking-widest text-gray-300">
        {label}
      </div>
    </div>
  );
}

export default Timer;
