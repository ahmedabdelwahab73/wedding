import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Open_Sans, Fira_Code, Dancing_Script, Poppins } from "next/font/google";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import { cookies } from "next/headers";
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/app/[locale]/globals.scss';
const openSans = Open_Sans({
	variable: "--font-open-sans",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
	display: "swap",
});

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
});

const firaCode = Fira_Code({
	variable: "--font-fira-code",
	subsets: ["latin"],
	display: "swap",
});

const dancingScript = Dancing_Script({
	variable: "--font-dancing-script",
	subsets: ["latin"],
	display: "swap",
});

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params;
	const isAr = locale === 'ar';

	const title = isAr ? 'ميمو فوتوغرافى' : 'Mimo photography';
	const description = isAr
		? 'میمو فوتوغرافي - خدمات تصوير احترافية. حجز باقات التصوير بأفضل الجودات.'
		: 'Mimo photography - Professional photography services. Book high quality photography packages.';

	return {
		metadataBase: new URL('https://mimo-flame.vercel.app'),
		title: {
			default: title,
			template: `%s | ${title}`,
		},
		description: description,
		keywords: isAr
			? ['تصوير', 'ميمو', 'باقات تصوير', 'فوتوغرافي', 'جلسات تصوير', 'عروض تصوير']
			: ['photography', 'Mimo', 'photography packages', 'photoshoots', 'photo offers'],
		authors: [{ name: 'Mimo Photography' }],
		creator: 'Mimo Photography',
		openGraph: {
			type: 'website',
			locale: isAr ? 'ar_EG' : 'en_US',
			url: `https://mimo-flame.vercel.app/${locale}`,
			title: title,
			description: description,
			siteName: title,
		},
		alternates: {
			canonical: `https://mimo-flame.vercel.app/${locale}`,
			languages: {
				'ar': 'https://mimo-flame.vercel.app/ar',
				'en': 'https://mimo-flame.vercel.app/en',
			},
		},
	};
}

export default async function LocaleLayout({
	children,
	params
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// التأكد من أن اللغة مدعومة
	if (!routing.locales.includes(locale as any)) {
		notFound();
	}

	// تفعيل اللغة للـ static rendering
	setRequestLocale(locale);

	// تحميل ملفات الترجمة
	const messages = await getMessages();

	// قراءة الكوكيز للإعدادات التانية (Theme)
	const cookieStore = await cookies();
	const themeCookie = cookieStore?.get("theme");
	const savedTheme = themeCookie?.value || "light";

	return (
		<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={savedTheme} suppressHydrationWarning>
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebSite",
							"name": locale === 'ar' ? "ميمو فوتوغرافى" : "Mimo photography",
							"url": "https://mimo-flame.vercel.app/",
							"potentialAction": {
								"@type": "SearchAction",
								"target": {
									"@type": "EntryPoint",
									"urlTemplate": "https://mimo-flame.vercel.app/search?q={search_term_string}"
								},
								"query-input": "required name=search_term_string"
							}
						})
					}}
				/>
			</head>
			<body className={`
        ${openSans.variable} 
        ${firaCode.variable}
        ${dancingScript.variable} 
        ${poppins.variable}
        antialiased font-sans
      `}>
				<NextIntlClientProvider messages={messages}>
					<ThemeWrapper
						attribute="class"
						defaultTheme="system"
						enableSystem
						themes={['light', 'dark', 'system']}
						savedTheme={savedTheme}
					>
						{/* <main> */}
						{children}
						{/* </main> */}
					</ThemeWrapper>
				</NextIntlClientProvider>
				<SpeedInsights />
			</body>
		</html>
	);
}