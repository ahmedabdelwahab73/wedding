"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashContainer from '../DashContainer/DashContainer';
import { LayoutDashboard, Bell, User, Settings, LogOut, X, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useSidebar } from '../SidebarContext'
import { apiFetch } from '../../../lib/api'
import AccountSettingsModal from './AccountSettingsModal';

const DashHeader = () => {
	const { toggle } = useSidebar();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // Added state
	const dropdownRef = useRef<HTMLDivElement>(null);

	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: '', text: '' });
	const [formData, setFormData] = useState({
		currentPassword: '',
		newUsername: '',
		newPassword: ''
	});
	const [currentUsername, setCurrentUsername] = useState('مسؤول النظام');
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			try {
				const userStr = localStorage.getItem('user');
				if (userStr) {
					const userObj = JSON.parse(userStr);
					const name = userObj.username || userObj.name || 'مسؤول النظام';
					setCurrentUsername(name);
					setFormData(prev => ({ ...prev, newUsername: name }));
				}
			} catch (e) { }
		}
	}, [isSettingsOpen]); // Update when modal opens

	const handleLogout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('user');
		window.location.replace('/mimo');
	};

	const handleUpdateSuccess = (newUsername: string) => {
		if (newUsername) {
			try {
				const userStr = localStorage.getItem('user');
				if (userStr) {
					const userObj = JSON.parse(userStr);
					userObj.username = newUsername;
					userObj.name = newUsername;
					localStorage.setItem('user', JSON.stringify(userObj));
					setCurrentUsername(newUsername);
				}
			} catch (e) { }
		}
		setIsSettingsOpen(false);
		setIsSuccessPopupOpen(true);
		setTimeout(() => {
			setIsSuccessPopupOpen(false);
			handleLogout();
		}, 2500);
	};

	return (
		<>
			<header className='h-16 border-b border-border bg-card/30 backdrop-blur-md sticky top-0 left-0 right-0 z-50 px-0'>
				<DashContainer isHeader className="h-full flex items-center justify-between">
					<div className="flex items-center gap-5">
						<button className="cursor-pointer w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
							onClick={toggle}
						>
							<LayoutDashboard className="text-white w-6 h-6" />
						</button>
						<Link href="/dash-home" className="flex items-center group">
							<span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent hidden sm:block">
								لوحة الإدارة
							</span>
						</Link>
					</div>

					<div className="flex items-center gap-2 md:gap-4">
						{/* Profile Dropdown */}
						<div className="relative" ref={dropdownRef}>
							<div
								className="flex items-center gap-2 md:gap-3 pl-2 cursor-pointer hover:bg-secondary/50 p-1 pr-3 rounded-full transition-all"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							>
								<div className="text-left hidden sm:block">
									<p className="text-sm font-bold leading-tight line-clamp-1">مسؤول النظام</p>
									<p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{currentUsername}</p>
								</div>
								<div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-primary p-[2px]">
									<div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
										<User className="text-primary w-5 h-5 md:w-6 md:h-6" />
									</div>
								</div>
							</div>

							{/* Dropdown Menu */}
							{isDropdownOpen && (
								<div className="absolute left-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
									<button
										onClick={() => {
											setIsSettingsOpen(true);
											setIsDropdownOpen(false);
										}}
										className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary hover:text-primary transition-colors text-right"
									>
										<Settings size={18} />
										<span>اعداد الحساب</span>
									</button>
									<div className="h-px bg-border my-1"></div>
									<button
										onClick={() => {
											setIsLogoutModalOpen(true);
											setIsDropdownOpen(false);
										}}
										className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-secondary hover:text-primary transition-colors text-right"
									>
										<LogOut size={18} />
										<span>تسجيل الخروج</span>
									</button>
								</div>
							)}
						</div>
					</div>
				</DashContainer>
			</header>

			<AccountSettingsModal
				isOpen={isSettingsOpen}
				setIsOpen={setIsSettingsOpen}
				currentUsername={currentUsername}
				onSuccess={handleUpdateSuccess}
				apiFetch={apiFetch}
				handleLogout={handleLogout}
			/>

			{/* Success Popup Modal */}
			{isSuccessPopupOpen && (
				<div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
					<div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-500 p-10 flex flex-col items-center justify-center text-center">
						<div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
							<CheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
						</div>
						<h3 className="text-2xl font-black mb-2">تم التحديث!</h3>
						<p className="text-muted-foreground font-bold mb-6 italic">تم تحديث بيانات الحساب بنجاح بنجاح.</p>
						<p className="text-sm text-primary font-black animate-pulse">جاري تسجيل الخروج...</p>
					</div>
				</div>
			)}

			{/* Logout Confirmation Modal */}
			{isLogoutModalOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
					<div
						className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
						dir="rtl"
					>
						<div className="p-8 pb-10 flex flex-col items-center text-center">
							<div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 shadow-inner text-rose-500">
								<LogOut size={40} className="mr-1" />
							</div>

							<h3 className="text-2xl font-black mb-3">تسجيل الخروج</h3>
							<p className="text-muted-foreground font-medium leading-relaxed mb-8">
								هل أنت متأكد أنك تريد تسجيل الخروج من لوحة التحكم؟
							</p>

							<div className="flex w-full gap-3">
								<button
									onClick={handleLogout}
									className="flex-1 bg-rose-500 text-white py-3.5 rounded-2xl font-black hover:bg-rose-600 transition-all hover:shadow-lg hover:shadow-rose-500/20 active:scale-[0.98]"
								>
									تأكيد الخروج
								</button>
								<button
									onClick={() => setIsLogoutModalOpen(false)}
									className="flex-1 bg-secondary text-foreground py-3.5 rounded-2xl font-bold hover:bg-secondary/70 transition-all active:scale-[0.98]"
								>
									إلغاء
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default DashHeader
