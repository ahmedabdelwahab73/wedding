"use client"
import { ChevronsUp } from 'lucide-react';
import React from 'react';
import { useEcommerceScroll } from "@/context/EcommerceContext";
import { useAside } from '@/context/EcommerceContext';

const ScrollDownIndicator = () => {
	const { isScrolledFar } = useEcommerceScroll();
	const { isAsideOpen } = useAside();
	const handelClickUp = () => {
		const mainElement = document.querySelector('.main-element');
		if (mainElement) {
			mainElement.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		} else {
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	}
	return (
		<button className={`${isAsideOpen ? "hidden" : ""}
			bg-Brown-color cursor-pointer rounded-full p-2 fixed bottom-5 right-5 z-50 fixed-scroll-up
			${isScrolledFar ? "" : "hidden"}`}
			onClick={handelClickUp}>
			<ChevronsUp className='w-6 h-6 text-background' />
		</button>
	)
}

export default ScrollDownIndicator