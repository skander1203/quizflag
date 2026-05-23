import { useEffect, useState } from 'react';
import { animate, useMotionValue, useMotionValueEvent } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(
    decimals > 0 ? (0).toFixed(decimals) : '0',
  );

  useMotionValueEvent(motionValue, 'change', (latest) => {
    setDisplay(
      decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString('fr-FR'),
    );
  });

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [value, motionValue]);

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  );
}
