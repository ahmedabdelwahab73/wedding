import React from 'react'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import PackagesSlider from './componanent/PackagesSlider'
import Container from '@/components/Container';
import OtherImageSwiger from '../../componanets/OtherImageSwiger';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import HeadingTitle from '../../componanets/HeadingTitle';
import PackageDetailsBooking from './componanent/PackageDetailsBooking';
import { ItemspackageType, PackageDetailsType } from '@/app/types';

type Props = {
	params: Promise<{ locale: string; slug: string }>;
}

const Package = async ({ params }: Props) => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
	const t = await getTranslations('');
	const resolvedParams = await params;
	const locale = resolvedParams.locale || 'ar';
	const slug = decodeURIComponent(resolvedParams.slug).trim();

	// Extract the ID (the last part after the last dash)
	const parts = slug.split('-');
	const idStr = parts.length > 1 ? parts.pop()?.trim() : slug;


	let packageItem: PackageDetailsType | null = null;
	let allPackages: ItemspackageType[] = [];
	let customPackageImages: any[] = [];

	// Get the Host header to determine the correct server IP (works for mobile too)
	const reqHeaders = await headers();
	const host = reqHeaders.get('host') || 'localhost:3000';
	const hostname = host.split(':')[0]; // e.g. '192.168.1.3' or 'localhost'

	try {
		// 1. Fetch current package details
		if (idStr) {
			const res = await fetch(`${apiUrl}/api/home/packages/details`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'lang': locale,
				},
				body: JSON.stringify({ packageId: idStr }),
				cache: 'no-store'
			});

			if (res.ok) {
				const data = await res.json();
				const formatImg = (img: string) => img ? (img.startsWith('/uploads') ? `${apiUrl}${img}` : img) : null;

				packageItem = {
					id: data._id,
					title: data[`name-${locale}`] || data['name-ar'] || data['name-en'],
					subnameEn: data['subname-en'],
					description: (data[`point-${locale}`] && data[`point-${locale}`].length > 0)
						? data[`point-${locale}`].join(' • ')
						: (data.point && data.point.length > 0 ? data.point.join(' • ') : ''),
					points: data[`point-${locale}`] || data.point || [],
					price: data.price,
					offer: data.offer,
					Defaultimage: formatImg(data.default_image),
					images: (data.images || []).map((img: string) => formatImg(img)).filter(Boolean),
					number: data.number,
					mostseller: data.mostseller,
					rate: data.rate,
				};
			} else {
				console.error(`[SERVER] API returned ${res.status} for packageId: ${idStr}`);
			}
		}

		// 2. Fetch all packages for the slider
		const allRes = await fetch(`${apiUrl}/api/home/packages`, {
			headers: { 'lang': locale },
			cache: 'no-store'
		});

		if (allRes.ok) {
			const allData = await allRes.json();
			allPackages = allData.map((item: any) => ({
				id: item._id,
				title: locale === 'ar' ? item['name-ar'] : item['name-en'],
				subnameEn: item['subname-en'],
				price: item.price,
				offer: item.offer,
				mostseller: item.mostseller,
				rate: item.rate,
				number: item.number,
				image: item.default_image ? (item.default_image.startsWith('/uploads') ? `${apiUrl}${item.default_image}` : item.default_image) : null
			}));
		}

		// 3. Fetch custom package images
		const customImagesRes = await fetch(`${apiUrl}/api/custom-package-images`, {
			headers: { 'lang': locale },
			cache: 'no-store'
		});
		if (customImagesRes.ok) {
			const customData = await customImagesRes.json();
			if (customData && customData.length > 0) {
				const activeImages: string[] = [];
				customData.forEach((group: any) => {
					if (group.active !== false && group.active !== 0 && group.images) {
						activeImages.push(...group.images);
					}
				});
				if (activeImages.length > 0) {
					customPackageImages = activeImages.map((img: string) => img.startsWith('http') ? img : `${apiUrl}${img}`);
				}
			}
		}
	} catch (error) {
		console.error('[SERVER] Fetch error:', error);
	}

	if (!packageItem) {
		notFound();
	}
	const isAr = locale === 'ar';
	return (
		<div className="">
			{/* Header Section */}
			<div className='relative'>
				<div className='bg-black/15 absolute top-0 left-0 w-full h-full'></div>

				{/* Main Image */}
				{packageItem.Defaultimage && (
					<div className="relative h-[50vh]">
						<Image
							src={packageItem.Defaultimage}
							alt={packageItem.title}
							fill
							sizes="100vw"
							quality={100}
							className="object-cover"
							priority
						/>
					</div>
				)}
			</div>

			{/* Additional Images */}
			{packageItem.images && packageItem.images.length > 0 && (
				<div className="mt-10 overflow-hidden">
					{packageItem.images.length > 1 ? (
						<OtherImageSwiger images={packageItem.images} isAr={isAr} title={packageItem.title} />
					) : (
						<div className="flex justify-center px-[32px] md:px-0">
							<div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-[1.5rem] overflow-hidden shadow-lg border border-border group">
								<Image
									src={packageItem.images[0]}
									alt={`${packageItem.title}`}
									fill
									sizes="(max-width: 768px) 300px, 400px"
									quality={100}
									className="object-cover transition-transform duration-500 group-hover:scale-110"
								/>
								<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
						</div>
					)}
				</div>
			)}
			<PackageDetailsBooking
				packageItem={packageItem}
				t={t}
				locale={locale}
			/>
			{/* Other Packages Slider */}
			<Container>
				<PackagesSlider
					title={t('packageDetails.OtherPackages')}
					packages={allPackages}
					locale={locale}
					currentId={packageItem.id}
					customPackageImages={customPackageImages}
					DesignYourPackage={t('HomePage.DesignYourPackage')}
					DesignYourPackageDesc={t('HomePage.DesignYourPackageDesc')}
					StartDesigning={t('HomePage.StartDesigning')}
					apiUrl={apiUrl}
				/>
			</Container>
		</div >
	);
}

export default Package
