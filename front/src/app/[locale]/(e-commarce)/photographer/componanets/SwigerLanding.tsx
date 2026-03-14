"use client"
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Parallax, Navigation, Autoplay } from 'swiper/modules';

// Import Swiper styles
import '@/app/[locale]/styles/components/_landing-slider.scss';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/parallax';
import LandingFrame from './LandingFrame'
import LandingNavigation from './LandingNavigation'

type SliderItem = {
	_id: string;
	image: string;
	sort: number;
	active: boolean;
}

type IPRops = {
	SliderData: SliderItem[];
	apiUrl: string;
}

const SwigerLanding = ({ SliderData, apiUrl }: IPRops) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="w-full h-full bg-black/90 relative overflow-hidden">
				{SliderData && SliderData.length > 0 && (
					<div className="tst-banner h-full">
						<div className='bg-black/20 absolute h-full w-full z-10 top-0 left-0'></div>
						<LandingFrame
							slideImage={SliderData[0].image}
							priority={true}
							apiUrl={apiUrl}
						/>
					</div>
				)}
			</div>
		);
	}

	return (
		<Swiper
			modules={[EffectFade, Parallax, Navigation, Autoplay]}
			effect="fade"
			onClick={() => {
				document.dispatchEvent(new CustomEvent('close-dropdowns'));
			}}
			speed={600}
			parallax={true}
			navigation={{
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			}}
			autoplay={{
				delay: 4000,
				disableOnInteraction: true
			}}
			dir='ltr'
			loop={SliderData?.length > 1}
			className="swiper swiper-container swiper-fade tst-main-slider h-full"
		>
			{SliderData?.map((slide, index) => (
				<SwiperSlide key={slide?._id} className="swiper-slide">
					<div className="tst-banner ">
						<div className='bg-black/20 absolute h-full w-full z-10 top-0 left-0'></div>
						<LandingFrame
							slideImage={slide?.image}
							priority={index === 0}
							apiUrl={apiUrl}
						/>
					</div>
				</SwiperSlide>
			))}
			<LandingNavigation />
		</Swiper>
	)
}

export default SwigerLanding;