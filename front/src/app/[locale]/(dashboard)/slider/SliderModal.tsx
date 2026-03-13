import { Edit2, ImageIcon, Plus, Save, X, Upload } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import StatusToggle from '../componanets/StatusToggle';
import { compressImage } from '@/utils/imageUtils';
import ProgressBar from '../componanets/ProgressBar';

type IProps = {
	setModalOpen: (open: boolean) => void
	editingSlider: any
	formData: any
	setFormData: (data: any) => void
	handleSubmit: (e: React.FormEvent) => Promise<void>
	serverErrors?: Record<string, string>
	setServerErrors?: (errors: Record<string, string>) => void
}

const SliderModal = ({ setModalOpen, editingSlider, formData, setFormData, handleSubmit, serverErrors = {}, setServerErrors }: IProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [retryMessage, setRetryMessage] = useState('');

	useEffect(() => {
		if (typeof formData.image === 'string' && formData.image.startsWith('http')) {
			setPreviewUrl(formData.image);
		} else if (typeof formData.image === 'string' && formData.image.startsWith('/uploads')) {
			setPreviewUrl(`http://localhost:5000${formData.image}`);
		} else {
			setPreviewUrl(null); // Clear preview if image is not a valid URL or path
		}
	}, [formData.image]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({ ...formData, image: file });
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewUrl(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
			/>
			<div className="relative bg-[#ffffff] border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
				<div className="p-8 border-b border-border/50 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
							{editingSlider ? <Edit2 size={24} /> : <Plus size={24} />}
						</div>
						<div>
							<h3 className="text-xl font-black">{editingSlider ? 'تحديث السلايدر' : 'إضافة سلايدر جديد'}</h3>
							<p className="text-xs text-muted-foreground font-medium">أكمل البيانات التالية لحفظ التغييرات</p>
						</div>
					</div>
					<button
						onClick={() => setModalOpen(false)}
						className="cursor-pointer p-3 hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200/40 rounded-2xl transition-all max-h-[44px]"
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={async (e) => {
					e.preventDefault();
					if (formData.sort === undefined || formData.sort === null || formData.sort === '' || Number(formData.sort) < 1) {
						setErrors({ sort: 'يجب أن يكون رقم الترتيب 1 أو أكبر' });
						return;
					}
					setErrors({});

					let retries = 3;
					let success = false;

					while (retries > 0 && !success) {
						setIsSubmitting(true);
						try {
							await handleSubmit(e);
							success = true;
							setRetryMessage('');
						} catch (error: any) {
							const errorMsg = error.message || '';
							const isTimeout = errorMsg === 'TIMEOUT' || errorMsg === 'Request Timeout' || errorMsg.includes('Timeout');

							if (isTimeout && retries > 1) {
								retries--;
								setRetryMessage(`فشلت العملية لزيادة وقت التحميل، جاري المحاولة مرة أخرى... (محاولة ${4 - retries} من 3)`);
								console.warn(`Slider upload timed out. Retrying... (${3 - retries}/3)`);
								setIsSubmitting(false); // Reset progress bar
								await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before retry
								continue;
							}
							setIsSubmitting(false);
							setRetryMessage('');
							// handleSubmit in parent might already show a modal, but we re-throw to stop the loop
							throw error;
						}
						if (success) {
							setIsSubmitting(false);
							// Give the progress bar 800ms for completion animation before closing
							await new Promise(resolve => setTimeout(resolve, 800));
						} else {
							setIsSubmitting(false);
						}
					}
				}} className="p-8 space-y-5 text-right">
					<div className="space-y-2">
						<label className="text-xs font-black text-muted-foreground/80 mr-1 uppercase tracking-wider">صورة السلايدر</label>
						<div
							onClick={() => fileInputRef.current?.click()}
							className="relative group cursor-pointer"
						>
							<div className={`w-full aspect-video rounded-2xl border-2 border-dashed ${previewUrl ? 'border-blue-500/50' : 'border-blue-500/20'} hover:border-blue-500 transition-all overflow-hidden flex flex-col items-center justify-center bg-background/50`}>
								{previewUrl ? (
									<>
										<img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<Upload className="text-white w-8 h-8" />
										</div>
									</>
								) : (
									<div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
										<ImageIcon size={40} strokeWidth={1.5} />
										<span className="text-xs font-bold">اضغط لاختيار صورة</span>
									</div>
								)}
							</div>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								accept="image/*"
								className="hidden"
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-5">
						<div className="space-y-2">
							<label className="text-xs font-black text-muted-foreground/80 mr-1 uppercase tracking-wider">ترتيب العرض</label>
							<input
								type="number"
								value={formData.sort ?? ''}
								onChange={(e) => {
									if (errors.sort) setErrors({ ...errors, sort: '' })
									if (setServerErrors) setServerErrors({ ...serverErrors, sort: '' })
									setFormData({ ...formData, sort: e.target.value ? parseInt(e.target.value) : '' })
								}}
								className={`w-full bg-background border-1 ${errors.sort || serverErrors.sort ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-2xl px-5 py-3.5 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
							/>
							{(errors.sort || serverErrors.sort) && <p className="text-xs text-red-500 font-bold mt-1">{errors.sort || serverErrors.sort}</p>}
						</div>
					</div>

					<ProgressBar isUploading={isSubmitting} />
					{retryMessage && <p className="text-xs text-amber-600 font-bold text-center animate-pulse">{retryMessage}</p>}

					<StatusToggle
						active={formData.active}
						onChange={(checked) => setFormData({ ...formData, active: checked ? 1 : 0 })}
						label="حالة الظهور"
						description="سيتم عرض هذا السلايدر على الموقع إذا كان مفعلاً"
					/>

					<div className="pt-6 flex items-center gap-4">
						<button
							type="submit"
							disabled={isSubmitting}
							className="cursor-pointer flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30 disabled:opacity-50"
						>
							<Save size={20} />
							{isSubmitting ? 'جاري الحفظ...' : (editingSlider ? 'حفظ التعديلات' : 'إضافة')}
						</button>
						<button
							type="button"
							onClick={() => setModalOpen(false)}
							className="cursor-pointer px-15 flex items-center justify-center 
							gap-3 bg-red-500 text-white py-4 rounded-2xl hover:opacity-95 
							active:scale-95 transition-all font-black shadow-xl shadow-primary/30"
						>
							إلغاء
						</button>
					</div>
				</form>
			</div >
		</div >
	)
}

export default SliderModal
