"use client"
import React, { useState } from 'react'
import { X, Save, Eye, EyeOff, User, Key } from 'lucide-react'

interface AccountSettingsModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	currentUsername: string;
	onSuccess: (newUsername: string) => void;
	apiFetch: any;
	handleLogout: () => void;
}

const AccountSettingsModal = ({ isOpen, setIsOpen, currentUsername, onSuccess, apiFetch, handleLogout }: AccountSettingsModalProps) => {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: '', text: '' });
	const [formData, setFormData] = useState({
		currentPassword: '',
		newUsername: currentUsername,
		newPassword: ''
	});
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: '', text: '' });

		try {
			const res = await apiFetch('/users/update-credentials', {
				method: 'PUT',
				body: JSON.stringify(formData),
			});

			const data = await res.json();

			if (res.ok) {
				onSuccess(formData.newUsername);
			} else {
				setMessage({ type: 'error', text: data.message || 'حدث خطأ أثناء التحديث' });
			}
		} catch (error) {
			setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم' });
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			{/* Backdrop - Persistent (No onClick) */}
			<div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" />

			<div
				className="relative bg-white border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300"
				dir="rtl"
			>
				{/* Header */}
				<div className="p-8 border-b border-border/50 flex items-center justify-between bg-primary/5">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
							<User size={24} />
						</div>
						<div>
							<h3 className="text-xl font-black text-foreground">إعدادات الحساب</h3>
							<p className="text-xs text-muted-foreground font-medium">قم بتحديث بيانات الدخول الخاصة بك</p>
						</div>
					</div>
					<button
						onClick={() => setIsOpen(false)}
						className="cursor-pointer p-3 hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200/40 rounded-2xl transition-all max-h-[44px]"
					>
						<X size={20} />
					</button>
				</div>

				<div className="p-8">
					{message.text && (
						<div className={`p-4 mb-6 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2 ${message.type === 'success'
								? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
								: 'bg-rose-50 text-rose-600 border border-rose-200'
							}`}>
							{message.text}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6 text-right">
						{/* Username */}
						<div className="space-y-2">
							<label className="text-xs font-black text-muted-foreground/80 mr-1 uppercase tracking-wider">اسم المستخدم</label>
							<div className="relative">
								<input
									type="text"
									name="newUsername"
									value={formData.newUsername}
									onChange={handleChange}
									className="w-full bg-background border-1 border-blue-500/70 focus:border-blue-500 focus:border rounded-2xl px-5 py-3.5 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm"
									placeholder="اسم المستخدم الجديد"
								/>
								<User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5" />
							</div>
						</div>

						{/* Current Password - REQUIRED */}
						<div className="space-y-2 pt-2 border-t border-border/50">
							<label className="text-xs font-black text-muted-foreground/80 mr-1 uppercase tracking-wider flex items-center gap-1">
								<span>كلمة المرور الحالية</span>
								<span className="text-rose-500">(مطلوب)</span>
							</label>
							<div className="relative">
								<input
									type={showCurrentPassword ? "text" : "password"}
									name="currentPassword"
									required
									value={formData.currentPassword}
									onChange={handleChange}
									className="w-full bg-background border-1 border-blue-500/70 focus:border-blue-500 focus:border rounded-2xl px-5 py-3.5 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm"
									placeholder="أدخل كلمة المرور الحالية لإتمام التغيير"
								/>
								<button
									type="button"
									className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors focus:outline-none"
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
								>
									{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
						</div>

						{/* New Password */}
						<div className="space-y-2">
							<label className="text-xs font-black text-muted-foreground/80 mr-1 uppercase tracking-wider">كلمة المرور الجديدة (اختياري)</label>
							<div className="relative">
								<input
									type={showNewPassword ? "text" : "password"}
									name="newPassword"
									value={formData.newPassword}
									onChange={handleChange}
									className="w-full bg-background border-1 border-blue-500/70 focus:border-blue-500 focus:border rounded-2xl px-5 py-3.5 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm"
									placeholder="اتركها فارغة إذا لم ترد التغيير"
								/>
								<button
									type="button"
									className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors focus:outline-none"
									onClick={() => setShowNewPassword(!showNewPassword)}
								>
									{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
								<Key className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 w-5 h-5 hidden" />
							</div>
						</div>

						{/* Action Buttons */}
						<div className="pt-8 flex items-center gap-4">
							<button
								type="submit"
								disabled={loading || !formData.currentPassword}
								className="cursor-pointer flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30 disabled:opacity-50"
							>
								<Save size={20} />
								{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
							</button>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="cursor-pointer px-10 flex items-center justify-center gap-3 bg-red-500 text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30"
							>
								إلغاء
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default AccountSettingsModal;
