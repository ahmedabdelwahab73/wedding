import React, { useRef } from 'react'
import { X, Upload, ImageIcon, ImagePlus, Save } from 'lucide-react'
import StatusToggle from '../componanets/StatusToggle';
import { compressImage } from '@/utils/imageUtils';
import ProgressBar from '../componanets/ProgressBar';
import { useState } from 'react';

interface CustomPackageGroup {
	_id?: string;
	images: string[];
	active: boolean;
}

interface FormDataState {
	existingImages: string[];
	images: File[];
	active: boolean;
}

interface ModalProps {
	setModalOpen: (open: boolean) => void;
	editingGroup: CustomPackageGroup | null;
	formData: FormDataState;
	setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
	handleSubmit: (e: React.FormEvent) => void;
}

const CustomPackageImageModal = ({ setModalOpen, editingGroup, formData, setFormData, handleSubmit }: ModalProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
	const [isSubmitting, setIsSubmitting] = useState(false);

	const onFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		let retries = 3;
		let success = false;

		while (retries > 0 && !success) {
			setIsSubmitting(true);
			try {
				await handleSubmit(e);
				success = true;
			} catch (error: any) {
				if (error.message === 'TIMEOUT' && retries > 1) {
					retries--;
					console.warn(`Gallery upload timed out. Retrying... (${3 - retries}/3)`);
					setIsSubmitting(false); // Reset progress bar
					await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before retry
					continue;
				}
				setIsSubmitting(false);
				throw error;
			}
		}
		if (success) {
			setIsSubmitting(false);
			// Give the progress bar 800ms for completion animation before the modal closes
			await new Promise(resolve => setTimeout(resolve, 800));
		} else {
			setIsSubmitting(false);
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const fileArray = Array.from(e.target.files);
			setFormData({ ...formData, images: [...formData.images, ...fileArray] });
		}
	}

	const removeNewSelectedImage = (indexToRemove: number, e: React.MouseEvent) => {
		e.stopPropagation();
		const updatedImages = formData.images.filter((_, index) => index !== indexToRemove);
		setFormData({ ...formData, images: updatedImages });
	};

	const removeExistingImage = (urlToRemove: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const updatedImages = formData.existingImages.filter((url) => url !== urlToRemove);
		setFormData({ ...formData, existingImages: updatedImages });
	};

	const getFilePreview = (file: File) => {
		try { return URL.createObjectURL(file); } catch (e) { return null; }
	};

	const getTotalImagesCount = () => formData.existingImages.length + formData.images.length;

	return (
		<div
			className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
		>
			<div
				className="bg-[#ffffff] border border-border w-full max-w-3xl rounded-3xl 
				overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center p-6 border-b border-border bg-muted/20">
					<h2 className="text-xl font-bold flex items-center gap-2">
						<ImageIcon className="text-primary" />
						{editingGroup ? 'تعديل مجموعة الصور (الصف)' : 'إضافة مجموعة صور جديدة (صف كامل)'}
					</h2>
					<button
						onClick={() => setModalOpen(false)}
						className="cursor-pointer p-3 hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200/40 rounded-2xl transition-all max-h-[44px]"
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={onFormSubmit} className="p-6 space-y-6 overflow-y-auto">

					{/* Images Area */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<label className="text-sm font-bold text-foreground flex items-center gap-2">
								<ImageIcon size={16} className="text-primary" />
								صور المجموعة
								{getTotalImagesCount() === 0 && <span className="text-rose-500">*</span>}
							</label>
							<div className="text-xs bg-muted px-2 py-1 rounded-md font-bold">
								الإجمالي: {getTotalImagesCount()} صورة
							</div>
						</div>

						<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">

							{/* Existing Images (When Editing) */}
							{formData.existingImages.map((url, idx) => (
								<div key={`exist-${idx}`} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-border bg-black/5 group">
									<img
										src={url.startsWith('/uploads') ? `${apiUrl}${url}` : url}
										alt={`Existing ${idx}`}
										className="w-full h-full object-cover"
									/>
									<button
										type="button"
										onClick={(e) => removeExistingImage(url, e)}
										className="absolute top-1 left-1 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
										title="حذف هذه الصورة من المجموعة"
									>
										<X size={14} />
									</button>
								</div>
							))}

							{/* Newly Selected Preview Images */}
							{formData.images.map((file, idx) => (
								<div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-primary/40 bg-black/5 group">
									<img
										src={getFilePreview(file) as string}
										alt={`New Preview ${idx}`}
										className="w-full h-full object-cover"
									/>
									<div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg">
										جديد
									</div>
									<button
										type="button"
										onClick={(e) => removeNewSelectedImage(idx, e)}
										className="cursor-pointer absolute top-1 left-1 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
										title="إلغاء الإضافة"
									>
										<X size={14} />
									</button>
								</div>
							))}

							{/* Add More Button / Trigger */}
							<div
								onClick={() => fileInputRef.current?.click()}
								className="relative flex flex-col items-center justify-center aspect-square border-2 border-dashed border-border hover:border-primary/50 bg-secondary/50 rounded-xl cursor-pointer transition-all group"
							>
								<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
									<ImagePlus size={20} />
								</div>
								<p className="font-bold text-xs text-foreground group-hover:text-primary">إضافة صور</p>
							</div>

						</div>

						{/* Hidden Input field */}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							multiple
							onChange={handleImageChange}
							className="hidden"
						/>
					</div>

					<ProgressBar isUploading={isSubmitting} />

					<StatusToggle
						active={formData.active}
						onChange={(checked) => setFormData({ ...formData, active: checked })}
						label="النشاط"
						description={`سيتم عرض ${getTotalImagesCount() > 0 ? "كل هذه الصور" : "هذه المجموعة"} على الموقع في صف واحد إذا كانت مفعلة`}
					/>

					<div className="flex items-center gap-4 pt-6 border-t border-border mt-auto">
						<button
							type="submit"
							disabled={isSubmitting}
							className="cursor-pointer flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30 disabled:opacity-50"
						>
							<Save size={20} />
							{isSubmitting ? 'جاري الحفظ...' : (editingGroup ? 'تعديل' : `حفظ`)}
						</button>
						<button
							type="button"
							onClick={() => setModalOpen(false)}
							className="cursor-pointer px-15 flex items-center justify-center gap-3 bg-red-500 text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30"
						>
							إلغاء
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default CustomPackageImageModal
