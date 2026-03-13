"use client"
import { useState, useEffect } from 'react';

export function useDarkMode() {
	const [isDark, setIsDark] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		// Initialize state
		setIsMounted(true);
		setIsDark(document.documentElement.classList.contains('dark'));
		// Set up observer for changes to the 'class' attribute of html element
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === 'class') {
					setIsDark(document.documentElement.classList.contains('dark'));
				}
			});
		});
		observer.observe(document.documentElement, { attributes: true });
		return () => observer.disconnect();
	}, []);

	return { isDark, isMounted };
}
