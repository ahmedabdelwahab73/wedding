import SwigerLanding from './componanets/SwigerLanding';
import Packages from './componanets/Packages';
import Testimonials from './componanets/Testimonials';
import Partners from './componanets/Partners';
import Container from '@/components/Container';
import { getLocale, getTranslations } from 'next-intl/server';

const Mainpage = async () => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
	const locale = await getLocale();
	const t = await getTranslations('HomePage');

	// Fetch slider data from the backend API
	let sliderData = [];
	let initialPackages = [];
	let initialCustomImages: string[] = [];
	let initialTestimonials = [];
	let initialPartners = [];

	try {
		const [sliderRes, packagesRes, customImgRes, testimonialsRes, partnersRes] = await Promise.all([
			fetch(`${apiUrl}/api/home/sliders`, {
				headers: { 'lang': locale },
				next: { tags: ['sliders'] }
			}),
			fetch(`${apiUrl}/api/home/packages`, {
				headers: { 'lang': locale },
				next: { tags: ['packages'] }
			}),
			fetch(`${apiUrl}/api/custom-package-images`, {
				headers: { 'lang': locale },
				next: { tags: ['packages'] }
			}),
			fetch(`${apiUrl}/api/comments`, {
				headers: { 'lang': locale },
				next: { tags: ['testimonials'] }
			}),
			fetch(`${apiUrl}/api/partners`, {
				headers: { 'lang': locale },
				next: { tags: ['partners'] }
			})
		]);

		if (sliderRes.ok) sliderData = await sliderRes.json();
		if (packagesRes.ok) {
			const pkgData = await packagesRes.json();
			initialPackages = pkgData.map((item: any) => ({
				id: item._id,
				title: locale === 'ar' ? item['name-ar'] : item['name-en'],
				description: (item[`point-${locale}`] && item[`point-${locale}`].length > 0)
					? item[`point-${locale}`].join(' • ')
					: (item.point && item.point.length > 0 ? item.point.join(' • ') : ''),
				points: item[`point-${locale}`] || item.point || [],
				price: item.price,
				offer: item.offer,
				subnameEn: item['subname-en'],
				mostseller: item.mostseller,
				rate: item.rate,
				image: item.default_image
					? (item.default_image.startsWith('/uploads')
						? `${apiUrl}${item.default_image}`
						: item.default_image)
					: null
			}));
		}
		if (customImgRes.ok) {
			const customData = await customImgRes.json();
			customData.forEach((group: any) => {
				if (group.active !== 0 && group.images) {
					initialCustomImages.push(...group.images);
				}
			});
		}
		if (testimonialsRes.ok) {
			initialTestimonials = await testimonialsRes.json();
		}
		if (partnersRes.ok) {
			initialPartners = await partnersRes.json();
		}
	} catch (error) {
		console.error('Failed to fetch data on server:', error);
	}

	const isAr = locale === 'ar';

	return (
		<div className='w-full mx-auto Landing overflow-hidden'>
			{/* h-[60vh] */}
			<div className='h-[100vh] max-mamd:h-[80vh] max-mxmdd:h-[60vh] w-full'>
				<SwigerLanding
					SliderData={sliderData}
					apiUrl={apiUrl}
				/>
			</div>
			<Container>
				<Packages
					title={t('ourpackagess')}
					viewmore={t('viewmore')}
					ViewDetails={t('ViewDetails')}
					DesignYourPackage={t('DesignYourPackage')}
					DesignYourPackageDesc={t('DesignYourPackageDesc')}
					StartDesigning={t('StartDesigning')}
					apiUrl={apiUrl}
					initialPackages={initialPackages}
					initialCustomImages={initialCustomImages}
				/>
				<Testimonials
					title={t('testimonials')}
					ShareYourExperience={t('ShareYourExperience')}
					initialData={initialTestimonials}
				/>
				<Partners initialData={initialPartners} />
			</Container>
		</div>
	)
}

export default Mainpage;