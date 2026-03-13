"use client"
import React, { useState } from 'react';
import { useForm, SubmitHandler } from "react-hook-form"
import { useTranslations, useLocale } from "next-intl"
import { Lock, User, LayoutDashboard, ArrowRight, Eye, EyeOff } from "lucide-react"
import { useRouter } from 'next/navigation';

type Inputs = {
	username: string
	password: string
}

const DashLogin = () => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	const router = useRouter();
	const t = useTranslations("Auth");
	const locale = useLocale();
	const isRtl = locale === 'ar';
	const [showPassword, setShowPassword] = useState(false);
	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<Inputs>();

	React.useEffect(() => {
		// If user somehow navigates back to login, ensure they are logged out.
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('user');
	}, []);

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		try {
			const res = await fetch(`${apiUrl}/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'lang': 'ar', // Keep lang header as requested before
				},
				body: JSON.stringify({ username: data?.username, password: data?.password })
			});

			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.message || 'Failed to login');
			}

			const result = await res.json();

			// Store tokens
			if (result.accessToken) {
				localStorage.setItem('accessToken', result.accessToken);
				localStorage.setItem('refreshToken', result.refreshToken);
				localStorage.setItem('user', JSON.stringify(result.user));
			}

			// redirect or state update
			// window.location.href = '/dashboard'; // Example redirect
			router.replace('/dash-home')
		} catch (err: any) {
			console.error('Login error:', err.message);
			if (err.message.includes('المستخدم') || err.message.toLowerCase().includes('user')) {
				setError('username', { type: 'manual', message: err.message });
			} else {
				setError('password', { type: 'manual', message: err.message });
			}
		}
	}

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
			{/* Decorative elements */}
			<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
			<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl animate-pulse delay-700"></div>

			<div className="w-full max-w-md px-6 relative z-10">
				<div className="bg-card/50 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl space-y-8">
					<div className="text-center space-y-2">
						<div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300">
							<LayoutDashboard className="text-white w-8 h-8" />
						</div>
						<h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent pt-4">
							{t("welcomeBack")}
						</h1>
						<p className="text-muted-foreground text-sm">
							{t("loginDescription")}
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="space-y-4">
							<div className="space-y-1">
								<label className="text-sm font-medium px-1 flex items-center gap-2">
									<User size={14} className="text-primary" />
									{t("username")}
								</label>
								<div className="relative group">
									<input
										{...register("username", { required: t("usernameRequired") })}
										placeholder={t("username")}
										className={`w-full bg-background/50 border ${errors.username ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200`}
									/>
									{errors.username && (
										<p className="text-destructive text-red-500 text-xs mt-1.5 px-1 font-medium">
											{errors.username.message}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium px-1 flex items-center gap-2">
									<Lock size={14} className="text-primary" />
									{t("password")}
								</label>
								<div className="relative group">
									<input
										type={showPassword ? "text" : "password"}
										{...register("password", { required: t("passwordRequired") })}
										placeholder="••••••••"
										className={`w-full bg-background/50 border ${errors.password ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 ${isRtl ? "pl-10" : "pr-10"}`}
									/>
									<button
										type="button"
										className={`cursor-pointer absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none`}
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
									{errors.password && (
										<p className="text-destructive text-red-500 text-xs mt-1.5 px-1 font-medium">
											{errors.password.message}
										</p>
									)}
								</div>
							</div>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full cursor-pointer bg-gradient-primary hover:bg-gradient-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70"
						>
							{isSubmitting ? (
								<div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							) : (
								<>
									{t("submit")}
									<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1" />
								</>
							)}
						</button>
					</form>

					<div className="pt-4 text-center">
						<div className="inline-flex items-center gap-2 text-xs text-muted-foreground/60">
							<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
							{t("dashboardLogin")} Secure Session
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default DashLogin
