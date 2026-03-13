'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

const LanguageToggle = () => {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEnglish = locale === 'en';

  if (!mounted) return null;

  const handleToggle = () => {
    const nextLocale = isEnglish ? 'ar' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={handleToggle}
      className="cursor-pointer relative w-16 h-8 max-ssmd:w-14 max-ssmd:h-7 rounded-full
      bg-gradient-primary
      px-1 transition-all duration-300 hover:shadow-lg hover:scale-105
      focus:outline-none focus:ring-2 focus:ring-[#b0a090] focus:ring-offset-2"
      aria-label="Toggle language"
      dir="ltr"
    >
      {/* Moving Circle */}
      <div
        className={`absolute top-1 left-1 w-6 h-6 max-ssmd:w-5 max-ssmd:h-5 rounded-full bg-white shadow-md
        transition-transform duration-500 ease-in-out
        ${isEnglish ? 'translate-x-8 max-ssmd:translate-x-6.5' : 'translate-x-0'}`}
      />

      {/* Labels */}
      <div className="relative flex justify-between items-center h-full px-1">
        <span
          className={`text-xs max-ssmd:text-[10px] font-bold transition-all duration-300 z-10
          ${!isEnglish ? 'text-black' : 'text-white'}`}
        >
          AR
        </span>

        <span
          className={`text-xs max-ssmd:text-[10px] font-bold transition-all duration-300 z-10
          ${isEnglish ? 'text-black' : 'text-white'}`}
        >
          EN
        </span>
      </div>
    </button>
  );
};

export default LanguageToggle;
