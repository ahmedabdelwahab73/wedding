import { Edit2, ImageIcon, Plus, Save, X, Upload } from 'lucide-react'
import Image from 'next/image'
import React, { useRef, useState, useEffect } from 'react'
import StatusToggle from '../componanets/StatusToggle';
import { compressImage } from '@/utils/imageUtils';
import ProgressBar from '../componanets/ProgressBar';

type IProps = {
	setModalOpen: (open: boolean) => void
	editingLogo: any
	formData: any
	setFormData: (data: any) => void
	handleSubmit: (e: React.FormEvent) => void
}

const LogoModal = ({ setModalOpen, editingLogo, formData, setFormData, handleSubmit }: IProps) => {
	const fileInputLightRef = useRef<HTMLInputElement>(null);
	const fileInputDarkRef = useRef<HTMLInputElement>(null);

	const [previewLight, setPreviewLight] = useState<string | null>(formData.imageLight || null);
	const [previewDark, setPreviewDark] = useState<string | null>(formData.imageDark || null);
	const [errors, setErrors] = useState<{ light?: string; dark?: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validateAndSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: { light?: string; dark?: string } = {};

		if (!formData.imageLight) {
			newErrors.light = 'يرجى اختيار صورة للوضع المضيء';
		}
		if (!formData.imageDark) {
			newErrors.dark = 'يرجى اختيار صورة للوضع المظلم';
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setErrors({});

		let retries = 3;
		let success = false;

		while (retries > 0 && !success) {
			setIsSubmitting(true);
			try {
				// We pass the event but we might need to handle the actual fetch here or ensure handleSubmit supports timeout
				// Since handleSubmit usually handles the fetch, we hope it throws the 'TIMEOUT' error we added to apiFetch
				await handleSubmit(e);
				success = true;
			} catch (error: any) {
				if (error.message === 'TIMEOUT' && retries > 1) {
					retries--;
					console.warn(`Upload timed out. Retrying... (${3 - retries}/3)`);
					setIsSubmitting(false); // Reset progress bar
					await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before retry
					continue;
				}
				// If not a timeout or no more retries
				setIsSubmitting(false);
				throw error;
			}
		}
		if (success) {
			setIsSubmitting(false);
			// Give the progress bar 800ms to show the 100% completion state before the modal/parent logic continues
			await new Promise(resolve => setTimeout(resolve, 800));
		} else {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (typeof formData.imageLight === 'string' && formData.imageLight.startsWith('http')) {
			setPreviewLight(formData.imageLight);
		} else if (typeof formData.imageLight === 'string' && formData.imageLight.startsWith('/uploads')) {
			setPreviewLight(`http://localhost:5000${formData.imageLight}`);
		}

		if (typeof formData.imageDark === 'string' && formData.imageDark.startsWith('http')) {
			setPreviewDark(formData.imageDark);
		} else if (typeof formData.imageDark === 'string' && formData.imageDark.startsWith('/uploads')) {
			setPreviewDark(`http://localhost:5000${formData.imageDark}`);
		}
	}, [formData.imageLight, formData.imageDark]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark') => {
		const file = e.target.files?.[0];
		if (file) {
			if (type === 'light') {
				setFormData({ ...formData, imageLight: file });
				setErrors(prev => ({ ...prev, light: undefined }));
				const reader = new FileReader();
				reader.onloadend = () => setPreviewLight(reader.result as string);
				reader.readAsDataURL(file);
			} else {
				setFormData({ ...formData, imageDark: file });
				setErrors(prev => ({ ...prev, dark: undefined }));
				const reader = new FileReader();
				reader.onloadend = () => setPreviewDark(reader.result as string);
				reader.readAsDataURL(file);
			}
		}
	};

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
		>
			<div
				className="relative bg-[#ffffff] border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-8 border-b border-border/50 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
							{editingLogo ? <Edit2 size={24} /> : <Plus size={24} />}
						</div>
						<div>
							<h3 className="text-xl font-black">{editingLogo ? 'تحديث اللوجو' : 'إضافة لوجو'}</h3>
							<p className="text-xs text-muted-foreground font-medium">أكمل البيانات التالية لحفظ التغييرات</p>
						</div>
					</div>
					<button
						onClick={() => setModalOpen(false)}
						className="cursor-pointer p-3 hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200/40 rounded-2xl transition-all max-h-[44px]">
						<X size={20} />
					</button>
				</div>

				<form onSubmit={validateAndSubmit} className="p-8 space-y-5 text-right">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-4">
							<label className="text-xs font-black text-muted-foreground/80 mr-1 uppercase tracking-wider">لوجو الوضع المضيء (Light)</label>
							<div
								onClick={() => fileInputLightRef.current?.click()}
								className="relative group cursor-pointer"
							>
								{/* Changed background from bg-gray-100 to bg-gray-300 to show white logos better */}
								<div className={`w-full aspect-video rounded-2xl border-2 border-dashed ${errors.light ? 'border-red-500 bg-red-50/50' : (previewLight ? 'border-primary/50' : 'border-border')} hover:border-primary transition-all overflow-hidden flex flex-col items-center justify-center bg-gray-300 dark:bg-gray-400`}>
									{previewLight ? (
										<>
											<Image
												src={previewLight}
												alt="Preview Light"
												width={200}
												height={100}
												className="w-full h-full object-contain p-4"
												unoptimized
											/>
											<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
												<Upload className="text-white w-8 h-8" />
											</div>
										</>
									) : (
										<div className={`flex flex-col items-center gap-2 ${errors.light ? 'text-red-500' : 'text-gray-600'} group-hover:text-primary transition-colors`}>
											<ImageIcon size={40} strokeWidth={1.5} />
											<span className="text-xs font-bold text-center">اضغط لاختيار<br />صورة اللوجو المضيء</span>
										</div>
									)}
								</div>
								{errors.light && (
									<p className="text-red-500 text-[10px] font-bold mt-2 pr-1">{errors.light}</p>
								)}
								<input
									type="file"
									ref={fileInputLightRef}
									onChange={(e) => handleFileChange(e, 'light')}
									accept="image/*"
									className="hidden"
								/>
							</div>
						</div>

						<div className="space-y-4">
							<label className="text-xs font-black text-muted-foreground/80 mr-1 uppercase tracking-wider">لوجو الوضع المظلم (Dark)</label>
							<div
								onClick={() => fileInputDarkRef.current?.click()}
								className="relative group cursor-pointer"
							>
								{/* Changed background from bg-gray-900 to bg-gray-700 to show dark/black logos better */}
								<div className={`w-full aspect-video rounded-2xl border-2 border-dashed ${errors.dark ? 'border-red-500 bg-red-50/50' : (previewDark ? 'border-primary/50' : 'border-border')} hover:border-primary transition-all overflow-hidden flex flex-col items-center justify-center bg-gray-700 dark:bg-gray-600`}>
									{previewDark ? (
										<>
											<Image
												src={previewDark}
												alt="Preview Dark"
												width={200}
												height={100}
												className="w-full h-full object-contain p-4"
												unoptimized
											/>
											<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
												<Upload className="text-white w-8 h-8" />
											</div>
										</>
									) : (
										<div className={`flex flex-col items-center gap-2 ${errors.dark ? 'text-red-500' : 'text-gray-300'} group-hover:text-primary transition-colors`}>
											<ImageIcon size={40} strokeWidth={1.5} />
											<span className="text-xs font-bold text-center">اضغط لاختيار<br />صورة اللوجو المظلم</span>
										</div>
									)}
								</div>
								{errors.dark && (
									<p className="text-red-500 text-[10px] font-bold mt-2 pr-1">{errors.dark}</p>
								)}
								<input
									type="file"
									ref={fileInputDarkRef}
									onChange={(e) => handleFileChange(e, 'dark')}
									accept="image/*"
									className="hidden"
								/>
							</div>
						</div>
					</div>

					<ProgressBar isUploading={isSubmitting} />

					<StatusToggle
						active={formData.active}
						onChange={(checked) => setFormData({ ...formData, active: checked ? 1 : 0 })}
						label="حالة الظهور"
						description="سيتم عرض هذا اللوجو على الموقع إذا كان مفعلاً"
					/>

					<div className="pt-6 flex items-center gap-4 border-t border-border mt-6">
						<button
							type="submit"
							disabled={isSubmitting}
							className="cursor-pointer flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30 disabled:opacity-50"
						>
							<Save size={20} />
							{isSubmitting ? 'جاري الحفظ...' : (editingLogo ? 'حفظ التعديلات' : 'إضافة الآن')}
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

export default LogoModal
