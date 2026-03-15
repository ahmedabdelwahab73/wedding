import type { Metadata } from "next";
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata: Metadata = {
	title: "Mimo | Login",
	description: "تسجيل الدخول إلى لوحة تحكم للتصوير ميمو للتصوير الفوتوغرافي.",
	icons: {
		icon: '/small.png',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "648342845222-l933ptnmfdn85060qrs6ute5nqqooffo.apps.googleusercontent.com";

	return (
		<GoogleOAuthProvider clientId={googleClientId}>
			<main className="">
				{children}
			</main>
		</GoogleOAuthProvider>
	);
}
