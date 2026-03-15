'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import AuthTabs from '@/components/auth/AuthTabs';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleAuthModal from '@/components/auth/GoogleAuthModal';
import { useAppDispatch } from '@/store/store';
import { setCredentials } from '@/store/slices/authSlice';

const Login = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const t = useTranslations('Auth');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = t('requiredField') || 'Email is required';
        } else if (!/^[^\s@]+@gmail\.com$/.test(formData.email.trim().toLowerCase())) {
            newErrors.email = t('invalidEmail') || 'Must be a valid @gmail.com address';
        }

        if (!formData.password) {
            newErrors.password = t('requiredField') || 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isFormValid = formData.email.trim() !== '' && formData.password !== '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage(null);

        if (validateForm()) {
            setIsLoading(true);
            try {
                const response = await apiFetch('/members/login', {
                    method: 'POST',
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.ok) {
                    const userData = { ...data.member, id: data.member._id };
                    dispatch(setCredentials({
                        member: userData,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken
                    }));
                    
                    setStatusMessage({ type: 'success', text: t('welcomeBack') });
                    setTimeout(() => {
                        router.push('/');
                    }, 1500);
                } else {
                    setStatusMessage({ type: 'error', text: data.message || t('loginError') || 'Login failed' });
                }
            } catch (err: any) {
                console.error("Login error:", err);
                setStatusMessage({ type: 'error', text: t('loginError') || 'An error occurred' });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const [googleToken, setGoogleToken] = useState<string | null>(null);

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setGoogleToken(tokenResponse.access_token);
            try {
                const response = await apiFetch('/members/google-login', {
                    method: 'POST',
                    body: JSON.stringify({
                        accessToken: tokenResponse.access_token
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    const userData = { ...data.member, id: data.member._id };
                    dispatch(setCredentials({
                        member: userData,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken
                    }));
                    setStatusMessage({ type: 'success', text: t('welcomeBack') });
                    setTimeout(() => router.push('/'), 1500);
                } else if (data.message === 'إكمال بيانات العمل مطلوب للتسجيل' || data.message === 'Complete business info required') {
                    // Open modal if user doesn't exist yet
                    setIsGoogleModalOpen(true);
                } else {
                    setStatusMessage({ type: 'error', text: data.message });
                }
            } catch (err) {
                setStatusMessage({ type: 'error', text: t('loginError') || 'An error occurred' });
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setStatusMessage({ type: 'error', text: 'Google login failed' });
        }
    });

    const handleGoogleConfirm = async (businessData: { businessName: string; service: string }) => {
        setIsGoogleModalOpen(false);
        setIsLoading(true);
        try {
            const response = await apiFetch('/members/google-login', {
                method: 'POST',
                body: JSON.stringify({
                    accessToken: googleToken,
                    ...businessData
                }),
            });

            const data = await response.json();
            if (response.ok) {
                const userData = { ...data.member, id: data.member._id };
                dispatch(setCredentials({
                    member: userData,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken
                }));
                setStatusMessage({ type: 'success', text: t('welcomeBack') });
                setTimeout(() => router.push('/'), 1500);
            } else {
                setStatusMessage({ type: 'error', text: data.message });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: t('loginError') || 'An error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-cream">
            {/* Left Side - Image Container */}
            <div className="hidden lg:block relative w-1/2 min-h-[100vh]">
                <Image
                    src="/mimo2.jpg"
                    alt="Wedding setup"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <h2 className="text-5xl xl:text-6xl font-bold text-white text-center leading-tight drop-shadow-xl">
                        {t('welcomeToWedding')}
                    </h2>
                </div>
            </div>

            {/* Right Side - Form Container */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12">
                <div className="w-[70%] mx-auto">
                    <AuthTabs />
                    <GoogleAuthModal 
                        isOpen={isGoogleModalOpen} 
                        onClose={() => setIsGoogleModalOpen(false)} 
                        onConfirm={handleGoogleConfirm} 
                    />

                    {/* Header */}
                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-3xl font-semibold text-coffee-800 mb-2">{t('loginTitle')}</h1>
                        <p className="text-coffee-500">{t('loginSubTitle')}</p>
                    </div>

                    {statusMessage && (
                        <div className={`mb-6 p-4 rounded-lg text-sm text-center ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {statusMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-coffee-700">{t('email')}</label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t('emailPlaceholder')}
                                className={`w-full px-4 py-2.5 rounded-[12px] border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 transition-all ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-coffee-700">{t('password')}</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={`w-full px-4 py-2.5 rounded-[12px] border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 transition-all ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Link href="/forgot-password" title={t('forgotPassword')} className="text-sm font-medium text-coffee-600 hover:text-coffee-800 transition-colors">
                                {t('forgotPassword')}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 px-4 font-semibold rounded-xl shadow-lg transition-all duration-300 mt-2 ${
                                isFormValid 
                                    ? 'bg-coffee-800 hover:bg-coffee-700 text-white shadow-coffee-800/20 hover:-translate-y-0.5 cursor-pointer' 
                                    : 'bg-coffee-300 text-coffee-100 cursor-not-allowed'
                            } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isLoading ? t('loading') || '...' : t('loginBtn')}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-coffee-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-cream text-coffee-500">{t('continueWith')}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => loginWithGoogle()}
                        className="cursor-pointer w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-coffee-200 hover:bg-slate-50 text-coffee-800 font-medium rounded-xl transition-colors duration-200 shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        {t('loginGoogle')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;