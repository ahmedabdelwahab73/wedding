import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface FeedbackModalProps {
	isOpen: boolean;
	onClose: () => void;
	type: 'success' | 'error';
	message: string;
}

const FeedbackModal = ({ isOpen, onClose, type, message }: FeedbackModalProps) => {
	// Close on Escape key press
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, [onClose]);

	// Auto-close success modal after 1.5 seconds
	useEffect(() => {
		if (isOpen && type === 'success') {
			const timer = setTimeout(() => {
				onClose();
			}, 1500);
			return () => clearTimeout(timer);
		}
	}, [isOpen, type, onClose]);

	if (!isOpen) return null;

	const isSuccess = type === 'success';

	return (
		<div
			className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
			onClick={onClose}
		>
			<div
				className={`relative bg-card border-2 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isSuccess ? 'border-emerald-500/30' : 'border-rose-500/30'
					}`}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className="cursor-pointer absolute top-4 left-4 p-3 hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200/40 rounded-2xl transition-all max-h-[44px] z-10"
				>
					<X size={20} />
				</button>

				<div className="p-8 pb-10 flex flex-col items-center text-center">
					{/* Icon */}
					<div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${isSuccess ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
						}`}>
						{isSuccess ? <CheckCircle2 size={48} strokeWidth={2} /> : <XCircle size={48} strokeWidth={2} />}
					</div>

					{/* Title */}
					<h3 className={`text-2xl font-black mb-3 ${isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
						}`}>
						{isSuccess ? 'تمت العملية بنجاح!' : 'تنبيه أو خطأ!'}
					</h3>

					{/* Message */}
					<p className="text-foreground/80 font-medium leading-relaxed text-sm">
						{message}
					</p>

					{/* Action Button */}
					<button
						onClick={onClose}
						className={`cursor-pointer mt-8 w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all hover:opacity-90 active:scale-[0.98] ${isSuccess ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'
							}`}
					>
						موافق، إغلاق
					</button>
				</div>
			</div>
		</div>
	);
};

export default FeedbackModal;
