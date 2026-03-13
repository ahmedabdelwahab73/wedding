"use client"
import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation } from 'swiper/modules'
import Link from 'next/link'
import Image from 'next/image'
import { MoveLeft, MoveRight, Loader2, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import HeadingTitle from '../../../componanets/HeadingTitle'
import { ItemspackageType } from '@/app/types'
import Subname from '../../../componanets/Subname'
import CustomPackageCard from '../../../componanets/CustomPackageCard'
import OfferBtn from './OfferBtn'

interface IProps {
	packages: ItemspackageType[];
	locale: string;
	currentId: string;
	title: string;
	customPackageImages?: any[];
	DesignYourPackage?: string;
	DesignYourPackageDesc?: string;
	StartDesigning?: string;
	apiUrl?: string;
}

const PackagesSlider = ({
	packages,
	locale,
	currentId,
	title,
	customPackageImages,
	DesignYourPackage,
	DesignYourPackageDesc,
	StartDesigning,
	apiUrl
}: IProps) => {
	const [isMounted, setIsMounted] = useState(false);
	const isAr = locale === 'ar';
	const t = useTranslations('HomePage');
	const otherPackages = packages.filter(p => p.id !== currentId);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (otherPackages.length === 0) return null;

	return (
		<div className="space-y-8 py-16 max-ssmd:py-9 border-t border-border/50 packages-slider-wrapper">
			<div className="">
				<HeadingTitle>
					{title}
					<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-primary rounded-full opacity-80"></span>
				</HeadingTitle>

				<div className="flex justify-end gap-2">
					<button aria-label="Previous Packages" className="cursor-pointer packages-prev p-2 rounded-full border border-border hover:bg-primary/10 hover:border-primary/30 transition-all group">
						<MoveLeft size={20} className="text-foreground/50 group-hover:text-primary transition-colors" />
					</button>
					<button aria-label="Next Packages" className="cursor-pointer packages-next p-2 rounded-full border border-border hover:bg-primary/10 hover:border-primary/30 transition-all group">
						<MoveRight size={20} className="text-foreground/50 group-hover:text-primary transition-colors" />
					</button>
				</div>
			</div>

			{!isMounted ? (
				<div className="flex gap-6 overflow-hidden px-2 pb-12">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] bg-card/10 border border-border rounded-[2rem] overflow-hidden animate-pulse">
							<div className="w-full aspect-[4/3] bg-foreground/10 flex items-center justify-center">
								<Loader2 className="w-8 h-8 text-foreground/30 animate-spin" />
							</div>
							<div className="p-6 space-y-4">
								<div className="h-6 bg-foreground/10 rounded-md w-3/4" />
								<div className="h-8 bg-foreground/10 rounded-md w-1/2 mt-4" />
							</div>
						</div>
					))}
				</div>
			) : (
				<Swiper
					modules={[Autoplay, Navigation]}
					spaceBetween={24}
					slidesPerView={1}
					dir={isAr ? 'rtl' : 'ltr'}
					navigation={{
						nextEl: '.packages-next',
						prevEl: '.packages-prev',
					}}
					autoplay={{
						delay: 4000,
						disableOnInteraction: true,
					}}
					breakpoints={{
						640: { slidesPerView: 2 },
						1024: { slidesPerView: 3 },
						1280: { slidesPerView: 4 }
					}}
					className="pb-12! max-ssmd:pb-0! rounded-[2rem]"
				>
					{/* Custom Package Card as the first slide */}
					{customPackageImages && customPackageImages.length > 0 && (
						<SwiperSlide className="h-auto! py-0 rounded-[2rem]">
							<CustomPackageCard
								customPackageImages={customPackageImages}
								DesignYourPackage={DesignYourPackage || ''}
								DesignYourPackageDesc={DesignYourPackageDesc || ''}
								StartDesigning={StartDesigning || ''}
								locale={locale}
								apiUrl={apiUrl || ''}
							/>
						</SwiperSlide>
					)}

					{otherPackages.map((item, index) => (
						<SwiperSlide key={item.id} className="h-auto! py-0 rounded-[2rem]">
							<Link
								href={`/${locale}/${item.title.toLowerCase().trim().replace(/\s+/g, "-")}-${item.id}`}
								className="group block bg-card/30 backdrop-blur-xl rounded-[2rem] 
							border border-border overflow-hidden 
							hover:border-[#b0a090] hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
							>
								<div className="relative aspect-[4/3] overflow-hidden shrink-0">
									<Image
										src={item.image}
										alt={item.title}
										fill
										quality={100}
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
										className="object-cover transition-transform duration-700 group-hover:scale-110"
									/>
									{item.offer > 0 && (
										<OfferBtn
											Text={t('specialOffer')}
											Offer={item.offer}
										/>
									)}
								</div>

								<div className="p-6 space-y-4 flex flex-col flex-1 justify-between">
									<h4 className="text-xl font-black text-foreground group-hover:text-[#6a6054] 
									transition-colors line-clamp-2">
										{item.title}
										<Subname
											style={'text-foreground font-black group-hover:text-[#6a6054] transition-colors text-xl'}
											SubName={item.subnameEn}
											locale={locale}
										/>
									</h4>
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

									<div className="flex items-center justify-between border-t border-border/30 pt-4 mt-auto">
										<div className="flex flex-col">
											{item.offer > 0 ? (
												<>
													<span className="text-xs text-foreground/40 line-through font-bold">
														{item.price} EGP
													</span>
													<span className="text-xl font-black text-foreground">
														{item.price - item.offer} <small className="text-[10px] uppercase">EGP</small>
													</span>
												</>
											) : (
												<span className="text-xl font-black text-foreground">
													{item.price} <small className="text-[10px] uppercase">EGP</small>
												</span>
											)}
										</div>
										<div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9a8b7a]/60 to-[#7f6f5e]/70 flex items-center justify-center group-hover:bg-[#9a8b7a] group-hover:text-white transition-all duration-300">
											{isAr ? <MoveLeft size={18} className='text-[#ffffff]' /> : <MoveRight size={18} className='text-[#ffffff]' />}
										</div>
									</div>
								</div>
							</Link>
						</SwiperSlide>
					))}
				</Swiper>
			)}

			{/* <div className="packages-pagination flex justify-center !static mt-4" /> */}
		</div>
	)
}

export default PackagesSlider
