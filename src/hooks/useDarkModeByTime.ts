import { useState, useEffect } from 'react';

/**
 * Hook to determine dark mode based on time of day
 * Dark mode is active between 6 PM (18:00) and 6 AM (06:00)
 * 
 * @returns {boolean} true if dark mode should be active
 * 
 * @example
 * const isDark = useDarkModeByTime();
 */
export function useDarkModeByTime(): boolean {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const checkDarkMode = (): boolean => {
      const now = new Date();
      const hour = now.getHours();
      return hour >= 18 || hour < 6;
    };

    const updateDarkMode = () => {
      setIsDark(checkDarkMode());
    };

    // Update immediately on mount (client-side only)
    updateDarkMode();

    // Check every minute to ensure dark mode updates when time changes
    const interval = setInterval(updateDarkMode, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  return isDark;
}

