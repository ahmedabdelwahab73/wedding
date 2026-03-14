"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import PackageCard from '../componanets/PackageCard';
import CustomPackageCard from '../componanets/CustomPackageCard';
import { useTranslations } from 'next-intl';
import Container from '@/components/Container';
import { apiFetch } from '@/app/[locale]/lib/api';
import { useParams } from 'next/navigation';
import { ItemspackageType } from '@/app/types/e-commarce/package.types';
import Link from 'next/link';
import Loading from '@/components/Loading';
Riverside: 'Riverside'

const MorePackages = () => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
	const t = useTranslations('HomePage');
	const params = useParams();
	const locale = params?.locale as string || 'ar';
	const [packages, setPackages] = useState<ItemspackageType[]>([]);
	const [customPackageImages, setCustomPackageImages] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeCardId, setActiveCardId] = useState<string | null>(null);
	const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	useEffect(() => {
		const fetchPackages = async () => {
			try {
				setLoading(true);
				const res = await apiFetch('/home/packages');
				if (res.ok) {
					const data = await res.json();
					const mappedData: ItemspackageType[] = data.map((item: any) => ({
						id: item._id,
						title: locale === 'ar' ? item['name-ar'] : item['name-en'],
						description: (item[`point-${locale}`] && item[`point-${locale}`].length > 0)
							? item[`point-${locale}`].join(' • ')
							: (item.point && item.point.length > 0 ? item.point.join(' • ') : ''),
						points: item[`point-${locale}`] || item.point || [],
						price: item.price,
						offer: item.offer,
						mostseller: item.mostseller,
						rate: item.rate,
						image: item.default_image ? (item.default_image.startsWith('/uploads') ? `${apiUrl}${item.default_image}` : item.default_image) : null
					}));
					setPackages(mappedData);
				}

				// Fetch custom package images
				const customImgRes = await apiFetch('/custom-package-images', { headers: { 'lang': locale } });
				if (customImgRes.ok) {
					const customImgData = await customImgRes.json();
					if (customImgData && customImgData.length > 0) {
						const activeImages: string[] = [];
						customImgData.forEach((group: any) => {
							if (group.active !== 0 && group.images) activeImages.push(...group.images);
						});
						setCustomPackageImages(activeImages);
					}
				}
			} catch (error) {
				console.error('Error fetching packages:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchPackages();
	}, [locale]);
	useEffect(() => {
		if (packages.length === 0) return;

		const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
		if (!isTouch) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = entry.target.getAttribute('data-card-id');
					if (entry.isIntersecting) {
						setActiveCardId(id);
					} else {
						setActiveCardId((prev) => (prev === id ? null : prev));
					}
				});
			},
			{
				// Trigger when the card is in the middle 30% of the viewport
				rootMargin: '-35% 0px -35% 0px',
				threshold: 0,
			}
		);

		cardRefs.current.forEach((el) => observer.observe(el));

		return () => {
			observer.disconnect();
		};
	}, [packages]);

	const setCardRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
		if (el) cardRefs.current.set(id, el);
		else cardRefs.current.delete(id);
	}, []);

	return (
		<Container className='pt-32 pb-16'>
			<h2 className='text-center mb-16 text-3xl font-normal tracking-tight
			 text-foreground uppercase'>{t('ourpackagess')}</h2>

			{loading ? (
				<Loading />
			) : (
				<div className='grid grid-cols-5 max-llg:grid-cols-4 max-mmd:grid-cols-3 max-mxmd:grid-cols-2 max-smd:grid-cols-1 gap-6'>
					{packages?.map((item, index) => (
						<div
							key={item.id}
							data-card-id={item.id}
							ref={setCardRef(item.id)}
						>
							<PackageCard
								key={item.id}
								item={item}
								index={index}
								priority={index < 5}
								ViewDetails={t('ViewDetails')} locale={locale}
								isScrollActive={activeCardId === item.id}
							/>
						</div>
					))}

					{/* Custom Package Box */}
					<CustomPackageCard
						customPackageImages={customPackageImages}
						DesignYourPackage={t('DesignYourPackage')}
						DesignYourPackageDesc={t('DesignYourPackageDesc')}
						StartDesigning={t('StartDesigning')}
						locale={locale}
						apiUrl={apiUrl}
					/>
				</div>
			)}
		</Container>
	)
}

export default MorePackages;