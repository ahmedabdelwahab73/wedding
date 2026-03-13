"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const ToggleModeColor = ({ isScrolled, isBookingPage }: { isScrolled: boolean, isBookingPage?: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsSpinning(true);

    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme('system');
    }

    setTimeout(() => setIsSpinning(false), 600);
  };

  const getCurrentIcon = () => {
    if (!mounted) return <Sun className="w-5 h-5 max-ssmd:w-4 max-ssmd:h-4 text-white opacity-50" />;
    if (theme === 'system') {
      if (systemTheme === 'dark') {
        return <Moon className={`w-5 h-5 max-ssmd:w-4 max-ssmd:h-4 ${(isBookingPage || isScrolled) ? "text-black" : "text-white"}`} />;
      } else {
        return <Sun className="w-5 h-5 max-ssmd:w-4 max-ssmd:h-4 text-white" />;
      }
    } else if (theme === 'dark') {
      return <Moon className={`w-5 h-5 max-ssmd:w-4 max-ssmd:h-4 ${(isBookingPage || isScrolled) ? "text-black" : "text-white"}`} />;
    } else {
      return <Sun className="w-5 h-5 max-ssmd:w-4 max-ssmd:h-4 text-white" />;
    }
  };

  const getIconColor = () => {
    if (!mounted) return "text-white opacity-50";
    if (theme === 'system') {
      return (isBookingPage || isScrolled) && systemTheme === 'dark' ? "text-black" : "text-white";
    } else if (theme === 'dark') {
      return (isBookingPage || isScrolled) ? "text-black" : "text-white";
    } else {
      return "text-white";
    }
  };

  const getButtonLabel = () => {
    if (!mounted) return 'Toggle Theme';
    if (theme === 'system') {
      return `System (${systemTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        outline-none
        relative w-9 h-9 max-ssmd:w-7 max-ssmd:h-7 rounded-full
        bg-gradient-to from-amber-400 to-orange-500
        dark:from-indigo-600 dark:to-purple-700
        shadow-lg hover:shadow-xl
        transition-all duration-300
        overflow-hidden
        group
        cursor-pointer
        ${theme === 'system' ? '' : ''}
      `}
      aria-label={getButtonLabel()}
    >
      <div className={`
        absolute inset-0
        bg-gradient-to from-transparent via-white/30 to-transparent             
        -translate-x-full
        group-hover:translate-x-full
        transition-transform duration-700
        ease-in-out
        
      `} />

      <div className="relative w-full h-full">
        <div className="absolute inset-0 flex items-center justify-center">
          {getCurrentIcon()}
        </div>
      </div>

      <div className={`
        absolute inset-0
        border-2 
        ${getIconColor()}
        rounded-full
        ${isSpinning ? 'animate-spiral-border' : ''}
      `} />
    </button>
  );
}

export default ToggleModeColor;