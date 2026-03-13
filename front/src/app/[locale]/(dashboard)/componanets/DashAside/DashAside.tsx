"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	LayoutDashboard,
	Image as ImageIcon,
	Package,
	MessageSquare,
	LogOut,
	ChevronLeft,
	Home,
	X
} from 'lucide-react'
import Image from 'next/image'
import Blacklogo from '@/public/logoblack.png'
import { useSidebar } from '../SidebarContext'
import { useLocale } from 'next-intl'

const DashAside = () => {
	const pathname = usePathname()
	const { isOpen, close } = useSidebar()
	const locale = useLocale();
	const [dynamicLogo, setDynamicLogo] = React.useState<string | null>(null);

	React.useEffect(() => {
		const fetchLogo = async () => {
			try {
				const base_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
				const res = await fetch(`${base_url}/api/logos`, {
					headers: {
						'lang': locale
					}
				});
				if (res.ok) {
					const data = await res.json();
					if (data && data.length > 0) {
						const logo = data[0];
						// Use imageDark as the Blacklogo equivalent
						const darkSrc = logo.imageDark || logo.image;
						if (darkSrc) {
							setDynamicLogo(darkSrc.startsWith('http') ? darkSrc : `${base_url}${darkSrc}`);
						}
					}
				}
			} catch (error) {
				console.error('Error fetching logo:', error);
			}
		};

		fetchLogo();
	}, [locale]);

	const handleLogout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('user');
		window.location.replace('/mimo');
	};

	const navItems = [
		{
			label: 'لوحة التحكم',
			icon: <LayoutDashboard size={20} />,
			href: '/dash-home'
		},
		{
			label: 'اللوجو',
			icon: <ImageIcon size={20} />,
			href: '/dash-logos'
		},
		{
			label: 'السلايدر',
			icon: <ImageIcon size={20} />,
			href: '/slider'
		},
		{
			label: 'الباقات',
			icon: <Package size={20} />,
			href: '/dash-packages'
		},
		{
			label: 'الباقات المفصله',
			icon: <Package size={20} />,
			href: '/dash-custom-packages'
		},
		{
			label: 'صور الباقه المخصصه',
			icon: <ImageIcon size={20} />,
			href: '/custom-package-images'
		},
		{
			label: 'تعليقات المستخدمين',
			icon: <MessageSquare size={20} />,
			href: '/comments'
		},
	]

	return (
		<>
			{/* Overlay for mobile and desktop */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:z-30 lg:top-16"
					onClick={close}
				/>
			)}

			<aside className={`fixed top-0 lg:top-16 right-0 z-50 lg:z-40 w-64 
				bg-[#ffffff] backdrop-blur-2xl border-l border-border h-screen lg:h-[calc(100vh-64px)] flex flex-col transition-all duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
				<div className="flex items-center justify-between py-4 pr-4 
				border-b border-border lg:hidden">
					<div className="flex items-center justify-center">
						<Image
							src={dynamicLogo || Blacklogo}
							alt="Mimo_photography"
							width={80}
							height={40}
							className="object-contain w-auto h-full max-h-[40px]"
							priority
						/>
					</div>
					<button onClick={close} className="cursor-pointer w-[30px] h-[30px] 
					hover:bg-gray-200 ml-3 duration-200 rounded-lg flex items-center justify-center">
						<X size={20} />
					</button>
				</div>

				<div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
					{navItems.map((item) => {
						const isActive = pathname.includes(item.href)
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={close}
								className={`flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200 ${isActive
									? 'bg-primary text-white shadow-lg shadow-primary/20'
									: 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
									}`}
							>
								<div className="flex items-center gap-3">
									<span className={`${isActive ? 'text-white' : 'text-primary/70 group-hover:text-primary'} transition-colors`}>
										{item.icon}
									</span>
									<span className="font-medium text-sm">{item.label}</span>
								</div>
								<ChevronLeft size={14} className={`opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'translate-x-0' : 'translate-x-1'}`} />
							</Link>
						)
					})}
				</div>

				<div className="p-4 border-t border-border space-y-2">
					<Link
						href="/"
						className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-all"
					>
						<Home size={20} className="text-muted-foreground/70" />
						<span className="font-medium text-sm">العودة للموقع</span>
					</Link>
					<button
						onClick={handleLogout}
						className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
					>
						<LogOut size={20} />
						<span className="font-medium text-sm">تسجيل الخروج</span>
					</button>
				</div>
			</aside>
		</>
	)
}

export default DashAside
