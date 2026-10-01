import { useState, useEffect } from 'react';

/**
 * Animated counter hook that smoothly counts up to target value.
 */
export const useAnimatedCounter = (endValue, durationMs = 2000, trigger = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    // Parse target number
    const numericTarget = typeof endValue === 'number' 
      ? endValue 
      : parseFloat(String(endValue).replace(/,/g, ''));
    
    if (isNaN(numericTarget)) {
      setCount(endValue);
      return;
    }

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease out cubic function
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * numericTarget * 10) / 10);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(numericTarget);
      }
    };

    window.requestAnimationFrame(step);
  }, [endValue, durationMs, trigger]);

  return count;
};

export default useAnimatedCounter;
