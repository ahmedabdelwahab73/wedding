"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { packageCardType } from '@/app/types';
import { Dot, Star } from 'lucide-react';
import Subname from './Subname';
import { useTranslations } from 'next-intl';
import OfferBtn from '../(package)/[slug]/componanent/OfferBtn';

interface PackageCardProps extends packageCardType {
	isScrollActive: boolean;
}

const PackageCard = ({ item, ViewDetails, priority, locale, isScrollActive = false }: PackageCardProps) => {
	const t = useTranslations('HomePage');
	console.log("item", item);

	return (
		<Link
			href={`/${locale}/${item.title.toLowerCase().trim().replace(/\s+/g, "-")}-${item.id}`}
			key={item.id}
			className={`group relative overflow-hidden block
				rounded-2xl shadow-md transition-all duration-500 hover:shadow-2xl 
				${'h-[450px]'}`}
		>
			{/* Image */}
			{item.image ? (
				<Image
					src={item.image}
					alt={item.title}
					fill
					priority={priority}
					{...(priority ? { fetchPriority: "high" } : {}) as any}
					quality={100}
					className='object-cover transition-transform duration-700 group-hover:scale-110'
					sizes="(max-width: 768px) 100vw, 33vw"
				/>
			) : (
				<div className="w-full h-full bg-secondary flex items-center justify-center">
					<span className="text-foreground/70 text-xs">No Image</span>
				</div>
			)}

			{item.offer > 0 && (
				<OfferBtn
					Text={t('offer')}
					Offer={item.offer}
				/>
			)}

			<div className="absolute top-2 left-4 z-10 flex flex-col gap-1 items-start px-2 py-1.5 rounded-full">
				{(item.rate !== undefined && item.rate !== null) && (
					<div className="rounded-full flex items-center gap-0.5">
						{Array.from({ length: 5 }).map((_, index) => (
							<Star
								key={index}
								size={10}
								fill={index < Math.round(item.rate || 0) ? "#f59e0b" : "transparent"}
								className={index < Math.round(item.rate || 0) ? "text-amber-500" : "text-gray-400"}
							/>
						))}
					</div>
				)}
				{item.mostseller === 1 && (
					<div className="head text-[6px] text-[#ffffff] font-bold drop-shadow-md text-center w-full">
						<span>{locale === 'ar' ? 'الأكثر مبيعا' : 'Most Selling'}</span>
					</div>
				)}
			</div>

			{/* Overlay */}
			<div className={`absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent 
				transition-all duration-500 flex flex-col justify-end p-8 backdrop-blur-[2px]
				${isScrollActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
				<div className={`transform transition-transform duration-500
					${isScrollActive ? 'translate-y-0' : 'translate-y-4 group-hover:translate-y-0'}`}>
					<h3 className='text-2xl font-bold text-white mb-2'>
						{item.title} <Subname
							SubName={item.subnameEn}
							locale={locale}
							style={`text-2xl font-bold text-white`}
						/>
					</h3>
					<div className='flex flex-wrap flex-col gap-2 mb-3'>
						{item.points && item.points.slice(0, 6).map((point, i) => (
							<div key={i} className='flex items-center gap-0 bg-white/10 w-fit backdrop-blur-md px-1 py-1 rounded-lg text-white text-[10px] font-medium border border-white/10'>
								<Dot className='text-white' size={20} />
								<span>{point}</span>
							</div>
						))}
						{item.points && item.points.length > 6 && (
							<div className='text-white/60 text-[10px] font-bold mt-1 px-2 underline decoration-white/20 underline-offset-4 animate-pulse uppercase tracking-tighter italic'>
								+ {item.points.length - 6} {t('moreFeatures')}
							</div>
						)}
					</div>

					<div className='flex items-center justify-between border-t border-white/20 pt-4'>
						<div className='flex flex-col'>
							{item?.offer !== 0 ? (
								<>
									<span className='text-gray-300 line-through text-xs'>{item.price} EGP</span>
									<span className='text-2xl font-extrabold text-white'>
										{item.price - item.offer} <span className='text-xs font-normal'>EGP</span>
									</span>
								</>
							) : (
								<span className='text-2xl font-extrabold text-white'>
									{item.price} <span className='text-xs font-normal'>EGP</span>
								</span>
							)}
						</div>
						<span
							className='bg-gradient-primary hover:bg-gradient-primary-hover text-[#ffffff]
								px-6 py-2.5 rounded-full text-sm font-bold hover:bg-red-500 hover:text-white transition-colors duration-300
								cursor-pointer shadow-lg'>
							{ViewDetails}
						</span>
					</div>
				</div>
			</div>

			{/* Static Title */}
			<div className={`absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/60 to-transparent 
				transition-all duration-300
				${isScrollActive ? 'opacity-0 translate-y-[76px]' : 'group-hover:opacity-0 group-hover:translate-y-[76px]'}`}>
				<h3 className='text-xl font-bold text-white'>{item.title}</h3>
				<Subname
					SubName={item.subnameEn}
					locale={locale}
				/>
			</div>
		</Link>
	);
};

export default PackageCard;