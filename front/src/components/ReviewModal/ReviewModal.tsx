"use client"
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations, useLocale } from 'next-intl';
import { Star, X, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { apiFetch } from '@/app/[locale]/lib/api';

interface ReviewModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
	const t = useTranslations('ReviewModal');
	const locale = useLocale();
	const isRtl = locale === 'ar';

	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [name, setName] = useState("");
	const [comment, setComment] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState("");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Reset state when opened
	useEffect(() => {
		if (isOpen) {
			setRating(0);
			setHoverRating(0);
			setName("");
			setComment("");
			setImage(null);
			setImagePreview(null);
			setIsSuccess(false);
			setIsSubmitting(false);
			setError("");
			const root = document.documentElement;
			const scrollBarWidth = window.innerWidth - root.clientWidth;
			// root.style.setProperty('--scrollbar-width', `${scrollBarWidth}px`);
			document.body.classList.add('modal-open');
		} else {
			document.body.classList.remove('modal-open');
		}
		return () => {
			document.body.classList.remove('modal-open');
		};
	}, [isOpen]);

	if (!isOpen || !mounted) return null;

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setImage(null);
			setImagePreview(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!name.trim()) {
			setError(isRtl ? "الاسم مطلوب" : "Name is required");
			return;
		}
		if (rating === 0) {
			setError(isRtl ? "التقييم بالنجوم مطلوب" : "Star rating is required");
			return;
		}

		setIsSubmitting(true);

		try {
			const formData = new FormData();
			formData.append('name', name);
			formData.append('body', comment);
			formData.append('rate', rating.toString());
			if (image) {
				formData.append('image', image);
			}

			const res = await apiFetch('/comments/add', {
				method: 'POST',
				body: formData
			});

			if (res.ok) {
				setIsSubmitting(false);
				setIsSuccess(true);

				setTimeout(() => {
					onClose();
				}, 2000);
			} else {
				const errorData = await res.json().catch(() => ({}));
				setError(errorData.message || (isRtl ? "فشل إرسال التقييم" : "Failed to submit review"));
				setIsSubmitting(false);
			}
		} catch (error) {
			console.error("Error submitting review:", error);
			setError(isRtl ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
			setIsSubmitting(false);
		}
	};

	const modalContent = (
		<div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			></div>

			{/* Modal Content */}
			<div
				dir={isRtl ? 'rtl' : 'ltr'}
				className="relative w-full max-w-md bg-background rounded-3xl 
				shadow-2xl border border-border/50 overflow-hidden transform transition-all p-5 max-h-[90vh] overflow-y-auto"
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-2 right-2 group p-2 hover:bg-foreground/10 rounded-full transition-all duration-300 cursor-pointer"
					aria-label="Close Sidebar"
				>
					<X size={23} className="text-foreground group-hover:rotate-90 transition-transform duration-300" />
				</button>

				{isSuccess ? (
					<div className="flex flex-col items-center justify-center h-48 text-center animate-in fade-in zoom-in duration-300">
						<div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
							<Star size={32} fill="currentColor" />
						</div>
						<h3 className="text-xl font-bold text-foreground mb-2">{t('successMessage')}</h3>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="flex flex-col gap-3 animate-in fade-in duration-300 mt-6">
						<div className="text-center">
							<h2 className="text-2xl font-bold text-foreground mb-1">{t('title')}</h2>
							<p className="text-sm text-foreground/60">{t('ratingLabel')}</p>
						</div>

						{/* Star Rating */}
						<div className="flex justify-center gap-2 mb-2" dir="ltr">
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									type="button"
									className="transition-transform hover:scale-110 focus:outline-none cursor-pointer"
									onMouseEnter={() => setHoverRating(star)}
									onMouseLeave={() => setHoverRating(0)}
									onClick={() => setRating(star)}
								>
									<Star
										size={40}
										className={`transition-colors duration-200 ${(hoverRating || rating) >= star
											? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
											: 'text-border fill-transparent'
											}`}
									/>
								</button>
							))}
						</div>

						{/* Name Input */}
						<div className="flex flex-col gap-2">
							<input
								type="text"
								id="name"
								className={`w-full bg-foreground/5 border 
								rounded-xl p-4 text-foreground focus:outline-none focus:border-gradient-primary 
								focus:ring-1 focus:ring-gradient-primary/50 transition-all h-[56px] 
								${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : "border-border/50"}`}
								placeholder={t('namePlaceholder')}
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									if (error) setError(""); // Remove error as user types
								}}
							/>
							{error && <p className="text-sm font-medium text-red-500 mt-1">{error}</p>}
						</div>

						{/* Comment Textarea */}
						<div className="flex flex-col gap-2">
							<textarea
								id="comment"
								rows={4}
								className="w-full bg-foreground/5 border border-border/50 
								rounded-xl p-4 text-foreground focus:outline-none focus:border-gradient-primary 
								focus:ring-1 focus:ring-gradient-primary/50 transition-all resize-none"
								placeholder={t('placeholder')}
								value={comment}
								onChange={(e) => setComment(e.target.value)}
							></textarea>
						</div>

						{/* Image Upload (Optional) */}
						<div className="flex flex-col items-center justify-center w-full gap-2 mt-2 mb-2">
							<label className="text-sm font-medium text-foreground/80 w-full">
								{t('PackageImage')}
							</label>
							<div className="flex flex-col items-center justify-center gap-2 mx-auto w-full">
								<div className="relative w-full h-24 mt-1 mx-auto text-center">
									<label className={`cursor-pointer bg-foreground/5 border border-border/50 
									rounded-xl hover:bg-foreground/10 transition-colors 
									flex items-center justify-center w-full h-full overflow-hidden ${imagePreview ? 'p-0 border-0' : 'p-3'}`}>
										<input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
										{imagePreview ? (
											<Image
												src={imagePreview}
												alt="Preview"
												width={96}
												height={96}
												className="w-full h-full object-cover rounded-lg"
											/>
										) : (
											<div className="flex flex-col items-center justify-center opacity-50 w-full h-full">
												<span className="text-2xl">+</span>
											</div>
										)}
									</label>

									{imagePreview && (
										<button
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setImage(null);
												setImagePreview(null);
											}}
											className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors z-10 cursor-pointer"
											title={t('Remove')}
										>
											<Trash2 size={16} />
										</button>
									)}
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-3 mt-4">
							<button
								type="submit"
								disabled={rating === 0 || isSubmitting}
								className="flex-1 px-4 py-3 bg-gradient-primary hover:bg-gradient-primary-hover text-[#ffffff] font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
							>
								{isSubmitting ? (
									<Loader2 className="animate-spin" size={20} />
								) : (
									t('submit')
								)}
							</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);

	return createPortal(modalContent, document.body);
};

export default ReviewModal;
