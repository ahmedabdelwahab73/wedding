"use client"
import React from 'react'
import { Star, Quote, Plus } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { apiFetch } from '@/app/[locale]/lib/api';

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import HeadingTitle from './HeadingTitle'
import ReviewModal from '@/components/ReviewModal/ReviewModal'

interface TestimonialData {
	_id: string;
	name: string;
	body: string;
	rate: number;
	image?: string;
	createdAt: string;
}

const Testimonials = ({ title, ShareYourExperience, initialData }: { title: string, ShareYourExperience: string, initialData?: TestimonialData[] }) => {
	const locale = useLocale();
	const isRtl = locale === 'ar';
	const [testimonials, setTestimonials] = React.useState<TestimonialData[]>(initialData || []);
	const [isModalOpen, setIsModalOpen] = React.useState(false);

	React.useEffect(() => {
		if (initialData) return;
		const fetchTestimonials = async () => {
			try {
				const base_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
				const res = await fetch(`${base_url}/api/comments`, {
					headers: { 'lang': locale }
				});
				if (res.ok) {
					const data = await res.json();

					if (Array.isArray(data)) {
						setTestimonials(data);
					} else {
						console.error("Testimonials data is not an array:", data);
						setTestimonials([]);
					}
				} else {
					console.error("Testimonials API error:", res.status, res.statusText);
				}
			} catch (error) {
				console.error('Failed to fetch testimonials:', error);
			}
		};
		fetchTestimonials();
	}, [locale, initialData]);

	if (testimonials.length === 0) return null;

	const renderCard = (item: TestimonialData) => (
		<div
			className="group relative p-8 rounded-2xl bg-background-card border border-border/80 
			shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 
			hover:border-Brown-color flex flex-col h-full"
		>
			{/* Decor icon */}
			<div className={`absolute top-4 
				${isRtl ? 'left-6 text-Brown-color transition-colors group-hover:text-[#b0a090] scale-x-[-1]'
					: 'right-6 text-Brown-color transition-colors group-hover:text-[#b0a090]'}`}>
				<Quote size={40} />
			</div>

			{/* Stars */}
			<div className="flex gap-1 mb-6">
				{[...Array(5)].map((_, i) => (
					<Star
						key={i}
						size={16}
						className={i < item.rate ? "fill-yellow-400 text-yellow-400" : "text-border fill-transparent"}
					/>
				))}
			</div>

			{/* Content */}
			<p className="text-foreground/80 leading-relaxed mb-0 flex-grow">
				"{item.body}"
			</p>

			{/* Author */}
			<div className="flex items-center gap-4 border-t border-border/30 pt-2">
				<div className="w-10 h-10 rounded-full bg-[#e3e2e1] flex items-center justify-center 
				text-Brown-color font-bold text-sm overflow-hidden shrink-0">
					{item.image ? (
						<Image
							src={item.image.startsWith('/uploads')
								? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.image}`
								: item.image}
							alt=""
							width={40}
							height={40}
							className="w-full h-full object-cover"
						/>
					) : (
						"M"
					)}
				</div>
				<div>
					<h4 className="font-semibold text-foreground text-sm leading-none mb-1">{item.name}</h4>
					<span className="text-foreground/70 text-xs">
						{new Date(item.createdAt).toLocaleDateString(locale, {
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})}
					</span>
				</div>
			</div>
		</div>
	);

	return (
		<div className='pb-20 max-ssmd:pb-10 testimonials-swiper-wrapper relative' dir={isRtl ? 'rtl' : 'ltr'}>
			<div className="flex flex-col items-center mb-16 max-ssmd:mb-5">
				<HeadingTitle>
					{title}
					<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-primary rounded-full opacity-80"></span>
				</HeadingTitle>
			</div>

			{testimonials.length < 4 && (
				<div className="hidden min-[1200px]:flex flex-wrap justify-center gap-[30px] px-4 max-w-[1200px] mx-auto">
					{testimonials.map((item) => (
						<div key={item._id} className="w-full md:w-[calc(50%-15px)] lg:w-[calc(33.333%-20px)] max-w-[400px] h-auto py-4">
							{renderCard(item)}
						</div>
					))}
				</div>
			)}

			<div className={`${testimonials.length < 4 ? "block min-[1200px]:hidden" : "block"}`}>
				<Swiper
					key={locale} // Re-init swiper when locale changes to fix direction issues
					modules={[Pagination, Autoplay]}
					spaceBetween={30}
					slidesPerView={1}
					centeredSlides={false}
					dir={isRtl ? 'rtl' : 'ltr'}
					pagination={{
						clickable: true,
						dynamicBullets: true
					}}
					autoplay={{
						delay: 5000,
						disableOnInteraction: true,
					}}
					breakpoints={{
						0: {
							slidesPerView: 1,
							spaceBetween: 20
						},
						768: {
							slidesPerView: 2,
							spaceBetween: 30
						},
						992: {
							slidesPerView: 3,
							spaceBetween: 30
						},
						1200: {
							slidesPerView: 4,
							spaceBetween: 30
						}
					}}
					loop={testimonials.length >= 4}
					className="pb-16! px-4 relative"
				>
					{testimonials?.map((item) => (
						<SwiperSlide key={item._id} className="h-auto! py-4 px-2">
							{renderCard(item)}
						</SwiperSlide>
					))}
					<div className="flex justify-end mt-0 absolute bottom-5 z-50 right-0 cursor-pointer"
						onClick={() => setIsModalOpen(true)}>
						<button className="flex items-center gap-2 underline text-[#af9e8e] px-6 py-3 
						rounded-full font-semibold hover:opacity-90 transition-opacity cursor-pointer">
							{ShareYourExperience}
						</button>
					</div>
				</Swiper>
			</div>

			<ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</div>
	)
}

export default Testimonials
