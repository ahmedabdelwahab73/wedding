import Image from "next/image";
import Container from "@/components/Container";
import { Sparkles } from "lucide-react";
import Whitelogo from '@/public/logowhite.png';
import { getTranslations } from "next-intl/server";

export const metadata = {
	title: "About | Photographer",
	description: "Learn more about our photography services and passion.",
};

const AboutPage = async () => {
	const t = await getTranslations('AboutPage');

	return (
		<div className="w-full pb-5 overflow-hidden">
			{/* Hero Section */}
			<div className="relative w-full h-[60vh] flex items-center justify-center bg-black/90">
				{/* Background overlay is now the container background */}
				<div className="relative z-10 w-full h-full p-10 flex items-center justify-center">
					<Image
						src={Whitelogo}
						alt="Photography Hero"
						fill
						className="object-contain p-8 opacity-80"
						priority
					/>
				</div>
			</div>

			<Container className="mt-16 md:mt-24">
				{/* Story Section */}
				<div className="mb-20">
					<div className="flex flex-col gap-6">
						<div className="flex items-center gap-3 text-[#dca54a] mb-2">
							<Sparkles className="w-6 h-6" />
							<span className="text-sm font-semibold tracking-wider uppercase">{t('title')}</span>
						</div>
						<h2 className="text-2xl md:text-4xl font-bold leading-snug">
							{t('subtitle')}
						</h2>
						<p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed text-justify">
							{t('paragraph1')}
						</p>
						<p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed text-justify">
							{t('paragraph2')}
						</p>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default AboutPage;