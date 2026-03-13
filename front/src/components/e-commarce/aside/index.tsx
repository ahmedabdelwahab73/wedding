"use client"
import React, { useState } from 'react'
import { useTheme } from 'next-themes';
import { useAside } from '@/context/EcommerceContext';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Whitelogo from '@/public/logowhite.png';
import Blacklogo from '@/public/logoblack.png';
import ReviewModal from '@/components/ReviewModal/ReviewModal';

const Aside = ({ logoData }: { logoData?: { imageLight: string, imageDark: string } | null }) => {
	const { isAsideOpen, toggleAside } = useAside();
	const t = useTranslations('Navigation');
	const locale = useLocale();
	const isRtl = locale === 'ar';
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [isReviewOpen, setIsReviewOpen] = useState(false);

	const [dynamicLogoData] = useState<{ imageLight: string, imageDark: string } | null>(logoData || null);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const getLogoImage = () => {
		if (!dynamicLogoData) return null;
		if (!mounted) return dynamicLogoData.imageLight;

		if (resolvedTheme === 'dark') {
			return dynamicLogoData.imageLight;
		}

		return dynamicLogoData.imageDark;
	};

	const currentLogo = getLogoImage();

	// Scroll lock with layout shift compensation
	React.useEffect(() => {
		setMounted(true);
		const root = document.documentElement;

		if (isAsideOpen) {
			const scrollBarWidth = window.innerWidth - root.clientWidth;
			root.style.setProperty('--scrollbar-width', `${scrollBarWidth}px`);
			document.body.classList.add('aside-open');
		} else {
			document.body.classList.remove('aside-open');
		}

		return () => {
			document.body.classList.remove('aside-open');
		};
	}, [isAsideOpen]);

	return (

		<>
			{/* Backdrop Overlay */}
			<div
				className={`fixed inset-0 bg-foreground/30 backdrop-blur-[2px] z-50 transition-opacity duration-500 ease-in-out
					${isAsideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
				onClick={toggleAside}
			/>

			{/* Sidebar Drawer */}
			<aside
				dir={isRtl ? 'rtl' : 'ltr'}
				className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-[250px] sm:w-[280px] bg-background z-[100] shadow-2xl transition-all duration-500 
				cubic-bezier(0.4, 0, 0.2, 1) transform py-8
					${isAsideOpen ? 'translate-x-0 opacity-100' : `${isRtl ? 'translate-x-full' : '-translate-x-full'} opacity-0`}`}
			>
				<div className="flex flex-col h-full">
					{/* Header Section */}
					<div className="flex items-center justify-between mb-10 px-4">
						<Link href="/" className="text-4xl font-bold font-dancing-script text-foreground w-[100px] h-[60px] flex items-center justify-center relative">
							{dynamicLogoData && currentLogo ? (
								<Image
									src={currentLogo}
									alt="mimophotograph"
									width={100}
									height={60}
									className="object-contain w-auto h-full max-h-[60px]"
									priority
								/>
							) : (
								<>
									{
										mounted && resolvedTheme === 'dark' &&
										<Image
											src={Whitelogo}
											alt="mimophotograph"
											width={100}
											height={60}
											className="object-contain w-auto h-full max-h-[60px]"
											priority
										/>
									}
									{
										mounted && resolvedTheme === 'light' &&
										<Image
											src={Blacklogo}
											alt="mimophotograph"
											width={100}
											height={60}
											className="object-contain w-auto h-full max-h-[60px]"
											priority
										/>
									}
								</>
							)}
						</Link>
						<button
							onClick={toggleAside}
							className="group p-2 hover:bg-foreground/10 rounded-full transition-all duration-300 cursor-pointer"
							aria-label="Close Sidebar"
						>
							<X size={28} className="text-foreground group-hover:rotate-90 transition-transform duration-300" />
						</button>
					</div>
					{/* Navigation Links */}
					<div className="flex-1 overflow-y-auto">
						<nav className="flex flex-col gap-8">
							<div className="flex flex-col gap-0">
								<Link
									href="/"
									className="text-md w-full font-medium text-foreground relative group overflow-hidden px-6 py-3 z-10"
									onClick={toggleAside}
								>
									<span className="relative z-10 group-hover:text-background transition-colors duration-300">
										{t('home')}
									</span>
									<span className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'}
									 w-0 h-full bg-foreground/90 transition-all duration-400 ease-out group-hover:w-full -z-10`}></span>
								</Link>
								<Link
									href="/about"
									className="text-md w-full font-medium text-foreground relative group overflow-hidden px-6 py-3 z-10 mt-0"
									onClick={toggleAside}
								>
									<span className="relative z-10 group-hover:text-background transition-colors duration-300">
										{t('about')}
									</span>
									<span className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'}
									 w-0 h-full bg-foreground/90 transition-all duration-400 ease-out group-hover:w-full -z-10`}></span>
								</Link>
								<Link
									href="/booking/non"
									className="text-md w-full font-medium text-foreground relative group overflow-hidden px-6 py-3 z-10 mt-0"
									onClick={toggleAside}
								>
									<span className="relative z-10 group-hover:text-background transition-colors duration-300">
										{t('booking')}
									</span>
									<span className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'}
									 w-0 h-full bg-foreground/90 transition-all duration-400 ease-out group-hover:w-full -z-10`}></span>
								</Link>
								<button
									className="cursor-pointer flex text-md w-full font-medium text-foreground relative group overflow-hidden px-6 py-3 z-10 mt-0"
									onClick={() => {
										toggleAside();
										setIsReviewOpen(true);
									}}
								>
									<span className="relative z-10 group-hover:text-background transition-colors duration-300">
										{t('comment')}
									</span>
									<span className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'}
									 w-0 h-full bg-foreground/90 transition-all duration-400 ease-out group-hover:w-full -z-10`}></span>
								</button>
							</div>
						</nav>
					</div>

					{/* Bottom Branding */}
					<div className="pt-8 border-t border-border/50">
						<div className="flex flex-col gap-2">
							<p className="text-sm font-dancing-script text-foreground/70 tracking-widest">Premium Collection</p>
							<p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-medium">© 2026 Mimo Boutique</p>
						</div>
					</div>
				</div>
			</aside>

			<ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
		</>
	)
}

export default Aside;
