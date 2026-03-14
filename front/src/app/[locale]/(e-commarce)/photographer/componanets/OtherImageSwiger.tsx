'use client'
import React, { useState, useEffect } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import { Loader2 } from 'lucide-react';

import Image from 'next/image';

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

const OtherImageSwiger = ({ images, isAr, title }: { images: string[], isAr: boolean, title: string }) => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return (
			<div className="flex gap-[10px] pb-12 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'} style={{ paddingLeft: isAr ? 0 : 32, paddingRight: isAr ? 32 : 0 }}>
				{[...Array(4)].map((_, i) => (
					<div
						key={i}
						className="flex-none w-[75%] sm:w-[45%] lg:w-[30%] xl:w-[23%] aspect-square rounded-[1.5rem] bg-foreground/10 animate-pulse flex items-center justify-center"
					>
						<Loader2 className="w-8 h-8 text-foreground/30 animate-spin" />
					</div>
				))}
			</div>
		);
	}

	return (
		<Swiper
			modules={[Pagination, Autoplay]}
			spaceBetween={10}
			slidesPerView={1}
			dir={isAr ? 'rtl' : 'ltr'}
			pagination={{
				clickable: true,
				dynamicBullets: true,
				el: '.packages-pagination'
			}}
			autoplay={{
				delay: 4500,
				disableOnInteraction: true,
			}}
			breakpoints={{
				320: { slidesPerView: 1.3, spaceBetween: 10 },
				640: { slidesPerView: 2.2, spaceBetween: 10 },
				1024: { slidesPerView: 3.2, spaceBetween: 10 },
				1280: { slidesPerView: 4.2, spaceBetween: 10 }
			}}
			slidesOffsetBefore={isAr ? 16 : 32}
			slidesOffsetAfter={32}
			className="pb-12! overflow-visible!"
		>
			{images.map((img: string, i: number) => (
				<SwiperSlide key={i} className="h-auto! py-2">
					<div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden shadow-lg border border-border group">
						<Image
							src={img}
							alt={`${title} ${i + 1}`}
							fill
							quality={100}
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							className="object-cover transition-transform duration-500 group-hover:scale-110"
						/>
						<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					</div>

				</SwiperSlide>
			))}
		</Swiper>
	)
}

export default OtherImageSwiger