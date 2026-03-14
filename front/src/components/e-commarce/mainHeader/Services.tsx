"use client"
import React from 'react';
import Link from 'next/link';
import { ChevronDown, Camera, Brush } from 'lucide-react';
import { useTranslations } from 'next-intl';
import DropDown from '../../DropDown/DropDown';

const ServicesDropDown = () => {
	const t = useTranslations('Navigation');
	return (
		<div className="relative group h-full flex items-center bg-red-100 cursor-pointer">
			<DropDown title={t('services')}
				IconBtn={<ChevronDown size={14}
					className="transition-transform duration-300 group-hover:rotate-180" />}>
				<Link href="/photographer" className="flex items-center gap-3 px-5 py-4 hover:bg-secondary/20 transition-colors group/item">
					<div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-foreground group-hover/item:bg-primary group-hover/item:text-white transition-colors duration-300">
						<Camera size={16} />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-bold text-foreground capitalize">{t('photographer')}</span>
						<span className="text-[10px] text-muted-foreground">{t('photographerDesc')}</span>
					</div>
				</Link>

				<div className="h-[1px] w-[80%] mx-auto bg-border/30" />

				<Link href="/makeup" className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors group/item">
					<div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center text-foreground group-hover/item:bg-primary group-hover/item:text-white transition-colors duration-300">
						<Brush size={16} />
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-bold text-foreground capitalize">{t('makeup')}</span>
						<span className="text-[10px] text-muted-foreground">{t('makeupDesc')}</span>
					</div>
				</Link>
			</DropDown>
		</div>
	)
}

export default ServicesDropDown;