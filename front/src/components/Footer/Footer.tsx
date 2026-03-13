"use client"
import React, { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Facebook, Instagram, Mail, Phone, MapPin, Send } from 'lucide-react'
import Link from 'next/link';
import Image from 'next/image';
import Whitelogo from '@/public/logowhite.png';
import Blacklogo from '@/public/logoblack.png';
import { useDarkMode } from "@/hooks/useDarkMode";
import Container from '../Container';

const Footer = ({ logoData }: { logoData?: { imageLight: string, imageDark: string } | null }) => {
	const t = useTranslations('Footer');
	const navT = useTranslations('Navigation');
	const locale = useLocale();
	const isRtl = locale === 'ar';

	const { isDark, isMounted } = useDarkMode();

	const [dynamicLogoData] = useState<{ imageLight: string, imageDark: string } | null>(logoData || null);

	const getLogoImage = () => {
		if (!dynamicLogoData) return null;
		if (!isMounted) return dynamicLogoData.imageLight;

		if (isDark) {
			return dynamicLogoData.imageDark;
		}

		return dynamicLogoData.imageLight;
	};

	const currentLogo = getLogoImage();

	return (
		<footer className="bg-foreground/87  border-t border-border/50 pt-16 pb-8" dir={isRtl ? 'rtl' : 'ltr'}>
			<Container>
				<div className="mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

						{/* Column 1: Brand & About */}
						<div className="flex flex-col gap-6">
							<Link href="/" className="text-[35px] font-bold font-dancing-script text-background w-[100px] h-[60px] flex items-center">
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
									// Fallback to static logos until loaded
									!isMounted ? (
										<Image
											src={Whitelogo}
											alt="mimophotograph"
											width={100}
											height={60}
											className="object-contain w-auto h-full max-h-[60px]"
											priority
										/>
									) : (!isDark) ? ( // Light Mode -> bg-foreground is dark, text-background is white
										<Image
											src={Whitelogo}
											alt="mimophotograph"
											width={100}
											height={60}
											className="object-contain w-auto h-full max-h-[60px]"
											priority
										/>
									) : ( // Dark Mode -> bg-foreground is light, text-background is black
										<Image
											src={Blacklogo}
											alt="mimophotograph"
											width={100}
											height={60}
											className="object-contain w-auto h-full max-h-[60px]"
											priority
										/>
									)
								)}
							</Link>
							<p className="text-background leading-relaxed text-sm max-w-xs">
								{t('aboutDesc')}
							</p>
						</div>

						{/* Column 2: Quick Links */}
						<div className="flex flex-col gap-6">
							<h3 className="text-lg font-semibold text-background uppercase tracking-wider">
								{t('linksTitle')}
							</h3>
							<ul className="flex flex-col gap-3">
								<li>
									<Link href="/" className="text-background hover:text-background/65 transition-colors flex items-center gap-2 group text-sm">
										<span className="w-1.5 h-1.5 rounded-full bg-background hover:bg-background/65"></span>
										{navT('home')}
									</Link>
								</li>
								<li>
									<Link href="/about" className="text-background hover:text-background/65 transition-colors flex items-center gap-2 group text-sm">
										<span className="w-1.5 h-1.5 rounded-full bg-background hover:bg-background/65"></span>
										{navT('about')}
									</Link>
								</li>
								<li>
									<Link href="/contact" className="text-background hover:text-background/65 transition-colors flex items-center gap-2 group text-sm">
										<span className="w-1.5 h-1.5 rounded-full bg-background hover:bg-background/65"></span>
										{navT('contact')}
									</Link>
								</li>
								<li>
									<Link href="/booking/non" className="text-background hover:text-background/65 transition-colors flex items-center gap-2 group text-sm">
										<span className="w-1.5 h-1.5 rounded-full bg-background hover:bg-background/65"></span>
										{navT('booking')}
									</Link>
								</li>
							</ul>
						</div>

						{/* Column 3: Social Media */}
						<div className="flex flex-col gap-6">
							<h3 className="text-lg font-semibold text-background uppercase tracking-wider">
								{t('followUs')}
							</h3>
							<div className="flex gap-4">
								<Link href="https://www.facebook.com/share/18M1siQiug/?mibextid=wwXIfr"
									className="w-10 h-10 rounded-full border border-border flex items-center 
											justify-center text-background hover:bg-Brown-color 
											hover:text-background/65 hover:border-Brown-color transition-all duration-300"
									target="_blank"
									aria-label="Facebook"
								>
									<Facebook size={18} />
								</Link>
								<Link
									href="https://www.instagram.com/mimo__photography/"
									className="w-10 h-10 rounded-full border border-border flex items-center 
										justify-center text-background hover:bg-Brown-color 
										hover:text-background/65 hover:border-Brown-color transition-all duration-300"
									target="_blank"
									aria-label="Instagram"
								>
									<Instagram size={18} />
								</Link>
								<Link
									href="https://t.me/Mimoph"
									target="_blank"
									className="w-10 h-10 rounded-full border border-border flex items-center 
											justify-center text-background hover:bg-Brown-color 
											hover:text-background/65 hover:border-Brown-color transition-all duration-300"
									aria-label="Telegram"
								>
									<Send size={18} />
								</Link>
							</div>
						</div>

						{/* Column 4: Contact Info */}
						<div className="flex flex-col gap-6">
							<h3 className="text-lg font-semibold text-background uppercase tracking-wider">
								{t('contactTitle')}
							</h3>
							<div className="flex flex-col gap-4">
								<Link href="mailto:mimoph539@gmail.com"
									className="flex items-start gap-3 text-sm text-background group">
									<Mail size={18} className="text-background shrink-0 group-hover:text-background/65 transition-colors" />
									<span className='group-hover:text-background/65 transition-colors'>mimoph539@gmail.com</span>
								</Link>
								<Link href="tel:+01055855779"
									className="flex items-start gap-3 text-sm text-background group">
									<Phone size={18} className="text-background shrink-0 group-hover:text-background/65 transition-colors" />
									<span dir="ltr" className='group-hover:text-background/65 transition-colors'>01055855779</span>
								</Link>
								<Link href="https://maps.app.goo.gl/fQSpJb2mP5FGJ2zt7" target="_blank" rel="noopener noreferrer"
									className="flex items-start gap-3 text-sm text-background group">
									<MapPin size={18} className="text-background shrink-0 group-hover:text-background/65 transition-colors" />
									<span className='group-hover:text-background/65 transition-colors'>{t('Officelocation')}</span>
								</Link>
							</div>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className="border-t border-border/30 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4
				 text-xs text-background">
						<p>{t('copyright')}</p>
						<div className="flex gap-6">
							<Link href="/privacy" className="text-background hover:text-background/65 transition-colors">{t('privacyPolicy')}</Link>
							<Link href="/terms" className="text-background hover:text-background/65 transition-colors">{t('termsOfService')}</Link>
						</div>
					</div>
				</div>
			</Container>
		</footer>
	)
}

export default Footer