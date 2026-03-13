"use client"
import React, { useState } from 'react'
import { X, Plus, Trash2, CheckCircle2, ImageIcon, UploadCloud, Save } from 'lucide-react'
import StatusToggle from '../componanets/StatusToggle';
import { compressImage } from '@/utils/imageUtils';
import ProgressBar from '../componanets/ProgressBar';

interface PackageModalProps {
	setModalOpen: (open: boolean) => void;
	editingPackage: any | null;
	formData: any;
	setFormData: React.Dispatch<React.SetStateAction<any>>;
	handleSubmit: (e: React.FormEvent) => Promise<void> | void;
}

const PackageModal = ({ setModalOpen, editingPackage, formData, setFormData, handleSubmit }: PackageModalProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [retryMessage, setRetryMessage] = useState('')
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validateForm = () => {
		const newErrors: Record<string, string> = {}
		if (!formData['name-ar'] || formData['name-ar'].trim() === '') newErrors['name-ar'] = 'هذا الحقل مطلوب'
		if (!formData['name-en'] || formData['name-en'].trim() === '') newErrors['name-en'] = 'هذا الحقل مطلوب'
		if (!formData['subname-en'] || formData['subname-en'].trim() === '') newErrors['subname-en'] = 'هذا الحقل مطلوب'

		const sortValue = Number(formData.sort);
		if (formData.sort === undefined || formData.sort === null || String(formData.sort).trim() === '') {
			newErrors.sort = 'هذا الحقل مطلوب'
		} else if (isNaN(sortValue) || sortValue < 1) {
			newErrors.sort = 'يجب أن يكون رقم الترتيب 1 أو أكبر'
		}

		const priceStr = String(formData.price ?? '').trim();
		if (priceStr === '') {
			newErrors.price = 'هذا الحقل مطلوب';
		} else if (isNaN(Number(priceStr)) || Number(priceStr) <= 0) {
			newErrors.price = 'يجب أن يكون السعر أكبر من صفر';
		}

		const offerStr = String(formData.offer ?? '').trim();
		if (offerStr !== '' && (isNaN(Number(offerStr)) || Number(offerStr) < 0)) {
			newErrors.offer = 'يجب أن يكون رقماً صحيحاً';
		}

		const rateStr = String(formData.rate ?? '').trim();
		if (rateStr !== '' && (isNaN(Number(rateStr)) || !Number.isInteger(Number(rateStr)) || Number(rateStr) < 0 || Number(rateStr) > 5)) {
			newErrors.rate = 'يجب أن يكون التقييم رقماً صحيحاً بين 0 و 5';
		}

		const pointArs = formData['point-ar'] || []
		const pointEns = formData['point-en'] || []
		const maxPoints = Math.max(pointArs.length, pointEns.length)

		let hasValidAr = false;
		let hasValidEn = false;

		for (let i = 0; i < maxPoints; i++) {
			if (!pointArs[i] || pointArs[i].trim() === '') newErrors[`point-ar-${i}`] = 'هذا الحقل مطلوب'
			else hasValidAr = true;

			if (!pointEns[i] || pointEns[i].trim() === '') newErrors[`point-en-${i}`] = 'هذا الحقل مطلوب'
			else hasValidEn = true;
		}

		if (maxPoints === 0 || (!hasValidAr && !hasValidEn)) {
			// user didn't even try to add a valid point
			newErrors.features = 'عذراً، يجب إضافة مميزة واحدة على الأقل باللغتين العربية والإنجليزية.';
		}

		const totalImages = (formData.images?.length || 0) + (formData.newGalleryFiles?.length || 0);
		if (totalImages > 50) {
			newErrors.gallery = 'عذراً، لا يمكن أن يتجاوز عدد صور معرض الصور 50 صورة. يرجى حذف بعض الصور أولاً.';
		}

		if (Number(offerStr) > 0 && Number(offerStr) >= Number(priceStr)) {
			newErrors.offer = 'عذراً، يجب أن يكون مبلغ العرض (الخصم) أقل من سعر الباقة الأصلي.';
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validateForm()) return;

		let retries = 3;
		let success = false;

		while (retries > 0 && !success) {
			setIsSubmitting(true)
			try {
				await handleSubmit(e)
				success = true;
				setRetryMessage('');
			} catch (error: any) {
				const errorMsg = error.message || '';
				const isTimeout = errorMsg === 'TIMEOUT' || errorMsg === 'Request Timeout' || errorMsg.includes('Timeout');

				if (isTimeout && retries > 1) {
					retries--;
					setRetryMessage(`فشلت العملية لزيادة وقت التحميل، جاري المحاولة مرة أخرى... (محاولة ${4 - retries} من 3)`);
					console.warn(`Package upload timed out. Retrying... (${3 - retries}/3)`);
					setIsSubmitting(false); // Reset progress bar
					await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before retry
					continue;
				}
				setIsSubmitting(false)
				setRetryMessage('');
				if (error.message && error.message.includes('رقم الترتيب هذا مستخدم بالفعل')) {
					setErrors(prev => ({ ...prev, sort: error.message }))
				} else if (!isTimeout) {
					alert(error.message || 'حدث خطأ أثناء الحفظ')
				}
				throw error;
			}
		}
		if (success) {
			setIsSubmitting(false)
			// Give the progress bar 800ms for completion animation before closing the modal
			await new Promise(resolve => setTimeout(resolve, 800));
		} else {
			setIsSubmitting(false)
		}
	}

	const handleAddPoint = () => {
		setFormData((prev: any) => ({
			...prev,
			'point-ar': [...(prev['point-ar'] || []), ''],
			'point-en': [...(prev['point-en'] || []), '']
		}))
	}

	const handleRemovePoint = (index: number) => {
		setFormData((prev: any) => {
			const newPointAr = [...(prev['point-ar'] || [])]
			const newPointEn = [...(prev['point-en'] || [])]
			newPointAr.splice(index, 1)
			newPointEn.splice(index, 1)
			return { ...prev, 'point-ar': newPointAr, 'point-en': newPointEn }
		})
	}

	const handlePointChange = (index: number, lang: 'ar' | 'en', value: string) => {
		setFormData((prev: any) => {
			const key = `point-${lang}`;
			const newArray = [...(prev[key] || [])];
			// Ensure array is large enough
			while (newArray.length <= index) {
				newArray.push('');
			}
			newArray[index] = value;
			return { ...prev, [key]: newArray }
		})
	}

	const pointsCount = Math.max(formData['point-ar']?.length || 0, formData['point-en']?.length || 0)

	const getImageUrl = (img: string | File) => {
		if (img instanceof File) return URL.createObjectURL(img);
		if (typeof img === 'string' && img.startsWith('/uploads')) return `http://localhost:5000${img}`;
		return img || '';
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
			dir="rtl"
		>
			<div
				className="bg-[#ffffff] w-full max-w-4xl rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
					<h3 className="text-xl font-bold flex items-center gap-2">
						{editingPackage ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
					</h3>
					<button
						onClick={() => setModalOpen(false)}
						className="cursor-pointer p-3 hover:bg-red-100 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-200/40 rounded-2xl transition-all max-h-[44px]"
					>
						<X size={20} />
					</button>
				</div>

				{/* Modal Body */}
				<div className="p-6 overflow-y-auto custom-scrollbar flex-1">
					<form id="package-form" onSubmit={onSubmit} className="space-y-6">
						{/* Basic Info */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">اسم الباقة (عربي)</label>
								<input
									type="text"
									value={formData['name-ar'] || ''}
									onChange={(e) => {
										if (errors['name-ar']) setErrors({ ...errors, 'name-ar': '' })
										setFormData({ ...formData, 'name-ar': e.target.value })
									}}
									className={`w-full bg-background border-1 ${errors['name-ar'] ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl px-4 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
									placeholder="مثال: الباقة الأساسية"
								/>
								{errors['name-ar'] && <p className="text-xs text-red-500 font-bold mt-1">{errors['name-ar']}</p>}
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">اسم الباقة (إنجليزي)</label>
								<input
									type="text"
									value={formData['name-en'] || ''}
									onChange={(e) => {
										if (errors['name-en']) setErrors({ ...errors, 'name-en': '' })
										setFormData({ ...formData, 'name-en': e.target.value })
									}}
									className={`w-full bg-background border-1 ${errors['name-en'] ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl px-4 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm text-left`}
									placeholder="e.g: Basic Package"
									dir="ltr"
								/>
								{errors['name-en'] && <p className="text-xs text-red-500 font-bold mt-1">{errors['name-en']}</p>}
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">الاسم الفرعي (عربي)</label>
								<input
									type="text"
									value={formData['subname-ar'] || ''}
									onChange={(e) => {
										if (errors['subname-ar']) setErrors({ ...errors, 'subname-ar': '' })
										setFormData({ ...formData, 'subname-ar': e.target.value })
									}}
									className={`w-full bg-background border-1 ${errors['subname-ar'] ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl px-4 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
									placeholder="مثال: للتصوير"
								/>
								{errors['subname-ar'] && <p className="text-xs text-red-500 font-bold mt-1">{errors['subname-ar']}</p>}
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">الاسم الفرعي (إنجليزي)</label>
								<input
									type="text"
									value={formData['subname-en'] || ''}
									onChange={(e) => {
										if (errors['subname-en']) setErrors({ ...errors, 'subname-en': '' })
										setFormData({ ...formData, 'subname-en': e.target.value })
									}}
									className={`w-full bg-background border-1 ${errors['subname-en'] ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl px-4 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm text-left`}
									placeholder="e.g: for photography"
									dir="ltr"
								/>
								{errors['subname-en'] && <p className="text-xs text-red-500 font-bold mt-1">{errors['subname-en']}</p>}
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">رقم الباكدج</label>
								<input
									type="text"
									value={formData.number || ''}
									onChange={(e) => {
										if (errors.number) setErrors({ ...errors, number: '' })
										setFormData({ ...formData, number: e.target.value })
									}}
									className={`w-full bg-background border-1 ${errors.number ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl px-4 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
									placeholder="مثال: 5 جلسات أو غير محدود"
								/>
								{errors.number && <p className="text-xs text-red-500 font-bold mt-1">{errors.number}</p>}
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">الترتيب</label>
								<input
									type="number"
									value={formData.sort ?? ''}
									onChange={(e) => {
										if (errors.sort) setErrors({ ...errors, sort: '' })
										setFormData({ ...formData, sort: e.target.value ? parseInt(e.target.value) : '' })
									}}
									className={`w-full bg-background border-1 ${errors.sort ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl px-4 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
								/>
								{errors.sort && <p className="text-xs text-red-500 font-bold mt-1">{errors.sort}</p>}
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">السعر</label>
								<div className="relative">
									<input
										type="text"
										value={formData.price || ''}
										onChange={(e) => {
											if (errors.price) setErrors({ ...errors, price: '' })
											setFormData({ ...formData, price: e.target.value })
										}}
										className={`w-full bg-background border-1 ${errors.price ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl pl-4 pr-12 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
									/>
									<span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">EGP</span>
								</div>
								{errors.price && <p className="text-xs text-red-500 font-bold mt-1">{errors.price}</p>}
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">الخصم (الرقم المخصوم)</label>
								<div className="relative">
									<input
										type="text"
										value={formData.offer || ''}
										onChange={(e) => {
											if (errors.offer) setErrors({ ...errors, offer: '' })
											setFormData({ ...formData, offer: e.target.value })
										}}
										className={`w-full bg-background border-1 ${errors.offer ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl pl-4 pr-12 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
									/>
									<span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">EGP</span>
								</div>
								{errors.offer && <p className="text-xs text-red-500 font-bold mt-1">{errors.offer}</p>}
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
								<div className="space-y-2">
									<label className="text-sm font-bold text-muted-foreground ml-1 block">التقييم (0-5)</label>
									<div className="relative">
										<input
											type="number"
											step="1"
											min="0"
											max="5"
											value={formData.rate ?? ''}
											onChange={(e) => {
												if (errors.rate) setErrors({ ...errors, rate: '' })
												setFormData({ ...formData, rate: e.target.value ? parseInt(e.target.value) : '' })
											}}
											className={`w-full bg-background border-1 ${errors.rate ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl px-4 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
											placeholder="مثال: 5"
										/>
									</div>
									{errors.rate && <p className="text-xs text-red-500 font-bold mt-1">{errors.rate}</p>}
								</div>
								<div className="flex items-center">
									<StatusToggle
										active={formData.mostseller}
										onChange={(checked: boolean) => setFormData({ ...formData, mostseller: checked ? 1 : 0 })}
										label="الأكثر طلباً"
										description="تحديد الباقة كأحد الخيارات الأكثر طلباً"
									/>
								</div>
							</div>
							<div className="space-y-2 col-span-1 md:col-span-2">
								<StatusToggle
									active={formData.active}
									onChange={(checked: boolean) => setFormData({ ...formData, active: checked ? 1 : 0 })}
									label="حالة الباقة"
									description="سيتم عرض هذه الباقة على الموقع إذا كانت مفعلة"
								/>
							</div>
						</div>

						{/* Images Section */}
						<div className="mt-8 pt-6 border-t border-border space-y-6">
							<h4 className="font-bold text-lg">الصور</h4>

							<div className="space-y-3">
								<label className="text-sm font-bold text-muted-foreground block">الصورة الرئيسية للباقة</label>
								<div className="flex items-center gap-4">
									{formData.default_image && (
										<img
											src={getImageUrl(formData.default_image)}
											alt="Default"
											className="w-16 h-16 rounded-xl object-cover border border-border"
										/>
									)}
									<label className="cursor-pointer flex-1 border-2 border-dashed border-blue-500/20 hover:border-blue-600 rounded-xl p-4 flex items-center justify-center transition-colors">
										<div className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary">
											<UploadCloud size={24} />
											<span className="text-sm font-bold">رفع صورة جديدة</span>
										</div>
										<input
											type="file"
											accept="image/*"
											className="hidden"
											onChange={(e) => {
												if (e.target.files && e.target.files[0]) {
													setFormData({ ...formData, default_image: e.target.files[0] });
												}
											}}
										/>
									</label>
								</div>
							</div>

							<div className="space-y-3">
								<label className="text-sm font-bold text-muted-foreground block">معرض الصور (بحد أقصى 50 صورة)</label>
								{errors.gallery && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-200">{errors.gallery}</div>}
								<div className="flex flex-wrap gap-4 mb-4">
									{(formData.images || []).map((img: string, i: number) => (
										<div key={`exist-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
											<img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
											<button
												type="button"
												onClick={() => {
													const newImages = [...formData.images]
													newImages.splice(i, 1)
													setFormData({ ...formData, images: newImages, deletedImages: [...(formData.deletedImages || []), img] })
												}}
												className="absolute inset-0 bg-red-500/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<Trash2 size={20} />
											</button>
										</div>
									))}
									{(formData.newGalleryFiles || []).map((file: File, i: number) => (
										<div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
											<img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
											<button
												type="button"
												onClick={() => {
													const newFiles = [...formData.newGalleryFiles]
													newFiles.splice(i, 1)
													setFormData({ ...formData, newGalleryFiles: newFiles })
												}}
												className="absolute inset-0 bg-red-500/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<Trash2 size={20} />
											</button>
										</div>
									))}
								</div>
								<label className="cursor-pointer border-2 border-dashed border-blue-500/20 hover:border-blue-600 rounded-xl p-6 flex items-center justify-center transition-colors">
									<div className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary">
										<ImageIcon size={32} />
										<span className="text-sm font-bold">إضافة صور للمعرض</span>
									</div>
									<input
										type="file"
										accept="image/*"
										multiple
										className="hidden"
										onChange={(e) => {
											if (e.target.files) {
												const filesArray = Array.from(e.target.files);
												setFormData({
													...formData,
													newGalleryFiles: [...(formData.newGalleryFiles || []), ...filesArray]
												});
											}
										}}
									/>
								</label>
							</div>
						</div>

						{/* Options / Points */}
						<div className="mt-8 pt-6 border-t border-border">
							<div className="flex items-center justify-between mb-4">
								<h4 className="font-bold text-lg">المميزات (النقاط)</h4>
								<button
									type="button"
									onClick={handleAddPoint}
									className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
								>
									<Plus size={16} />
									<span className='hidden md:block'>إضافة ميزة جديدة</span>
									<span className='block md:hidden'>إضافة</span>
								</button>
							</div>

							{errors.features && (
								<div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold mb-4 border border-red-200">
									{errors.features}
								</div>
							)}

							<div className="space-y-4">
								{pointsCount === 0 ? (
									<div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
										<p className="text-muted-foreground font-medium text-sm">لا توجد مميزات مضافة حالياً. أضف ميزة للبدء.</p>
									</div>
								) : (
									Array.from({ length: pointsCount }).map((_, index) => {
										const valAr = formData['point-ar']?.[index] || '';
										const valEn = formData['point-en']?.[index] || '';
										return (
											<div key={index} className="flex flex-col md:flex-row gap-3 bg-muted/10 p-4 rounded-2xl border border-border items-start md:items-center relative group">
												<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
													<div className="w-full">
														<input
															type="text"
															value={valAr}
															onChange={(e) => {
																handlePointChange(index, 'ar', e.target.value)
																if (errors[`point-ar-${index}`]) setErrors({ ...errors, [`point-ar-${index}`]: '' })
															}}
															placeholder="وصف الميزة (عربي)"
															className={`w-full bg-background border-1 ${errors[`point-ar-${index}`] ? 'border-red-500 focus:border-red-500' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-lg px-3 py-2 text-sm outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
														/>
														{errors[`point-ar-${index}`] && <span className="text-red-500 text-xs font-bold mt-1 block">{errors[`point-ar-${index}`]}</span>}
													</div>
													<div className="w-full">
														<input
															type="text"
															value={valEn}
															onChange={(e) => {
																handlePointChange(index, 'en', e.target.value)
																if (errors[`point-en-${index}`]) setErrors({ ...errors, [`point-en-${index}`]: '' })
															}}
															placeholder="Feature Description (EN)"
															className={`w-full bg-background border-1 ${errors[`point-en-${index}`] ? 'border-red-500 focus:border-red-500' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-lg px-3 py-2 text-sm outline-none focus:shadow-none transition-all text-sm font-black shadow-sm text-left`}
															dir="ltr"
														/>
														{errors[`point-en-${index}`] && <span className="text-red-500 text-xs font-bold mt-1 block">{errors[`point-en-${index}`]}</span>}
													</div>
												</div>
												<button
													type="button"
													onClick={() => handleRemovePoint(index)}
													className="w-10 h-10 mt-2 md:mt-0 flex shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all self-end md:self-auto"
													title="حذف الميزة"
												>
													<Trash2 size={16} />
												</button>
											</div>
										)
									})
								)}
							</div>
						</div>

						<ProgressBar isUploading={isSubmitting} />
						{retryMessage && <p className="text-xs text-amber-600 font-bold text-center animate-pulse">{retryMessage}</p>}
					</form>
				</div>

				{/* Modal Footer */}
				<div className="px-6 py-5 border-t border-border bg-muted/10 flex flex-col md:flex-row items-stretch md:items-center gap-3 z-10 shrink-0">
					<button
						type="submit"
						form="package-form"
						disabled={isSubmitting}
						className="cursor-pointer flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30 disabled:opacity-50 w-full md:w-auto"
					>
						{isSubmitting ? (
							<span className="animate-pulse">جاري الحفظ...</span>
						) : (
							<>
								<Save size={20} />
								حفظ التغييرات
							</>
						)}
					</button>
					<button
						type="button"
						onClick={() => setModalOpen(false)}
						className="cursor-pointer flex-1 md:flex-none md:px-15 flex items-center justify-center gap-3 bg-red-500 text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30 w-full md:w-auto"
					>
						إلغاء
					</button>
				</div>
			</div>
		</div>
	)
}

export default PackageModal
