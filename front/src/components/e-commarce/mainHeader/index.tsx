"use client"
import { useTranslations } from "next-intl";
import Link from "next/link";
import { House, Menu } from "lucide-react";
import { useAside } from "@/context/EcommerceContext";
import Container from "../../Container";
import HeaderNav from "../../Header/componanet/HeaderNav";
import LanguageToggle from "../../Header/componanet/LanguageToggle";
import ServicesDropDown from "./Services";

const MainHeader = () => {
	const t = useTranslations('Navigation');
	const { toggleAside } = useAside();
	const LinksData = [
		{ id: 1, title: t('home'), url: '/' },
		{ id: 3, title: t('pricing'), url: '/pricing' },
		{ id: 4, title: t('contact'), url: '/contact' },
		{ id: 2, title: t('about'), url: '/about' },
	]
	return (
		<header className={`fixed top-0 left-0 z-45 w-full h-[75px] bg-foreground/87 border-b border-background/50`}>
			<Container className={`flex items-center justify-between h-full`}>
				<div className="w-[calc(50%-100px)] flex items-center gap-10 max-mxmdd:hidden h-full">
					<HeaderNav LinksData={LinksData} />
					<ServicesDropDown/>
				</div>
				<div className="w-[50%] flex justify-between gap-5 items-center max-mxmdd:w-full">
					<div className="flex items-end gap-3 mxmdd:order-1">
						<LanguageToggle />
					</div>
					<div className="w-[100px] text-center max-mxmdd:w-auto h-[65px] flex 
					items-center justify-center relative">
						<Link href="/"
							className={`text-2xl font-bold font-dancing-script w-full h-full 
							p-2 flex items-center justify-center relative text-background`}>
							Wedding
						</Link>
					</div>
					<div className="mxmdd:hidden flex items-end justify-between bg-secondary/30 text-foreground rounded-full px-3 py-2 w-[80px]">
						<Link href="/" className="">
							<House className={`max-mxmdd:block hidden cursor-pointer hover:text-accent transition-colors`}
								size={20}
							/>
						</Link>
						<Menu className={`max-mxmdd:block hidden cursor-pointer hover:text-accent transition-colors`}
							size={20}
							onClick={toggleAside}
						/>
					</div>
				</div>
			</Container>
		</header>
	);
};

export default MainHeader;
