"use client"
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { House, Menu, User, CreditCard, Users, Languages, LogOut } from "lucide-react";
import { useAside } from "@/context/EcommerceContext";
import Container from "../../Container";
import HeaderNav from "../../Header/componanet/HeaderNav";
import LanguageToggle from "../../Header/componanet/LanguageToggle";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import DropDown from "../../DropDown/DropDown";

const MainHeader = () => {
	const dispatch = useAppDispatch();
	const { isAuthenticated } = useAppSelector((state) => state.auth);
	const [mounted, setMounted] = useState(false);
	const t = useTranslations('Navigation');
	const ut = useTranslations('UserMenu');
	const { toggleAside } = useAside();

	useEffect(() => {
		setMounted(true);
	}, []);
	const LinksData = [
		{ id: 1, title: t('home'), url: '/' },
		{ id: 3, title: t('pricing'), url: '/pricing' },
		{ id: 4, title: t('contact'), url: '/contact' },
		{ id: 2, title: t('about'), url: '/about' },
	]
	return (
		<header className={`fixed top-0 left-0 z-45 w-full h-[75px] bg-foreground/87 border-b border-background/50`}>
			<Container className={`flex items-center justify-between h-full`}>
				<div className="w-[calc(100%-200px)] flex items-center gap-15 max-mxmdd:hidden h-full">
					<div className="w-[100px] text-center max-mxmdd:w-auto h-[65px] flex 
					items-center justify-center relative">
						<Link href="/"
							className={`text-3xl font-bold font-dancing-script w-full h-full 
							p-2 flex items-center justify-center relative text-background`}>
							Wedding
						</Link>
					</div>
					<HeaderNav LinksData={LinksData} />
				</div>
				<div className="flex justify-between gap-5 items-center max-mxmdd:w-full h-full">
					<div className="flex items-center gap-3 mxmdd:order-1 h-full group">
						<LanguageToggle />
						{mounted && isAuthenticated ? (
							<DropDown
								title=""
								dir="right"
								IconBtn={
									<div className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-background/10 transition-all duration-300">
										<User size={20} className="text-background" />
									</div>
								}
							>
								<Link href="/profile" className="flex items-center gap-3 px-5 py-4 hover:bg-secondary/20 transition-colors group/item">
									<div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-foreground group-hover/item:bg-primary group-hover/item:text-white transition-colors duration-300">
										<User size={16} className="text-coffee-600 group-hover/item:text-white" />
									</div>
									<span className="text-sm font-medium text-foreground">{ut('profile')}</span>
								</Link>

								<Link href="/billing" className="flex items-center gap-3 px-5 py-4 hover:bg-secondary/20 transition-colors group/item">
									<div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-foreground group-hover/item:bg-primary group-hover/item:text-white transition-colors duration-300">
										<CreditCard size={16} className="text-coffee-600 group-hover/item:text-white" />
									</div>
									<span className="text-sm font-medium text-foreground">{ut('billing')}</span>
								</Link>

								<Link href="/refer" className="flex items-center gap-3 px-5 py-4 hover:bg-secondary/20 transition-colors group/item">
									<div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-foreground group-hover/item:bg-primary group-hover/item:text-white transition-colors duration-300">
										<Users size={16} className="text-coffee-600 group-hover/item:text-white" />
									</div>
									<span className="text-sm font-medium text-foreground">{ut('refer')}</span>
								</Link>

								<button
									onClick={() => dispatch(logout())}
									className="cursor-pointer px-5 py-3 hover:bg-red-50 text-red-600 flex items-center gap-3 transition-colors w-full text-left"
								>
									<LogOut size={18} />
									<span className="text-sm font-medium">{ut('logout')}</span>
								</button>
							</DropDown>
						) : (
							<Link href="/login" className="cursor-pointer bg-background hover:bg-coffee-700 text-coffee-600 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg">
								{t('signin')}
							</Link>
						)}
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
