"use client"
import HeaderNav from "./componanet/HeaderNav";
import LanguageToggle from "./componanet/LanguageToggle";
import { useTranslations } from "next-intl";
import { useEcommerceScroll } from "@/context/EcommerceContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "../Container";
import { House, Menu } from "lucide-react";
import { useAside } from "@/context/EcommerceContext";
import Image from "next/image";
import { useState } from 'react';
import ReviewModal from '@/components/ReviewModal/ReviewModal';

const Header = ({ logoData }: { logoData?: { image: string } | null }) => {
	const t = useTranslations('Navigation');
	const { isScrolled } = useEcommerceScroll();
	const pathname = usePathname();
	const { toggleAside } = useAside();
	const [isReviewOpen, setIsReviewOpen] = useState(false);
	const isBookingPage = pathname.includes('/booking') || pathname.includes('/custom-package') || pathname.includes('/privacy') || pathname.includes('/terms') || pathname.includes('/about') || pathname.includes('/more-packages');

	const currentLogo = logoData?.image || null;

	const LinksData = [
		{ id: 1, title: t('home'), url: '/' },
		{ id: 2, title: t('about'), url: '/about' },
		{ id: 3, title: t('comment'), url: '' },
		{ id: 4, title: t('booking'), url: '/booking/non' },
	]

	return (
		<header className={`fixed top-0 left-0 z-45 w-full h-[75px] 
		${isScrolled ? "bg-foreground/75 backdrop-blur-md shadow-md" :
				(isBookingPage ? "bg-foreground/75 text-white shadow-md" : "bg-transparent")}`}>
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
					${(isBookingPage || isScrolled) ? "text-white" : "text-white"}
						`}
								size={20}
							/>
						</Link>
						<Menu className={`max-mxmdd:block hidden cursor-pointer
					${(isBookingPage || isScrolled) ? "text-white" : "text-white"}
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
