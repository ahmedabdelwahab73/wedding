'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import FocusFrame from './FocusFrame';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';

const Banner = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [mounted, setMounted] = useState(false);
    const t = useTranslations('Banner');
    const [isSwapped, setIsSwapped] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setIsSwapped((prev) => !prev);
        }, 12000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full flex items-center justify-center bg-cream overflow-hidden pt-16">
            {/* Left Image Side */}
            <div className="absolute left-[-10%] md:left-[0%] lg:left-[5%] top-[10%] md:top-[20%] w-[160px] sm:w-[200px] md:w-[260px] lg:w-[300px] aspect-[3/4] z-10 group shadow-2xl">
                
                {/* Image A */}
                <div className={`absolute top-0 left-0 w-full h-full overflow-hidden transition-opacity duration-1000 ${isSwapped ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                    <Image 
                        src="/mimo2.jpg" 
                        alt="Couple hands photography" 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 300px"
                    />
                    <FocusFrame />
                </div>

                {/* Image B */}
                <div className={`absolute top-0 left-0 w-full h-full overflow-hidden transition-opacity duration-1000 ${isSwapped ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                    <Image 
                        src="/mimo1.jpg" 
                        alt="Secondary photography" 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 300px"
                    />
                    <FocusFrame />
                </div>
            </div>

            {/* Right Image Side */}
            <div className="absolute right-[-10%] md:right-[0%] lg:right-[5%] bottom-[0%] md:bottom-[10%] w-[180px] sm:w-[220px] md:w-[280px] lg:w-[320px] aspect-[3/4] z-10 group shadow-2xl">
                
                {/* Image A */}
                <div className={`absolute top-0 left-0 w-full h-full overflow-hidden transition-opacity duration-1000 ${isSwapped ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                    <Image 
                        src="/mimo1.jpg" 
                        alt="Bride pose outdoors" 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 320px"
                    />
                    <FocusFrame />
                </div>

                {/* Image B */}
                <div className={`absolute top-0 left-0 w-full h-full overflow-hidden transition-opacity duration-1000 ${isSwapped ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                    <Image 
                        src="/mimo2.jpg" 
                        alt="Secondary bride pose" 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 320px"
                    />
                    <FocusFrame />
                </div>
            </div>

            {/* Decorative blurs */}
            <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-coffee-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse" />
            <div className="absolute bottom-[20%] left-[10%] w-72 h-72 bg-coffee-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Central Content Container */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-3xl px-6 md:px-12
             backdrop-blur-[2px] py-10 rounded-3xl">
                
                {/* Badge */}
                <div className="flex items-center justify-center gap-2 px-6 py-2 border border-coffee-400/40 text-coffee-400 mb-8 bg-cream shadow-sm transform transition-transform hover:scale-105 cursor-default">
                    <Camera size={16} strokeWidth={2} className="text-coffee-400" />
                    <span className="text-sm md:text-base font-medium tracking-wider uppercase">{t('badge')}</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl text-coffee-800 leading-[1.15] mb-6 font-medium tracking-tight">
                    {t('capture')} <span className="font-serif italic text-coffee-300 font-light">{t('moments')}</span> <br className="hidden sm:block"/>
                    {t('enhance')} <span className="font-serif italic text-coffee-300 font-light">{t('beauty')}</span>
                </h1>

                {/* Description */}
                <p className="text-base text-coffee-500 mb-10 max-w-[280px] sm:max-w-md md:max-w-xl mx-auto font-light leading-relaxed">
                    {t('description')}
                </p>

                <Link 
                href={(mounted && isAuthenticated) ? "/dashboard" : "/sign-up"}
                className="cursor-pointer bg-coffee-600 hover:bg-coffee-700 text-white px-10 py-4 text-base sm:text-lg font-medium transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-coffee-600/20">
                    {(mounted && isAuthenticated) ? t('dashboard') : t('startnow')}
                </Link>
            </div>
        </section>
    );
};

export default Banner;