import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
	isUploading: boolean;
	onComplete?: () => void;
}

const ProgressBar = ({ isUploading, onComplete }: ProgressBarProps) => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isUploading) {
			setProgress(5); // Start at 5% immediately so it's visible
			// Simulate progress
			interval = setInterval(() => {
				setProgress((prev) => {
					if (prev < 30) return prev + Math.random() * 15;
					if (prev < 60) return prev + Math.random() * 8;
					if (prev < 90) return prev + Math.random() * 3;
					if (prev < 98) return prev + 0.5;
					return prev;
				});
			}, 250);
		} else {
			if (progress > 0) {
				setProgress(100);
				const timeout = setTimeout(() => {
					setProgress(0);
					if (onComplete) onComplete();
				}, 600);
				return () => clearTimeout(timeout);
			}
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isUploading]);

	// Always show if uploading, even at 0%
	if (!isUploading && progress === 0) return null;

	return (
		<div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6 relative shadow-inner">
			<div
				className="h-full bg-primary transition-all duration-500 ease-out flex items-center justify-end relative"
				style={{ width: `${Math.min(progress, 100)}%` }}
			>
				{/* Animated shine effect */}
				<div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

				<div className="h-full w-8 bg-white/20 blur-sm" />
			</div>
			<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
				<span className="text-[10px] font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
					{isUploading ? `جاري الرفع... ${Math.round(progress)}%` : 'تم التحميل بنجاح ✓'}
				</span>
			</div>
		</div>
	);
};

export default ProgressBar;
