"use client"
import React, { useState } from 'react'
import { X, Plus, Trash2, CheckCircle2, Save } from 'lucide-react'
import StatusToggle from '../componanets/StatusToggle';

interface Option {
	pointAr: string;
	pointEn: string;
	price: number | '';
}

interface CustomPackageFormData {
	sectionNameAr: string;
	sectionNameEn: string;
	options: Option[];
	sort: number | '';
	active: boolean;
}

interface CustomPackageModalProps {
	setModalOpen: (open: boolean) => void;
	editingPackage: any | null;
	formData: CustomPackageFormData;
	setFormData: React.Dispatch<React.SetStateAction<CustomPackageFormData>>;
	handleSubmit: (e: React.FormEvent) => Promise<void>;
	setFeedbackModal: React.Dispatch<React.SetStateAction<{ isOpen: boolean, type: 'success' | 'error', message: string }>>;
}

const CustomPackageModal = ({ setModalOpen, editingPackage, formData, setFormData, handleSubmit, setFeedbackModal }: CustomPackageModalProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const newErrors: Record<string, string> = {};

		// Custom Validation
		if (!formData.sectionNameAr.trim()) newErrors.sectionNameAr = 'هذا الحقل مطلوب';
		if (!formData.sectionNameEn.trim()) newErrors.sectionNameEn = 'هذا الحقل مطلوب';
		if (formData.sort === undefined || formData.sort === null || formData.sort === '' || Number(formData.sort) < 1) {
			newErrors.sort = 'يجب أن يكون رقم الترتيب 1 أو أكبر';
		}

		if (formData.options.length === 0) {
			newErrors.options = 'برجاء إدخال نقطة واحدة على الأقل في هذا القسم';
		}

		for (let i = 0; i < formData.options.length; i++) {
			const opt = formData.options[i];
			if (!opt.pointAr.trim()) newErrors[`pointAr_${i}`] = 'مطلوب';
			if (!opt.pointEn.trim()) newErrors[`pointEn_${i}`] = 'مطلوب';
			if (opt.price === '') newErrors[`price_${i}`] = 'مطلوب';
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setIsSubmitting(true)
		setErrors({})
		try {
			await handleSubmit(e)
		} catch (error: any) {
			if (error.message && error.message.includes('رقم الترتيب هذا مستخدم بالفعل')) {
				setErrors({ sort: error.message })
			} else {
				setErrors({ global: error.message || 'حدث خطأ أثناء الحفظ' })
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleAddOption = () => {
		setFormData(prev => ({
			...prev,
			options: [...prev.options, { pointAr: '', pointEn: '', price: 0 }]
		}))
	}

	const handleRemoveOption = (index: number) => {
		setFormData(prev => {
			const newOptions = [...prev.options]
			newOptions.splice(index, 1)
			return { ...prev, options: newOptions }
		})
	}

	const handleOptionChange = (index: number, field: keyof Option, value: string | number) => {
		setFormData(prev => {
			const newOptions = [...prev.options]
			if (field === 'price') {
				newOptions[index][field] = value === '' ? '' : Number(value)
			} else {
				// @ts-ignore
				newOptions[index][field] = value
			}
			return { ...prev, options: newOptions }
		})
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
			dir="rtl"
		>
			<div
				className="bg-card w-full max-w-3xl rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
					<h3 className="text-xl font-bold flex items-center gap-2">
						{editingPackage ? 'تعديل القسم' : 'إضافة قسم جديد'}
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
					<form id="custom-package-form" onSubmit={onSubmit} className="space-y-6">
						{errors.global && <div className="p-4 bg-red-50/50 text-red-600 border border-red-200 rounded-xl text-sm font-bold">{errors.global}</div>}

						{/* Basic Info */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">اسم القسم (عربي)</label>
								<input
									type="text"
									value={formData.sectionNameAr}
									onChange={(e) => {
										if (errors.sectionNameAr) setErrors({ ...errors, sectionNameAr: '' });
										setFormData({ ...formData, sectionNameAr: e.target.value });
									}}
									className={`w-full bg-background border-1 ${errors.sectionNameAr ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl px-4 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
									placeholder="مثال: باقة التصوير"
								/>
								{errors.sectionNameAr && <p className="text-xs text-red-500 font-bold mt-1">{errors.sectionNameAr}</p>}
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-muted-foreground ml-1 block">اسم القسم (إنجليزي)</label>
								<input
									type="text"
									value={formData.sectionNameEn}
									onChange={(e) => {
										if (errors.sectionNameEn) setErrors({ ...errors, sectionNameEn: '' });
										setFormData({ ...formData, sectionNameEn: e.target.value });
									}}
									className={`w-full bg-background border-1 ${errors.sectionNameEn ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-xl px-4 py-3 outline-none focus:shadow-none transition-all text-sm font-black shadow-sm text-left`}
									placeholder="e.g: Photography Package"
									dir="ltr"
								/>
								{errors.sectionNameEn && <p className="text-xs text-red-500 font-bold mt-1">{errors.sectionNameEn}</p>}
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
							<div className="space-y-2 col-span-1 md:col-span-2 mt-2">
								<StatusToggle
									active={formData.active}
									onChange={(checked: boolean) => setFormData({ ...formData, active: checked })}
									label="حالة القسم"
									description="سيتم عرض هذا القسم على الموقع إذا كان مفعلا"
								/>
							</div>
						</div>

						{/* Options / Points */}
						<div className="mt-8 pt-6 border-t border-border">
							<div className="flex items-center justify-between mb-4">
								<h4 className="font-bold text-lg">النقاط أو الخيارات المتاحة</h4>
								<button
									type="button"
									onClick={handleAddOption}
									className="cursor-pointer flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
								>
									<Plus size={16} />
									<span className='hidden md:block'>إضافة نقطة جديدة</span>
									<span className='block md:hidden'>إضافة</span>
								</button>
							</div>

							{errors.options && <div className="p-3 bg-red-50/50 text-red-600 border border-red-200 rounded-xl text-sm font-bold text-center mb-4">{errors.options}</div>}

							<div className="space-y-4">
								{formData.options.length === 0 ? (
									<div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center">
										<p className="text-muted-foreground font-medium text-sm">لا توجد نقاط مضافة حالياً. أضف نقطة للبدء.</p>
									</div>
								) : (
									formData.options.map((option, index) => (
										<div key={index} className="flex flex-col md:flex-row gap-3 bg-muted/10 p-4 rounded-2xl border border-border items-start md:items-center relative group">
											<div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
												<div>
													<input
														type="text"
														value={option.pointAr}
														onChange={(e) => {
															if (errors[`pointAr_${index}`]) setErrors({ ...errors, [`pointAr_${index}`]: '' });
															handleOptionChange(index, 'pointAr', e.target.value);
														}}
														placeholder="وصف النقطة (عربي)"
														className={`w-full bg-background border-1 ${errors[`pointAr_${index}`] ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-lg px-3 py-2 text-sm outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
													/>
													{errors[`pointAr_${index}`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`pointAr_${index}`]}</p>}
												</div>
												<div>
													<input
														type="text"
														value={option.pointEn}
														onChange={(e) => {
															if (errors[`pointEn_${index}`]) setErrors({ ...errors, [`pointEn_${index}`]: '' });
															handleOptionChange(index, 'pointEn', e.target.value);
														}}
														placeholder="Point Description (EN)"
														className={`w-full bg-background border-1 ${errors[`pointEn_${index}`] ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-lg px-3 py-2 text-sm outline-none focus:shadow-none transition-all text-sm font-black shadow-sm text-left`}
														dir="ltr"
													/>
													{errors[`pointEn_${index}`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`pointEn_${index}`]}</p>}
												</div>
												<div>
													<div className="relative">
														<input
															type="number"
															min="0"
															value={option.price}
															onChange={(e) => {
																if (errors[`price_${index}`]) setErrors({ ...errors, [`price_${index}`]: '' });
																handleOptionChange(index, 'price', e.target.value);
															}}
															placeholder="السعر"
															className={`w-full bg-background border-1 ${errors[`price_${index}`] ? 'border-red-500 bg-red-50' : 'border-blue-500/70 focus:border-blue-500 focus:border'} rounded-lg pl-3 pr-10 py-2 text-sm outline-none focus:shadow-none transition-all text-sm font-black shadow-sm`}
														/>
														<span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold ml-1">EGP</span>
													</div>
													{errors[`price_${index}`] && <p className="text-[10px] text-red-500 font-bold mt-1">{errors[`price_${index}`]}</p>}
												</div>
											</div>
											<button
												type="button"
												onClick={() => handleRemoveOption(index)}
												className="w-10 h-10 mt-2 md:mt-0 flex shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all self-end md:self-auto"
												title="حذف النقطة"
											>
												<Trash2 size={16} />
											</button>
										</div>
									))
								)}
							</div>
						</div>
					</form>
				</div>

				{/* Modal Footer */}
				<div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center gap-4 shrink-0">
					<button
						type="submit"
						form="custom-package-form"
						disabled={isSubmitting}
						className="cursor-pointer flex-1 flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30 disabled:opacity-50"
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
						className="cursor-pointer px-15 flex items-center justify-center gap-3 bg-red-500 text-white py-4 rounded-2xl hover:opacity-95 active:scale-95 transition-all font-black shadow-xl shadow-primary/30"
					>
						إلغاء
					</button>
				</div>
			</div>
		</div>
	)
}

export default CustomPackageModal
