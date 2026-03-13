import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ScrollDownIndicator from "@/components/ScrollDownIndicator";
import { EcommerceProvider } from "@/context/EcommerceContext";
import Aside from "@/components/e-commarce/aside";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const resolvedParams = await params;
	const locale = resolvedParams.locale;
	const t = await getTranslations({ locale, namespace: 'Metadata' });

	return {
		title: t('title'),
		description: t('description'),
		icons: {
			icon: "/small.png",
		},
		verification: {
			google: 'jZm3qvBgkvN62UZ-BagZ9zINJCWdP23sG9FDPnqq1yQ',
		}
	};
}

async function fetchLogo(locale: string) {
	try {
		const base_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
		const res = await fetch(`${base_url}/api/logos`, {
			headers: { 'lang': locale },
			next: { tags: ['logo'] }
		});
		if (res.ok) {
			const data = await res.json();
			if (data && data.length > 0) {
				const logo = data[0];
				const lightSrc = logo.imageLight || logo.image;
				const darkSrc = logo.imageDark || logo.image;
				return {
					imageLight: lightSrc.startsWith('http') ? lightSrc : `${base_url}${lightSrc}`,
					imageDark: darkSrc.startsWith('http') ? darkSrc : `${base_url}${darkSrc}`
				};
			}
		}
	} catch (error) {
		console.error('Error fetching logo in layout:', error);
	}
	return null;
}

export default async function EcommerceLayout({
	children,
	params
}: Readonly<{ children: React.ReactNode, params: Promise<{ locale: string }> }>) {
	const resolvedParams = await params;
	const logoData = await fetchLogo(resolvedParams.locale);

	return (
		<EcommerceProvider>
			<ScrollDownIndicator />
			<Aside logoData={logoData} />
			<Header logoData={logoData} />
			<main className="h-[100vh] overflow-auto main-element flex flex-col">
				<div className="flex-1">
					{children}
				</div>
				<Footer logoData={logoData} />
			</main>
		</EcommerceProvider>
	);
}
