'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const AuthTabs = () => {
    const pathname = usePathname();
    const t = useTranslations('Auth');

    const isLogin = pathname.includes('/login');
    const isSignUp = pathname.includes('/sign-up');

    return (
        <div className="flex w-full mb-8 bg-coffee-50/50 p-1.5 rounded-xl border border-coffee-100">
            <Link
                href="/login"
                className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isLogin 
                    ? 'bg-white text-coffee-800 shadow-sm' 
                    : 'text-coffee-500 hover:text-coffee-700'
                }`}
            >
                {t('login')}
            </Link>
            <Link
                href="/sign-up"
                className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isSignUp 
                    ? 'bg-white text-coffee-800 shadow-sm' 
                    : 'text-coffee-500 hover:text-coffee-700'
                }`}
            >
                {t('signup')}
            </Link>
        </div>
    );
};

export default AuthTabs;
