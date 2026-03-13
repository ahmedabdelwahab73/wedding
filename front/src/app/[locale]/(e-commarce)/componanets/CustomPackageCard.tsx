import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import Image from 'next/image';
import Link from 'next/link';

type IProps = {
	customPackageImages: string[];
	DesignYourPackage: string;
	DesignYourPackageDesc: string;
	StartDesigning: string;
	locale: string;
	apiUrl: string;
}
const CustomPackageCard = ({ customPackageImages, DesignYourPackage, DesignYourPackageDesc, StartDesigning, locale, apiUrl }: IProps) => {
	return (
		<Link
			href="/custom-package"
			className="group relative rounded-3xl 
				bg-background-card
				 border border-border/80 shadow-sm transition-all duration-500 
				 hover:shadow-xl hover:-translate-y-2 hover:border-Brown-color 
				 flex flex-col justify-center items-center h-full min-h-[400px] overflow-hidden cursor-pointer">

			{/* Background Slider */}
			{customPackageImages.length > 0 ? (
				<div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
					{/* Overlay with blur that fades on hover */}
					<div className="absolute inset-0 bg-background/30 group-hover:bg-background/20 transition-all 
					duration-700 z-10 backdrop-blur-[2px] group-hover:backdrop-blur-0"></div>
					{/* Image scale animation */}
					<div className="w-full h-full transition-transform duration-1000 group-hover:scale-110 relative">
						<Swiper
							modules={[Autoplay]}
							spaceBetween={0}
							slidesPerView={1}
							autoplay={{
								delay: 3500,
								disableOnInteraction: false,
							}}
							loop={customPackageImages.length > 1}
							className="w-full h-full"
							allowTouchMove={false}
						>
							{customPackageImages.map((img, i) => (
								<SwiperSlide key={i} className="w-full h-full relative">
									<Image
										src={img.startsWith('/uploads') || img.startsWith('//uploads') ? `${apiUrl}${img}` : img}
										alt={`Custom Package bg ${i}`}
										fill
										quality={100}
										className="object-cover"
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									/>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				</div>
			) : (
				<div className="absolute inset-0 bg-gradient-to-br from-Brown-color/5 to-transparent z-0 pointer-events-none"></div>
			)}

			<div className="relative z-10 flex flex-col items-center 
					justify-center text-center p-8 gap-6 h-full w-full">
				<h3 className="text-2xl font-bold text-[#ffffff] drop-shadow-sm">
					{DesignYourPackage}
				</h3>
				<p className="text-[#ffffff] font-medium text-sm drop-shadow-sm max-w-[200px]">
					{DesignYourPackageDesc}
				</p>
				<div className="mt-4 bg-gradient-primary text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-Brown-color/20 group-hover:shadow-Brown-color/50 group-hover:-translate-y-1 transition-all duration-300">
					{StartDesigning}
				</div>
			</div>
		</Link>
	)
}

export default CustomPackageCard