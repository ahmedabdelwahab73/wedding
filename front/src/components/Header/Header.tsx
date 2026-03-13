"use client"
import ToggleModeColor from "./componanet/ToggleModeColor";
import HeaderNav from "./componanet/HeaderNav";
import LanguageToggle from "./componanet/LanguageToggle";
import { useTranslations, useLocale } from "next-intl";
import { useEcommerceScroll } from "@/context/EcommerceContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "../Container";
import { House, Menu } from "lucide-react";
import { useAside } from "@/context/EcommerceContext";
import Image from "next/image";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useState, useEffect } from 'react';
import ReviewModal from '@/components/ReviewModal/ReviewModal';

const Header = ({ logoData }: { logoData?: { imageLight: string, imageDark: string } | null }) => {
	const t = useTranslations('Navigation');
	const locale = useLocale();
	const { isScrolled } = useEcommerceScroll();
	const pathname = usePathname();
	const { toggleAside } = useAside();
	const { isDark, isMounted } = useDarkMode();
	const [isReviewOpen, setIsReviewOpen] = useState(false);
	const isBookingPage = pathname.includes('/booking') || pathname.includes('/custom-package') || pathname.includes('/privacy') || pathname.includes('/terms') || pathname.includes('/about') || pathname.includes('/more-packages');

	const [dynamicLogoData] = useState<{ imageLight: string, imageDark: string } | null>(logoData || null);

	const LinksData = [
		{ id: 1, title: t('home'), url: '/' },
		{ id: 2, title: t('about'), url: '/about' },
		{ id: 3, title: t('comment'), url: '' },
		{ id: 4, title: t('booking'), url: '/booking/non' },
	]

	const getLogoImage = () => {
		if (!dynamicLogoData) return null;
		if (!isMounted) return dynamicLogoData.imageLight;

		if (isDark && (isBookingPage || isScrolled)) {
			return dynamicLogoData.imageDark;
		}

		return dynamicLogoData.imageLight;
	};

	const currentLogo = getLogoImage();

	return (
		<header className={`fixed top-0 left-0 z-45 w-full h-[75px] 
		${isScrolled ? "bg-foreground/75 backdrop-blur-md shadow-md" :
				(isBookingPage ? "dark:text-black bg-foreground/75 text-white shadow-md" : "bg-transparent")}`}>
			<Container className={`flex items-center justify-between h-full
		 transition-all duration-300 ease-in-out
		`}>
				<HeaderNav
					LinksData={LinksData}
					isScrolled={isScrolled}
					isBookingPage={isBookingPage}
					onCommentClick={() => setIsReviewOpen(true)}
				/>

				<div className="w-[50%] flex justify-between gap-5 items-center max-mxmdd:w-full">
					<div className="flex items-end gap-3 mxmdd:order-1">
						<LanguageToggle />
						<ToggleModeColor isScrolled={isScrolled} isBookingPage={isBookingPage} />
					</div>
					<div className="w-[100px] text-center max-mxmdd:w-auto h-[65px] flex 
					items-center justify-center relative">
						<Link href="/" className={`font-bold font-dancing-script w-full h-full p-2 flex items-center justify-center relative
						${isScrolled ? "text-background" : "text-white"}
						`}>
							{currentLogo && (
								<Image
									src={currentLogo}
									alt="mimophotograph"
									width={100}
									height={60}
									className="object-contain w-auto h-full max-h-[60px]"
									priority
								/>
							)}
						</Link>
					</div>
					<div className="mxmdd:hidden flex items-end justify-between bg-[#b0a090]/30 rounded-full px-3 py-2 w-[80px]">
						<Link href="/" className="">
							<House className={`max-mxmdd:block hidden cursor-pointer
					${(isBookingPage || isScrolled) ? (isDark ? "text-black" : "text-white") : "text-white"}
						`}
								size={20}
							/>
						</Link>
						<Menu className={`max-mxmdd:block hidden cursor-pointer
					${(isBookingPage || isScrolled) ? (isDark ? "text-black" : "text-white") : "text-white"}
						`}
							size={20}
							onClick={toggleAside}
						/>
					</div>
				</div>
			</Container>

			<ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
		</header>
	);
};

export default Header;
