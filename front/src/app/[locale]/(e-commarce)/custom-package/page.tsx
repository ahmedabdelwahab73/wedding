import React from 'react'
import CustomPackageClient from './CustomPackageClient'
import { getLocale } from 'next-intl/server'

interface Option {
	_id: string;
	pointAr: string;
	pointEn: string;
	price: number;
}

interface CustomPackage {
	_id: string;
	sectionNameAr: string;
	sectionNameEn: string;
	options: Option[];
	sort: number;
	active: boolean;
}

const CustomPackagePage = async () => {
	const locale = await getLocale();
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

	let packages: CustomPackage[] = [];

	try {
		const res = await fetch(`${apiUrl}/api/custom-packages`, {
			headers: { 'lang': locale },
			next: { tags: ['packages'] }
		});

		if (res.ok) {
			const data = await res.json();
			packages = data.filter((pkg: CustomPackage) => pkg.active);
		}
	} catch (error) {
		console.error('Error fetching custom packages on server:', error);
	}

	return (
		<CustomPackageClient initialPackages={packages} locale={locale} />
	)
}

export default CustomPackagePage