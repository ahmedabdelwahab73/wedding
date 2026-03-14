"use client"
import { useEffect } from "react";

export default function BookingLayout({ children }: { children: React.ReactNode }) {

	useEffect(() => {
		return () => {
			// في بيئة التطوير (React 18 Strict Mode)، الكومبوننت بيتعمله Mount -> Unmount -> Mount بسرعة.
			// عشان الداتا متتمسحش بالغلط أول ما تدخل الصفحة، لازم نتأكد إن مسار الصفحة اتغير فعلاً لمكان بره الـ Flow.
			if (typeof window !== "undefined") {
				const currentUrl = window.location.pathname;

				// الداتا هتفضل موجودة بس لو اليوزر جوه باكدج الكاستم (أي صفحة تانية هيتمسح)
				const isStillInFlow = currentUrl.includes('/custom-package');

				if (!isStillInFlow) {
					localStorage.removeItem("selectedOptionIds");
				}
			}
		};
	}, []);

	return <>{children}</>;
}
