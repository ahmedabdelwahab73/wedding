"use client"
import React, { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'

interface Partner {
	_id: string;
	title: string;
	image: string;
}

const Partners = ({ initialData }: { initialData?: Partner[] }) => {
	const locale = useLocale();
	const isRtl = locale === 'ar';
	const [partners, setPartners] = useState<Partner[]>(initialData || []);
	const [loading, setLoading] = useState(!initialData);

	useEffect(() => {
		if (initialData) return;
		const fetchPartners = async () => {
			try {
				const base_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
				const res = await fetch(`${base_url}/api/partners`, {
					headers: { 'lang': locale }
				});
				if (res.ok) {
					const data = await res.json();
					setPartners(data);
				}
			} catch (error) {
				console.error('Failed to fetch partners:', error);
			} finally {
				setLoading(false);
			}
		};
		fetchPartners();
	}, [locale, initialData]);

	if (loading || partners.length === 0) return null;

	return (
		<div className="py-12 border-t border-border/80" dir={isRtl ? 'rtl' : 'ltr'}>
			<Swiper
				modules={[Autoplay]}
				spaceBetween={30}
				slidesPerView={2}
				loop={partners.length > 5}
				autoplay={{
					delay: 3000,
					disableOnInteraction: false,
				}}
				breakpoints={{
					640: {
						slidesPerView: 3,
					},
					768: {
						slidesPerView: 4,
					},
					1024: {
						slidesPerView: 5,
					},
					1280: {
						slidesPerView: 6,
					},
				}}
				className="partners-swiper"
			>
				{partners.map((partner) => (
					<SwiperSlide key={partner._id}>
						<div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100">
							<img
								src={partner.image.startsWith('/uploads')
									? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${partner.image}`
									: partner.image}
								alt={partner.title}
								className="max-h-12 w-auto object-contain"
							/>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	)
}

export default Partners
