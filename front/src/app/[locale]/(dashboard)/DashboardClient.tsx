"use client"
import DashHeader from "@/app/[locale]/(dashboard)/componanets/DashHeader/DashHeader";
import '@/app/[locale]/globals.scss';
import DashAside from "./componanets/DashAside/DashAside";
import DashContainer from "./componanets/DashContainer/DashContainer";
import { SidebarProvider } from "./componanets/SidebarContext";
import { ConfirmModalProvider } from "./componanets/ConfirmModalContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DashboardContent = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="flex flex-col min-h-screen" dir="rtl">
			<DashHeader />
			<div className="flex flex-1 relative  lg:pt-0 overflow-hidden w-full">
				<DashAside />
				<main className={`flex-1 min-w-0 bg-background/50 transition-all duration-300`}>
					<DashContainer>
						{children}
					</DashContainer>
				</main>
			</div>
		</div>
	)
}

export default function DashboardClient({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		if (!token) {
			router.replace('/mimo');
		} else {
			setIsAuthenticated(true);
		}
	}, [router]);

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
			</div>
		);
	}

	return (
		<SidebarProvider>
			<ConfirmModalProvider>
				<DashboardContent>
					{children}
				</DashboardContent>
			</ConfirmModalProvider>
		</SidebarProvider>
	);
}
