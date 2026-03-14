"use client"
import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import Image from 'next/image';
import { apiFetch } from '@/app/[locale]/lib/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';

interface CustomImage {
	_id: string;
	image: string;
}

const CustomPackageImagesSwiper = ({ isAr, apiUrl }: { isAr: boolean, apiUrl: string }) => {
	const [images, setImages] = useState<CustomImage[]>([]);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const fetchImages = async () => {
			try {
				const res = await apiFetch('/home/custom-package-images');
				if (res.ok) {
					const data = await res.json();
					const flatImages: CustomImage[] = [];
					data.forEach((group: any) => {
						if (group.images && Array.isArray(group.images)) {
							group.images.forEach((img: string, idx: number) => {
								flatImages.push({ _id: `${group._id}-${idx}`, image: img });
							});
						}
					});
					setImages(flatImages);
				}
			} catch (error) {
				console.error("Error fetching custom package images for home", error);
			}
		};
		fetchImages();
	}, []);

	if (!mounted || images.length === 0) return null;

	return (
		<div className="w-full relative py-10 mt-10">
			<Swiper
				spaceBetween={20}
				slidesPerView={'auto'}
				centeredSlides={true}
				loop={images.length > 2}
				dir={isAr ? 'rtl' : 'ltr'}
				autoplay={{
					delay: 3500,
					disableOnInteraction: false,
				}}
				breakpoints={{
					320: { slidesPerView: 1, spaceBetween: 10 },
					640: { slidesPerView: 2, spaceBetween: 15 },
					1024: { slidesPerView: 3, spaceBetween: 20 },
				}}
				modules={[Autoplay]}
				className="w-full h-full"
			>
				{images.map((item, index) => (
					<SwiperSlide key={index} className="!w-[85vw] sm:!w-[350px] md:!w-[400px] lg:!w-[450px]">
						<div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl group">
							<Image
								src={item.image?.startsWith('/uploads') ? `${apiUrl}${item.image}` : item.image}
								alt={`Custom Package Image ${index + 1}`}
								fill
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								quality={100}
								className="object-cover transition-transform duration-700 group-hover:scale-105"
							/>
							<div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	)
}

export default CustomPackageImagesSwiper
