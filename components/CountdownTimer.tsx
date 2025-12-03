'use client';

import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  endDate: string;
  size?: 'default' | 'small';
}

export default function CountdownTimer({ endDate, size = 'default' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!endDate) return;

    const calculateTimeLeft = () => {
      const end = new Date(endDate);
      const now = new Date();
      const difference = end.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const padNumber = (num: number) => num.toString().padStart(2, '0');

  const isSmall = size === 'small';
  const numberSize = isSmall ? 'text-[43px]' : 'text-[54px]';
  const colonSize = isSmall ? 'text-[36px]' : 'text-[45px]';
  const labelSize = isSmall ? 'text-[10px]' : 'text-xs';
  const colonMargin = isSmall ? 'mb-4' : 'mb-5';
  const labelMargin = isSmall ? '-mt-1' : '-mt-2';

  return (
    <div className="text-center">
      <p className={`text-gray-500 mb-0 ${isSmall ? 'text-sm' : ''}`}>Days left to $100K</p>

      <div className="flex items-center justify-center gap-3">
        <div className="text-center">
          <span className={`${numberSize} font-bold text-gray-900`}>{padNumber(timeLeft.days)}</span>
          <p className={`${labelSize} text-gray-500 uppercase tracking-wide ${labelMargin}`}>Days</p>
        </div>
        <span className={`${colonSize} font-bold text-gray-900 ${colonMargin}`}>:</span>
        <div className="text-center">
          <span className={`${numberSize} font-bold text-gray-900`}>{padNumber(timeLeft.hours)}</span>
          <p className={`${labelSize} text-gray-500 uppercase tracking-wide ${labelMargin}`}>Hours</p>
        </div>
        <span className={`${colonSize} font-bold text-gray-900 ${colonMargin}`}>:</span>
        <div className="text-center">
          <span className={`${numberSize} font-bold text-gray-900`}>{padNumber(timeLeft.minutes)}</span>
          <p className={`${labelSize} text-gray-500 uppercase tracking-wide ${labelMargin}`}>Minutes</p>
        </div>
        <span className={`${colonSize} font-bold text-gray-900 ${colonMargin}`}>:</span>
        <div className="text-center">
          <span className={`${numberSize} font-bold text-gray-900`}>{padNumber(timeLeft.seconds)}</span>
          <p className={`${labelSize} text-gray-500 uppercase tracking-wide ${labelMargin}`}>Seconds</p>
        </div>
      </div>
    </div>
  );
}
