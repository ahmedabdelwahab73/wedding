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

const SignUp = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const t = useTranslations('Auth');
	const [formData, setFormData] = useState({
		referralCode: '',
		firstName: '',
		lastName: '',
		businessName: '',
		email: '',
		password: '',
		confirmPassword: '',
		service: '',
		termsAccepted: false,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
	const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target as HTMLInputElement;
		const checked = (e.target as HTMLInputElement).checked;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
		// Clear error when user types
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: '' }));
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.firstName.trim()) newErrors.firstName = t('requiredField') || 'First name is required';
		if (!formData.lastName.trim()) newErrors.lastName = t('requiredField') || 'Last name is required';

		if (!formData.email.trim()) {
			newErrors.email = t('requiredField') || 'Email is required';
		} else if (!/^[^\s@]+@gmail\.com$/.test(formData.email.toLowerCase())) {
			newErrors.email = t('invalidEmail') || 'Must be a valid @gmail.com address';
		}

		if (!formData.businessName.trim()) {
			newErrors.businessName = t('requiredField') || 'Business Name is required';
		}

		if (!formData.password) {
			newErrors.password = t('requiredField') || 'Password is required';
		} else if (formData.password.length < 6) {
			newErrors.password = t('passwordTooShort') || 'Password must be at least 6 characters';
		}

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = t('passwordMismatch') || 'Passwords do not match';
		}

		if (!formData.service) newErrors.service = t('requiredField') || 'Service selection is required';

		if (!formData.termsAccepted) newErrors.termsAccepted = t('requiredField') || 'You must accept the terms';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const isFormValid =
		formData.firstName.trim() !== '' &&
		formData.lastName.trim() !== '' &&
		formData.businessName.trim() !== '' &&
		/^[^\s@]+@gmail\.com$/.test(formData.email.trim().toLowerCase()) &&
		formData.password.length >= 6 &&
		formData.password === formData.confirmPassword &&
		formData.service !== '' &&
		formData.termsAccepted;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatusMessage(null);

		if (validateForm()) {
			setIsLoading(true);
			try {
				const response = await apiFetch('/members/add', {
					method: 'POST',
					body: JSON.stringify(formData),
				});

				const data = await response.json();

				if (response.ok) {
					const userData = {
						...data.member,
						id: data.member._id // Ensure consistency with User model
					};
					dispatch(setCredentials({
						member: userData,
						accessToken: data.accessToken,
						refreshToken: data.refreshToken
					}));
					
					setStatusMessage({ type: 'success', text: t('signupSuccess') });
					setTimeout(() => {
						router.push('/');
					}, 2000);
				} else {
					// Handle specific errors like email already exists
					if (data.message === 'البريد الإلكتروني مسجل بالفعل' || data.message === 'This email is already registered') {
						setErrors(prev => ({ ...prev, email: t('emailExists') }));
					} else {
						setStatusMessage({ type: 'error', text: data.message || t('signupError') });
					}
				}
			} catch (err: any) {
				console.error("Sign up error:", err);
				setStatusMessage({ type: 'error', text: t('signupError') });
			} finally {
				setIsLoading(false);
			}
		}
	};

	const [pendingGoogleData, setPendingGoogleData] = useState<{ businessName: string; service: string } | null>(null);

	const loginWithGoogle = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			setIsLoading(true);
			try {
				const response = await apiFetch('/members/google-login', {
					method: 'POST',
					body: JSON.stringify({
						accessToken: tokenResponse.access_token,
						...pendingGoogleData
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
					setStatusMessage({ type: 'success', text: t('signupSuccess') });
					setTimeout(() => router.push('/'), 2000);
				} else {
					setStatusMessage({ type: 'error', text: data.message });
				}
			} catch (err) {
				setStatusMessage({ type: 'error', text: t('signupError') });
			} finally {
				setIsLoading(false);
				setPendingGoogleData(null);
			}
		},
		onError: () => {
			setStatusMessage({ type: 'error', text: 'Google login failed' });
			setPendingGoogleData(null);
		}
	});

	const handleGoogleConfirm = async (businessData: { businessName: string; service: string }) => {
		setPendingGoogleData(businessData);
		setIsGoogleModalOpen(false);
		loginWithGoogle(); // Trigger Google Login after modal confirmation
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
				{/* Overlay gradient for readability if needed */}
				<div className="absolute inset-0 bg-black/40" />

				{/* Text Overlay */}
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
						<h1 className="text-3xl font-semibold text-coffee-800 mb-2">{t('createAccount')}</h1>
						<p className="text-coffee-500">{t('signupDesc')}</p>
					</div>

					{statusMessage && (
						<div className={`mb-6 p-4 rounded-lg text-sm text-center ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
							{statusMessage.text}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4" noValidate>

						<div className="space-y-1">
							<label className="text-sm font-medium text-coffee-700">{t('referral')}</label>
							<input
								type="text"
								name="referralCode"
								value={formData.referralCode}
								onChange={handleChange}
								placeholder={t('referralPlaceholder')}
								className="w-full px-4 py-2 rounded-[8px] border border-coffee-200 bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 focus:border-transparent transition-all"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-1">
								<label className="text-sm font-medium text-coffee-700">{t('firstName')}</label>
								<input
									type="text"
									name="firstName"
									value={formData.firstName}
									onChange={handleChange}
									placeholder={t('firstNamePlaceholder')}
									className={`w-full px-4 py-2 rounded-[8px] border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 focus:border-transparent transition-all ${errors.firstName ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
								/>
								{errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium text-coffee-700">{t('lastName')}</label>
								<input
									type="text"
									name="lastName"
									value={formData.lastName}
									onChange={handleChange}
									placeholder={t('lastNamePlaceholder')}
									className={`w-full px-4 py-2 rounded-[8px] border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 focus:border-transparent transition-all ${errors.lastName ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
								/>
								{errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium text-coffee-700">{t('businessName')}</label>
							<input
								type="text"
								name="businessName"
								value={formData.businessName}
								onChange={handleChange}
								placeholder={t('businessPlaceholder')}
								className={`w-full px-4 py-2 rounded-[8px] border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 focus:border-transparent transition-all ${errors.businessName ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
							/>
							{errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium text-coffee-700">{t('email')}</label>
							<input
								type="text"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder={t('emailPlaceholder')}
								className={`w-full px-4 py-2 rounded-[8px] border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 focus:border-transparent transition-all ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
							/>
							{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-1">
								<label className="text-sm font-medium text-coffee-700">{t('password')}</label>
								<input
									type="password"
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="••••••••"
									className={`w-full px-4 py-2 rounded-[8px] border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 focus:border-transparent transition-all ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
								/>
								{errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
							</div>
							<div className="space-y-1">
								<label className="text-sm font-medium text-coffee-700">{t('confirmPassword')}</label>
								<input
									type="password"
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleChange}
									placeholder="••••••••"
									className={`w-full px-4 py-2 rounded-[8px] border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
								/>
								{errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
							</div>
						</div>

						<div className="space-y-1">
							<label className="text-sm font-medium text-coffee-700">{t('serviceRequired')}</label>
							<div className="relative">
								<select
									name="service"
									value={formData.service}
									onChange={handleChange}
									className={`w-full px-4 py-2 rounded-[8px] border bg-white focus:outline-none focus:ring-1 focus:ring-coffee-400 focus:border-transparent transition-all appearance-none cursor-pointer ${errors.service ? 'border-red-500 ring-1 ring-red-500' : 'border-coffee-200'}`}
									style={{ paddingRight: '2rem' }}
								>
									<option value="" disabled>{t('selectService')}</option>
									<option value="photographer">{t('photographer')}</option>
									<option value="makeupArtist">{t('makeupArtist')}</option>
									<option value="client">{t('client')}</option>
								</select>
								<div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-coffee-500">
									<svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
								</div>
							</div>
							{errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
						</div>

						<div className="flex flex-col space-y-1">
							<div className="flex items-center space-x-3 pt-2 w-full gap-2">
								<input
									type="checkbox"
									id="termsAccepted"
									name="termsAccepted"
									checked={formData.termsAccepted}
									onChange={handleChange}
									className={`w-5 h-5 rounded text-coffee-600 focus:ring-coffee-500 cursor-pointer ${errors.termsAccepted ? 'border-red-500' : 'border-coffee-300'}`}
								/>
								<label htmlFor="termsAccepted" className="text-sm text-coffee-600 cursor-pointer flex-1">
									{t('acceptTerms')} <Link href="/terms" className="text-coffee-800 underline font-medium hover:text-coffee-600 ml-1">{t('termsAndConditions')}</Link>
								</label>
							</div>
							{errors.termsAccepted && <p className="text-red-500 text-xs">{errors.termsAccepted}</p>}
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className={`w-full py-3.5 px-4 font-medium rounded-xl shadow-lg transition-all duration-300 mt-2 ${
								isFormValid 
									? 'bg-coffee-800 hover:bg-coffee-700 text-white shadow-coffee-800/20 hover:-translate-y-0.5 cursor-pointer' 
									: 'bg-coffee-300 text-coffee-100 hover:bg-coffee-400 cursor-pointer shadow-none'
							} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
						>
							{isLoading ? t('loading') || '...' : t('signup')}
						</button>
					</form>

					<div className="relative my-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-coffee-200"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-4 bg-cream text-coffee-500">{t('continueWith')}</span>
						</div>
					</div>

					<button
						type="button"
						onClick={() => setIsGoogleModalOpen(true)}
						className="cursor-pointer w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-coffee-200 hover:bg-slate-50 text-coffee-800 font-medium rounded-xl transition-colors duration-200 shadow-sm"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
							<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
							<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
							<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
						</svg>
						{t('signupGoogle')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default SignUp;